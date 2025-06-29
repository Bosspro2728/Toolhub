"use client";
import { PageHeader } from '@/components/shared/page-header';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageSquare, Phone, MapPin } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

const supabase = createClient();

export default function ContactPage() {
  const [userEmail, setUserEmail] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [formType, setFormType] = useState<'contact' | 'feature'>('contact');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setUserEmail(data.user.email);
        setEmail(data.user.email);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    if (formType === 'contact'){
      try {
        const res = await fetch('/api/contact-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            subject,
            message,
          }),
        });
        if (res.ok) {
          setSuccess('Message sent successfully!');
          setFirstName('');
          setLastName('');
          setSubject('');
          setMessage('');
        } else {
          const data = await res.json();
          setError(data.error || 'Failed to send message.');
        }
      } catch (err) {
        setError('Failed to send message.');
      } finally {
        setLoading(false);
      }
    }
    else if (formType==='feature'){
            try {
        const res = await fetch('/api/feature-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            featureTitle: subject,
            featureDescription: message,
          }),
        });
        if (res.ok) {
          setSuccess('Message sent successfully!');
          setFirstName('');
          setLastName('');
          setSubject('');
          setMessage('');
        } else {
          const data = await res.json();
          setError(data.error || 'Failed to send message.');
        }
      } catch (err) {
        setError('Failed to send message.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container py-6 md:py-8">
      <PageHeader
        title="Contact Us"
        description="Get in touch with our team"
      />
      <div className="flex gap-2 mb-4 mt-2">
        <Button
          variant={formType === 'contact' ? 'default' : 'outline'}
          onClick={() => setFormType('contact')}
          type="button"
        >
          Contact
        </Button>
        <Button
          variant={formType === 'feature' ? 'default' : 'outline'}
          onClick={() => setFormType('feature')}
          type="button"
        >
          Feature Request
        </Button>
      </div>
      <Separator className="my-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              {formType === 'contact' ? (
                <CardTitle>Send us a message</CardTitle>
              ) : (
                <CardTitle>Reccomand new feature or improve existing one</CardTitle>
              )}
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <Input placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <Input placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    readOnly={!!userEmail}
                    required
                  />
                </div>
                <div className="space-y-2">
                  {formType === 'feature' ? (
                    <label className="text-sm font-medium">Feature Title</label>
                  ) : (
                    <label className="text-sm font-medium">Subject</label>
                  )}
                  <Input placeholder="Subject or feature title" value={subject} onChange={e => setSubject(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  {formType === 'feature' ? (
                    <label className="text-sm font-medium">Feature Description</label>
                  ) : (
                    <label className="text-sm font-medium">Message</label>
                  )}
                  <Textarea 
                    placeholder="Tell us more about your inquiry or feature..."
                    className="min-h-[150px]"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    required
                  />
                </div>
                {success && <div className="text-green-600 text-sm">{success}</div>}
                {error && <div className="text-red-600 text-sm">{error}</div>}
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">toolhubsupport@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Live Chat</p>
                  <p className="text-sm text-muted-foreground">Available 24/7</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">+1 (555) 123-4567 (example number)</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Office</p>
                  <p className="text-sm text-muted-foreground">
                    123 Innovation Drive<br />
                    San Francisco, CA 94105 (example address)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>FAQ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">What are your business hours?</p>
                <p className="text-sm text-muted-foreground">Our support team is available 24/7.</p>
              </div>
              <div>
                <p className="font-medium">How long does it take to get a response?</p>
                <p className="text-sm text-muted-foreground">We typically respond within 24 hours.</p>
              </div>
              <div>
                <p className="font-medium">Do you offer custom solutions?</p>
                <p className="text-sm text-muted-foreground">Yes, contact us for custom enterprise solutions.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}