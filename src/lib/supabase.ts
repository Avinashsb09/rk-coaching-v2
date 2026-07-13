/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { APP_DATA_MODE } from '../config/dataMode';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Checks if Supabase credentials are validly defined.
 */
export function isSupabaseConfigured(): boolean {
  if (APP_DATA_MODE !== 'supabase') {
    return false;
  }
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.length > 0 &&
    (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://')) &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.length > 0 &&
    !supabaseUrl.includes('MY_SUPABASE_URL') &&
    !supabaseUrl.includes('YOUR_SUPABASE_URL')
  );
}

let supabaseInstance: ReturnType<typeof createClient> | null = null;

/**
 * Lazily initializes and returns the Supabase client instance.
 * Returns null if Supabase is not configured to avoid applet startup crashes.
 */
export function getSupabase() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  
  if (!supabaseInstance) {
    try {
      const options = {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: window.localStorage,
        },
      };
      console.log(`[${new Date().toISOString()}] SUPABASE CLIENT OPTIONS:`, options.auth);
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, options);
      console.log(`[${new Date().toISOString()}] SUPABASE INITIALIZED`);
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }
  
  return supabaseInstance;
}

export function getSupabaseConfigDetails() {
  return {
    url: supabaseUrl ? `${supabaseUrl.substring(0, 15)}...` : 'Not Defined',
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0,
    isConfigured: isSupabaseConfigured()
  };
}

const activePromises = new Map<string, Promise<any>>();

/**
 * Deduplicates in-flight API requests by key to prevent parallel query flooding.
 */
export function deduplicateRequest<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
  if (activePromises.has(key)) {
    return activePromises.get(key)!;
  }
  const promise = fetchFn().finally(() => {
    activePromises.delete(key);
  });
  activePromises.set(key, promise);
  return promise;
}

/**
 * Tests connection to the Supabase database.
 * Returns success or the detailed error message.
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; details?: any }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase environment variables are not correctly configured. Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your Environment Secrets.'
    };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return {
      success: false,
      message: 'Failed to initialize createClient. Check if the URL is a valid HTTP/HTTPS endpoint.'
    };
  }

  try {
    // Attempt a lightweight select from the classes table
    const { data, error } = await supabase
      .from('classes')
      .select('id')
      .limit(1);

    if (error) {
      return {
        success: false,
        message: `Connected to API but received a database error: ${error.message}`,
        details: error
      };
    }

    return {
      success: true,
      message: 'Successfully established contact with Supabase and queried tables.'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to query Supabase API: ${err?.message || 'Unknown network error'}`,
      details: err
    };
  }
}

/**
 * Uploads a file directly to a Supabase Storage bucket.
 * If Supabase is not configured, it gracefully falls back to creating a local object URL.
 */
export async function uploadToStorage(bucket: string, path: string, file: File): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn('Supabase not configured. Simulating high-fidelity file upload locally.');
    return URL.createObjectURL(file);
  }

  // Clean path to remove spaces and special characters
  const cleanPath = path.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_./-]/g, '');

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(cleanPath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      // If bucket does not exist, let's try creating the bucket if it's a transient failure,
      // or bubble up the error
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    // Return the reference path (or full URL reference)
    return `storage://${bucket}/${data.path}`;
  } catch (err: any) {
    console.error('Supabase Storage Upload Error:', err);
    throw err;
  }
}

/**
 * Checks if a given URL is a custom secure storage schema reference.
 */
export function isStorageReference(url: string): boolean {
  return typeof url === 'string' && url.startsWith('storage://');
}

/**
 * Parses a custom storage reference string into bucket and path.
 */
export function parseStorageReference(url: string): { bucket: string; path: string } | null {
  if (!isStorageReference(url)) return null;
  const parts = url.replace('storage://', '').split('/');
  const bucket = parts[0];
  const path = parts.slice(1).join('/');
  return { bucket, path };
}

/**
 * Resolves any note/study material path or storage reference into a secure,
 * RLS-compliant signed URL (or direct URL fallback if not configured).
 */
export async function resolveSecureDownloadUrl(url: string, expiresIn: number = 3600): Promise<string> {
  if (!url) return '';
  
  const ref = parseStorageReference(url);
  if (!ref) {
    // If it's a standard web URL, return it directly
    return url;
  }

  const supabase = getSupabase();
  if (!supabase) {
    return url;
  }

  try {
    const { data, error } = await supabase.storage
      .from(ref.bucket)
      .createSignedUrl(ref.path, expiresIn);

    if (error) {
      console.warn(`Failed to generate secure signed URL for ${ref.path}:`, error.message);
      // Fallback to public URL in case bucket is public or RLS isn't fully enforced
      const { data: pubData } = supabase.storage.from(ref.bucket).getPublicUrl(ref.path);
      return pubData.publicUrl || url;
    }

    return data.signedUrl;
  } catch (err) {
    console.error('Failed to resolve secure download url:', err);
    return url;
  }
}

export function resetSupabaseInstance() {
  supabaseInstance = null;
  console.log(`[${new Date().toISOString()}] SUPABASE CLIENT INSTANCE RESET`);
}
