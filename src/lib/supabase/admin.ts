import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseCredentials } from './client';

let adminClientInstance: SupabaseClient | null = null;
let lastAdminUrl: string | undefined;
let lastAdminKey: string | undefined;

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
    serviceKey = (window as any).__LEXEDU_ENV__?.SUPABASE_SERVICE_ROLE_KEY ||
                 localStorage.getItem('lexedu_supabase_service_key') || creds.anonKey;
  }

  if (!url || !serviceKey) {
    return null;
  }

  if (!adminClientInstance || url !== lastAdminUrl || serviceKey !== lastAdminKey || customUrl) {
    try {
      lastAdminUrl = url;
      lastAdminKey = serviceKey;
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

