import CodeEditor from "@/components/shared/code-editor";
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function CodeEditorPage() {
  // Server-side check for collaborative editor access
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Get user's plan tier from database
  const { data } = await supabase.rpc('get_user_plan', { p_user_id: user.id });
  const planTier = data || 'free';
  
  // For free users, collaborative editing is disabled
  if (planTier === 'free') {
    redirect('/code/code-editor');
  }
  
  return <CodeEditor collab={true} />;
}