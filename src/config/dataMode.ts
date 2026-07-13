export type AppDataMode = 'local' | 'supabase';

export const APP_DATA_MODE: AppDataMode =
  (import.meta as any).env.VITE_APP_DATA_MODE === 'supabase'
    ? 'supabase'
    : 'local';
