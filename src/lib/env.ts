import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3000'),
  APP_SETUP_COMPLETED: z.string().optional().default('false'),
  SETUP_INSTALLATION_TOKEN: z.string().optional().default('lexedu_setup_init_token_2026'),
  ALLOW_RUNTIME_CONFIG_WRITE: z.string().optional().default('true'),
  APP_CONFIG_ENCRYPTION_KEY: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function getValidatedEnv(): EnvConfig {
  const envValues = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || (typeof window !== 'undefined' ? (window as any).__LEXEDU_ENV__?.NEXT_PUBLIC_SUPABASE_URL : undefined),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (typeof window !== 'undefined' ? (window as any).__LEXEDU_ENV__?.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined),
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000',
    APP_SETUP_COMPLETED: process.env.APP_SETUP_COMPLETED || 'false',
    SETUP_INSTALLATION_TOKEN: process.env.SETUP_INSTALLATION_TOKEN || 'lexedu_setup_init_token_2026',
    ALLOW_RUNTIME_CONFIG_WRITE: process.env.ALLOW_RUNTIME_CONFIG_WRITE || 'true',
    APP_CONFIG_ENCRYPTION_KEY: process.env.APP_CONFIG_ENCRYPTION_KEY || 'lexedu_secret_key_32_bytes_min_prod',
  };

  const parseResult = envSchema.safeParse(envValues);
  if (!parseResult.success) {
    console.warn('[Env] Environment validation warning:', parseResult.error.format());
    return envValues as EnvConfig;
  }

  return parseResult.data;
}

export function validateSupabaseCredentials(url?: string, anonKey?: string): { valid: boolean; error?: string } {
  if (!url || !url.trim()) {
    return { valid: false, error: 'Chưa cấu hình Supabase URL.' };
  }
  if (!anonKey || !anonKey.trim()) {
    return { valid: false, error: 'Chưa cấu hình Supabase Anon / Publishable Key.' };
  }
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('supabase')) {
      // allow custom domain or supabase.co
    }
  } catch {
    return { valid: false, error: 'Supabase URL không đúng định dạng.' };
  }
  return { valid: true };
}
