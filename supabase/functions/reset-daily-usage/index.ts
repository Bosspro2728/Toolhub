import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// This function will be triggered by a cron job to reset daily usage counts
Deno.serve(async (req) => {
  try {
    // Check for secret key to ensure this is called securely
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get all user feature usage records
    const { data: usageRecords, error: fetchError } = await supabase
      .from('user_feature_usage')
      .select('*');

    if (fetchError) {
      console.error('Error fetching usage records:', fetchError);
      throw new Error('Failed to fetch usage records');
    }

    console.log(`Found ${usageRecords?.length || 0} usage records to process`);

    // Get current date in UTC
    const now = new Date();
    const resetDate = now.toISOString();

    // Reset all daily counts to zero
    const { error: updateError } = await supabase
      .from('user_feature_usage')
      .update({
        ai_chat_daily_count: 0,
        text_humanizer_daily_count: 0,
        ai_detection_daily_count: 0,
        translation_daily_count: 0,
        text_to_speech_daily_count: 0,
        seo_analyzer_daily_count: 0,
        code_snippets_daily_count: 0,
        document_view_daily_count: 0,
        file_conversion_daily_count: 0,
        media_conversion_daily_count: 0,
        url_shortener_daily_count: 0,
        last_reset: resetDate,
        updated_at: resetDate
      });

    if (updateError) {
      console.error('Error resetting usage counts:', updateError);
      throw new Error('Failed to reset usage counts');
    }

    console.log('Successfully reset all daily usage counts');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Daily usage counts reset successfully',
        timestamp: resetDate,
        records_processed: usageRecords?.length || 0
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in reset-daily-usage function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});