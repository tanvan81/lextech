import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClientInstance: SupabaseClient | null = null;

export function getSupabaseCredentials(): { url: string | undefined; anonKey: string | undefined } {
  let url: string | undefined;
  let anonKey: string | undefined;

  // 1. Check import.meta.env (Vite standard)
  try {
    const metaEnv = (import.meta as any).env || {};
    url = metaEnv.VITE_SUPABASE_URL || metaEnv.NEXT_PUBLIC_SUPABASE_URL || metaEnv.SUPABASE_URL;
    anonKey = metaEnv.VITE_SUPABASE_ANON_KEY || metaEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || metaEnv.SUPABASE_ANON_KEY;
  } catch {
    // ignore
  }

  // 2. Check process.env
  if (!url) {
    url = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  }
  if (!anonKey) {
    anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  }

  // 3. Check window & LocalStorage fallback
  if (typeof window !== 'undefined') {
    if (!url) {
      url = (window as any).__LEXEDU_ENV__?.VITE_SUPABASE_URL ||
            (window as any).__LEXEDU_ENV__?.NEXT_PUBLIC_SUPABASE_URL ||
            localStorage.getItem('lexedu_supabase_url') || undefined;
    }
    if (!anonKey) {
      anonKey = (window as any).__LEXEDU_ENV__?.VITE_SUPABASE_ANON_KEY ||
                (window as any).__LEXEDU_ENV__?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                localStorage.getItem('lexedu_supabase_anon_key') || undefined;
    }
  }

  return { url, anonKey };
}

export function getSupabaseBrowserClient(customUrl?: string, customAnonKey?: string): SupabaseClient | null {
  const creds = getSupabaseCredentials();
  const url = customUrl || creds.url;
  const key = customAnonKey || creds.anonKey;

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

