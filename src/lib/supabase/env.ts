export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
/* The publishable key replaces the legacy anon JWT; either works. */
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'rbi'
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ''
