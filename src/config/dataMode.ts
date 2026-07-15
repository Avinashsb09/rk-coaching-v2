export type AppDataMode = 'local' | 'supabase';

export const APP_DATA_MODE: AppDataMode =
  (import.meta as any).env.VITE_APP_DATA_MODE === 'supabase'
    ? 'supabase'
    : 'local';

export const DEMO_STUDENT_ID = '00000000-0000-0000-0000-000000000001';
