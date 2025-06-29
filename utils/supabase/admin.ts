// utils/supabase/admin.ts
import { createClient } from "@supabase/supabase-js";

// This client runs with full service‐role privileges
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
