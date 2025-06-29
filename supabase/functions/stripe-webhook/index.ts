import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'ToolHub Integration',
    version: '1.0.0',
  },
});

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async (req) => {
  try {
    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { 
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        }
      });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Get the signature from the header
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('No signature found in request headers');
      return new Response('No signature found', { status: 400 });
    }

    // Get the raw body
    const body = await req.text();

    // Verify the webhook signature
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
      console.log(`Webhook verified successfully: ${event.type}`);
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400 });
    }

    // Process the event asynchronously
    EdgeRuntime.waitUntil(handleEvent(event));

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleEvent(event: Stripe.Event) {
  console.log(`Processing Stripe event: ${event.type}`);
  
  const stripeData = event?.data?.object ?? {};

  if (!stripeData) {
    console.log('No stripe data found in event');
    return;
  }

  try {
    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = stripeData as Stripe.Checkout.Session;
      console.log('Checkout session completed:', {
        session_id: session.id,
        customer: session.customer,
        client_reference_id: session.client_reference_id,
        mode: session.mode,
        payment_status: session.payment_status
      });
      
      const { customer: customerId, client_reference_id: userId, mode, payment_status } = session;
      
      // Create or update customer mapping if we have both customer and user ID
      if (customerId && userId && typeof customerId === 'string' && typeof userId === 'string') {
        console.log(`Creating/updating customer mapping: user_id=${userId}, customer_id=${customerId}`);
        
        const { error: customerError } = await supabase
          .from('stripe_customers')
          .upsert({
            user_id: userId,
            customer_id: customerId,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          });

        if (customerError) {
          console.error('Error creating customer mapping:', customerError);
        } else {
          console.log(`Successfully created/updated customer mapping for user ${userId}`);
        }
      }

      // Handle different checkout modes
      if (mode === 'subscription') {
        console.log(`Processing subscription checkout for customer: ${customerId}`);
        await syncCustomerFromStripe(customerId as string);
      } else if (mode === 'payment' && payment_status === 'paid') {
        console.log(`Processing one-time payment for customer: ${customerId}`);
        await handleOneTimePayment(session);
      }
      
      return;
    }

    // Skip payment_intent.succeeded for one-time payments (handled in checkout.session.completed)
    if (event.type === 'payment_intent.succeeded' && event.data.object.invoice === null) {
      console.log('Skipping payment_intent.succeeded for one-time payment (handled in checkout.session.completed)');
      return;
    }

    // Handle subscription-related events
    if (event.type.startsWith('customer.subscription.') || event.type.startsWith('invoice.')) {
      const { customer: customerId } = stripeData;

      if (!customerId || typeof customerId !== 'string') {
        console.error(`No customer ID found in event: ${event.type}`);
        return;
      }

      console.log(`Processing subscription event ${event.type} for customer: ${customerId}`);
      await syncCustomerFromStripe(customerId);
    }

  } catch (error) {
    console.error(`Error handling event ${event.type}:`, error);
    throw error;
  }
}

async function handleOneTimePayment(session: Stripe.Checkout.Session) {
  try {
    const {
      id: checkout_session_id,
      payment_intent,
      customer: customerId,
      amount_subtotal,
      amount_total,
      currency,
      payment_status,
    } = session;

    console.log('Processing one-time payment:', {
      session_id: checkout_session_id,
      customer_id: customerId,
      amount_total,
      payment_status
    });

    // Insert the order into the stripe_orders table
    const { error: orderError } = await supabase.from('stripe_orders').insert({
      checkout_session_id,
      payment_intent_id: payment_intent as string,
      customer_id: customerId as string,
      amount_subtotal: amount_subtotal || 0,
      amount_total: amount_total || 0,
      currency: currency || 'usd',
      payment_status: payment_status || 'paid',
      status: 'completed',
    });

    if (orderError) {
      console.error('Error inserting order:', orderError);
      throw orderError;
    }
    
    console.log(`Successfully processed one-time payment for session: ${checkout_session_id}`);
  } catch (error) {
    console.error('Error processing one-time payment:', error);
    throw error;
  }
}

async function syncCustomerFromStripe(customerId: string) {
  console.log(`Syncing customer subscription data for: ${customerId}`);
  
  try {
    // Fetch latest subscription data from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    console.log(`Found ${subscriptions.data.length} subscriptions for customer ${customerId}`);

    if (subscriptions.data.length === 0) {
      console.log(`No subscriptions found for customer: ${customerId}, setting status to not_started`);
      
      const { error: noSubError } = await supabase.from('stripe_subscriptions').upsert(
        {
          customer_id: customerId,
          status: 'not_started',
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'customer_id',
        },
      );

      if (noSubError) {
        console.error('Supabase upsert error (no subscription):', noSubError);
        throw new Error('Failed to update subscription status in database');
      }
      return;
    }

    // Get the most recent subscription
    const subscription = subscriptions.data[0];
    
    console.log('Syncing subscription data:', {
      subscription_id: subscription.id,
      status: subscription.status,
      price_id: subscription.items.data[0]?.price?.id,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end
    });

    // Prepare subscription data for database
    const subscriptionData = {
      customer_id: customerId,
      subscription_id: subscription.id,
      price_id: subscription.items.data[0]?.price?.id || null,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      status: subscription.status as any, // Cast to enum type
      updated_at: new Date().toISOString(),
      ...(subscription.default_payment_method && typeof subscription.default_payment_method !== 'string'
        ? {
            payment_method_brand: subscription.default_payment_method.card?.brand ?? null,
            payment_method_last4: subscription.default_payment_method.card?.last4 ?? null,
          }
        : {}),
    };

    console.log('Upserting subscription data to database:', subscriptionData);

    const { error: subError } = await supabase.from('stripe_subscriptions').upsert(
      subscriptionData,
      {
        onConflict: 'customer_id',
      },
    );

    if (subError) {
      console.error('Supabase upsert error:', subError);
      throw new Error('Failed to sync subscription in database');
    }
    
    console.log(`Successfully synced subscription for customer: ${customerId}`);
  } catch (error) {
    console.error(`Failed to sync subscription for customer ${customerId}:`, error);
    throw error;
  }
}