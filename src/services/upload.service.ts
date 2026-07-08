/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Reusable Upload Service — Supabase Storage & Local Fallbacks
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides a standardized API for uploading media (PDFs, Images, Videos, ZIPs)
 * across notes, PYQs, and avatars.
 */

import { getSupabase, isSupabaseConfigured } from '../lib/supabase';

export interface UploadResult {
  url: string;
  path: string;
  sizeBytes: number;
}

export interface ServiceResult<T> {
  data: T | null;
  error: string | null;
}

export const uploadService = {
  /**
   * Uploads a file to a Supabase Storage bucket.
   * Falls back to generating a local object URL (Blob URL) or a simulated URL
   * when Supabase is not configured to allow offline CRUD testing.
   */
  async uploadFile(
    file: File,
    bucket: 'avatars' | 'notes' | 'videos' | 'thumbnails' | 'pyqs' | 'assignments' | 'attachments' | 'future-assets',
    folderPath?: string
  ): Promise<ServiceResult<UploadResult>> {
    const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filename = `${Date.now()}_${cleanName}`;
    const filePath = folderPath ? `${folderPath}/${filename}` : filename;

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase() as any;

        // Try to verify if bucket exists (Supabase throws error if bucket is missing or unprivileged)
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          // If the bucket doesn't exist, we can try to auto-create it if we have admin rights (or log warning)
          console.warn(`Supabase Storage upload error in bucket "${bucket}":`, uploadError.message);
          return { data: null, error: uploadError.message };
        }

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
        if (!urlData || !urlData.publicUrl) {
          return { data: null, error: 'Failed to retrieve public URL from Supabase Storage' };
        }

        return {
          data: {
            url: urlData.publicUrl,
            path: filePath,
            sizeBytes: file.size,
          },
          error: null,
        };
      } catch (err: any) {
        return { data: null, error: err.message || 'Supabase Storage exception occurred' };
      }
    }

    // Fallback demo/mock mode
    console.log(`[Upload Service Mock] Uploading file "${file.name}" (${file.size} bytes) to storage bucket "${bucket}" at path "${filePath}"`);
    await new Promise(resolve => setTimeout(resolve, 600));

    let localUrl = '';
    try {
      localUrl = URL.createObjectURL(file);
    } catch (e) {
      localUrl = `https://mockstorage.rkcoaching.com/${bucket}/${filePath}`;
    }

    return {
      data: {
        url: localUrl,
        path: filePath,
        sizeBytes: file.size,
      },
      error: null,
    };
  }
};
