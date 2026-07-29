import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClientInstance: SupabaseClient | null = null;

export function getSupabaseBrowserClient(customUrl?: string, customAnonKey?: string): SupabaseClient | null {
  const url = customUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || (typeof window !== 'undefined' ? (window as any).__LEXEDU_ENV__?.NEXT_PUBLIC_SUPABASE_URL : undefined);
  const key = customAnonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (typeof window !== 'undefined' ? (window as any).__LEXEDU_ENV__?.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined);

  if (!url || !key) {
    return null;
  }

  if (!supabaseClientInstance || customUrl) {
    try {
      supabaseClientInstance = createSupabaseClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.error('[Supabase Client] Failed to initialize:', err);
      return null;
    }
  }

  return supabaseClientInstance;
}
