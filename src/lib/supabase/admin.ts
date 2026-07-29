import { createClient, SupabaseClient } from '@supabase/supabase-js';

let adminClientInstance: SupabaseClient | null = null;

export function getSupabaseAdminClient(customUrl?: string, customServiceKey?: string): SupabaseClient | null {
  const url = customUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = customServiceKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  if (!adminClientInstance || customUrl) {
    try {
      adminClientInstance = createClient(url, serviceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    } catch (err) {
      console.error('[Supabase Admin Client] Initialization failed:', err);
      return null;
    }
  }

  return adminClientInstance;
}
