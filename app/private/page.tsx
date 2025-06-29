"use client";

import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { PageHeader } from '@/components/shared/page-header';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  CreditCard, 
  Zap, 
  Crown, 
  Star, 
  BarChart, 
  Shield, 
  Save, 
  Loader2 
} from 'lucide-react';
import Link from 'next/link';

// Define feature names mapping
const featureNames: Record<string, string> = {
  ai_chat: 'AI Chat',
  text_humanizer: 'Text Humanizer',
  ai_detection: 'AI Detection',
  translation: 'Translation',
  text_to_speech: 'Text to Speech',
  seo_analyzer: 'SEO Analyzer',
  code_snippets: 'Code Snippets',
  document_view: 'Document Viewer',
  file_conversion: 'File Conversion',
  media_conversion: 'Media Conversion',
  url_shortener: 'URL Shortener'
};

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [usageData, setUsageData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    displayName: '',
    bio: '',
  });
  
  const supabase = createClient();

  useEffect(() => {
    async function loadUserData() {
      try {
        setLoading(true);
        
        // Get user data
        const { data: { user: userData }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData) {
          console.error('Error fetching user:', userError);
          redirect('/login');
          return;
        }
        
        setUser(userData);
        
        // Get user profile data
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', userData.id)
          .single();
          
        if (profileData) {
          setFormData({
            fullName: profileData.full_name || '',
            displayName: profileData.display_name || '',
            bio: profileData.bio || '',
          });
        }
        
        // Get subscription data
        const { data: subData } = await supabase
          .from('stripe_user_subscriptions')
          .select('*')
          .maybeSingle();
          
        setSubscription(subData);
        
        // Get usage data
        const usageResponse = await fetch('/api/usage');
        if (usageResponse.ok) {
          const usageInfo = await usageResponse.json();
          setUsageData(usageInfo);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadUserData();
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('user_profiles')
          .update({
            full_name: formData.fullName,
            display_name: formData.displayName,
            bio: formData.bio,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
          
        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            full_name: formData.fullName,
            display_name: formData.displayName,
            bio: formData.bio
          });
          
        if (error) throw error;
      }
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };
  
  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'master':
        return <Crown className="h-5 w-5 text-purple-500" />;
      case 'pro':
        return <Zap className="h-5 w-5 text-blue-500" />;
      default:
        return <Star className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'master':
        return 'bg-purple-500';
      case 'pro':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const formatDate = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="container py-6 md:py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    redirect('/login');
    return null;
  }
  
  const userInitial = user.email ? user.email[0].toUpperCase() : 'U';
  const avatarUrl = user.user_metadata?.avatar_url;
  const planTier = usageData?.plan || 'free';
  
  return (
    <div className="container py-6 md:py-8">
      <PageHeader
        title="My Profile"
        description="Manage your account and subscription"
      />
      <Separator className="my-6" />
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:w-auto">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your personal information and avatar</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt={user.email} />
                  ) : null}
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-center">
                  <h3 className="font-medium text-lg">{formData.displayName || user.email}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={`${getPlanColor(planTier)} text-white`}>
                    {getPlanIcon(planTier)}
                    <span className="ml-1">{planTier.charAt(0).toUpperCase() + planTier.slice(1)} Plan</span>
                  </Badge>
                  
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    Joined {formatDate(user.created_at)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email} disabled />
                    <p className="text-xs text-muted-foreground">Your email cannot be changed</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      name="fullName" 
                      value={formData.fullName} 
                      onChange={handleInputChange} 
                      placeholder="Your full name" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input 
                      id="displayName" 
                      name="displayName" 
                      value={formData.displayName} 
                      onChange={handleInputChange} 
                      placeholder="How you want to be addressed" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input 
                      id="bio" 
                      name="bio" 
                      value={formData.bio} 
                      onChange={handleInputChange} 
                      placeholder="A short bio about yourself" 
                    />
                  </div>
                  
                  <Button 
                    type="button" 
                    onClick={handleSaveProfile} 
                    disabled={saving}
                    className="w-full"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Account Security (comming soon)</CardTitle>
              <CardDescription>For any questions or problems contact us using <a href={"/contact"}>Contacts Page</a></CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">Change your password</p>
                  </div>
                </div>
                <Button variant="outline">Change Password</Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Email Preferences</p>
                    <p className="text-sm text-muted-foreground">Manage your email notifications</p>
                  </div>
                </div>
                <Button variant="outline">Manage</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>Your current subscription plan and details</CardDescription>
                </div>
                <Badge className={`${getPlanColor(planTier)} text-white`}>
                  {getPlanIcon(planTier)}
                  <span className="ml-1">{planTier.charAt(0).toUpperCase() + planTier.slice(1)}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <p className="font-medium">
                    {subscription?.subscription_status === 'active' ? (
                      <span className="text-green-600">Active</span>
                    ) : subscription?.subscription_status ? (
                      <span className="text-yellow-600">{subscription.subscription_status}</span>
                    ) : (
                      <span>Free Plan</span>
                    )}
                  </p>
                </div>
                
                {subscription?.current_period_start && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Current Period Started</p>
                    <p className="font-medium">
                      {formatDate(new Date(subscription.current_period_start * 1000).toISOString())}
                    </p>
                  </div>
                )}
                
                {subscription?.current_period_end && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Current Period Ends</p>
                    <p className="font-medium">
                      {formatDate(new Date(subscription.current_period_end * 1000).toISOString())}
                    </p>
                  </div>
                )}
              </div>
              
              {subscription?.payment_method_brand && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Payment Method</p>
                        <p className="text-sm text-muted-foreground">
                          {subscription.payment_method_brand.toUpperCase()} •••• {subscription.payment_method_last4}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Update</Button>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Plan Features</h3>
                  <p className="text-sm text-muted-foreground">
                    {planTier === 'free' 
                      ? 'Basic access with limited daily usage'
                      : planTier === 'pro'
                      ? 'Increased limits for regular users'
                      : 'Maximum limits for power users'}
                  </p>
                </div>
                
                <Link href="/pricing">
                  <Button>
                    {planTier === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
                  </Button>
                </Link>
              </div>
              
              {planTier === 'free' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-700 dark:text-blue-300 flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </h4>
                  <p className="text-sm text-blue-600/80 dark:text-blue-400/80 mt-1">
                    Get more daily uses, increased storage, and premium features.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>Your recent invoices and payments</CardDescription>
            </CardHeader>
            <CardContent>
              {subscription?.subscription_id ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium">Current Subscription</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(new Date().toISOString())}
                      </p>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      View your complete billing history in the Stripe customer portal.
                    </p>
                    <Button variant="outline" className="mt-2">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Billing Portal
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No billing history available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Feature Usage</CardTitle>
                  <CardDescription>Your daily feature usage and limits</CardDescription>
                </div>
                <Link href="/usage">
                  <Button variant="outline">
                    <BarChart className="mr-2 h-4 w-4" />
                    Detailed Usage
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {usageData?.features ? (
                <div className="space-y-6">
                  {usageData.features.map((feature: any) => {
                    const usagePercentage = Math.min(100, (feature.usage / feature.limit) * 100);
                    const isExhausted = feature.remaining <= 0;
                    const isLow = feature.remaining <= Math.max(1, Math.floor(feature.limit * 0.2));
                    const featureName = featureNames[feature.feature] || feature.feature;
                    
                    return (
                      <div key={feature.feature} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">{featureName}</p>
                          <span className={`text-sm ${isExhausted ? 'text-red-600 dark:text-red-400' : ''}`}>
                            {feature.usage} / {feature.limit}
                          </span>
                        </div>
                        
                        <Progress 
                          value={usagePercentage} 
                          className={`h-2 ${
                            isExhausted 
                              ? 'bg-red-200 dark:bg-red-950' 
                              : isLow 
                              ? 'bg-yellow-200 dark:bg-yellow-950'
                              : ''
                          }`}
                        />
                        
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">
                            {feature.remaining} remaining
                          </span>
                          
                          {(isExhausted || isLow) && planTier === 'free' && (
                            <Link href="/pricing">
                              <Button size="sm" variant="ghost" className="h-6 text-xs">
                                Upgrade
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="text-center text-sm text-muted-foreground pt-2">
                    <p>Usage limits reset daily at midnight UTC</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Loading usage data...</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Storage Usage</CardTitle>
              <CardDescription>Your cloud storage usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Storage Used</span>
                  <span>
                    {planTier === 'free' ? '0 MB / 300 MB' : 
                     planTier === 'pro' ? '0 MB / 1 GB' : 
                     '0 MB / 5 GB'}
                  </span>
                </div>
                
                <Progress value={0} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {planTier === 'free' ? '300 MB' : 
                     planTier === 'pro' ? '1 GB' : 
                     '5 GB'} total storage
                  </span>
                  
                  <Link href="/cloud-storage">
                    <Button size="sm" variant="outline">
                      Manage Files
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}