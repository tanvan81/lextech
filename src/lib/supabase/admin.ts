import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseCredentials } from './client';

let adminClientInstance: SupabaseClient | null = null;

export function getSupabaseAdminClient(customUrl?: string, customServiceKey?: string): SupabaseClient | null {
  const creds = getSupabaseCredentials();
  const url = customUrl || creds.url;
  
  let serviceKey = customServiceKey;
  if (!serviceKey) {
    try {
      const metaEnv = (import.meta as any).env || {};
      serviceKey = metaEnv.SUPABASE_SERVICE_ROLE_KEY || metaEnv.VITE_SUPABASE_SERVICE_ROLE_KEY;
    } catch {
      // ignore
    }
  }
  if (!serviceKey) {
    serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  }
  if (!serviceKey && typeof window !== 'undefined') {
    serviceKey = localStorage.getItem('lexedu_supabase_service_key') || creds.anonKey;
  }

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

