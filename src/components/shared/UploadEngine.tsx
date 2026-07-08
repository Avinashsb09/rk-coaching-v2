/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * UploadEngine Component — Reusable Enterprise Media Uploader
 * ─────────────────────────────────────────────────────────────────────────────
 * Supports dragging and dropping files, file validation (type, size),
 * animated progress, error states, and previewing files before saving.
 */

import React, { useState, useRef } from 'react';
import { uploadService } from '../../services/upload.service';
import { UploadCloud, File, Image, Check, AlertCircle, X, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface UploadEngineProps {
  bucket: 'avatars' | 'notes' | 'videos' | 'thumbnails' | 'pyqs' | 'assignments' | 'attachments' | 'future-assets';
  folderPath?: string;
  accept?: string; // e.g. "application/pdf", "image/*"
  maxSizeMB?: number;
  initialUrl?: string;
  label?: string;
  helperText?: string;
  onUploadSuccess: (url: string, path: string, sizeBytes: number) => void;
  onUploadError?: (error: string) => void;
}

export function UploadEngine({
  bucket,
  folderPath,
  accept = '*/*',
  maxSizeMB = 10,
  initialUrl = '',
  label = 'Upload Document',
  helperText = 'PDF, PNG, JPG, or JPEG (Max 10MB)',
  onUploadSuccess,
  onUploadError
}: UploadEngineProps) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [currentUrl, setCurrentUrl] = useState(initialUrl);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): boolean => {
    setError('');
    
    // Size check
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSizeMB) {
      const err = `File size exceeds the limit of ${maxSizeMB}MB.`;
      setError(err);
      if (onUploadError) onUploadError(err);
      return false;
    }

    // MIME type check
    if (accept && accept !== '*/*') {
      const acceptedTypes = accept.split(',').map(t => t.trim());
      const fileType = file.type;
      const isAccepted = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          const mainType = type.split('/')[0];
          return fileType.startsWith(`${mainType}/`);
        }
        return fileType === type;
      });

      if (!isAccepted && file.name.split('.').pop()?.toLowerCase() !== 'pdf') {
        const err = `Unsupported file format. Please upload files matching ${accept}.`;
        setError(err);
        if (onUploadError) onUploadError(err);
        return false;
      }
    }

    return true;
  };

  const handleUpload = async (file: File) => {
    setLoading(true);
    setError('');
    setFileName(file.name);
    setFileSize(file.size);

    const { data, error: uploadErr } = await uploadService.uploadFile(file, bucket, folderPath);

    if (uploadErr) {
      setError(uploadErr);
      if (onUploadError) onUploadError(uploadErr);
    } else if (data) {
      setCurrentUrl(data.url);
      onUploadSuccess(data.url, data.path, data.sizeBytes);
    }
    setLoading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        handleUpload(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        handleUpload(file);
      }
    }
  };

  const clearFile = () => {
    setCurrentUrl('');
    setFileName('');
    setFileSize(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onUploadSuccess('', '', 0);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const isImage = accept.includes('image') || fileName.match(/\.(jpeg|jpg|gif|png|webp)$/i);
  const isPdf = accept.includes('pdf') || fileName.match(/\.pdf$/i);

  return (
    <div className="space-y-1.5 text-left w-full">
      {label && (
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider mb-1">
          {label}
        </label>
      )}

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !loading && fileInputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed py-8 px-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10'
            : currentUrl
              ? 'border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-950/10'
              : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/10'
        } ${loading ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          disabled={loading}
        />

        {loading ? (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-xs font-bold text-indigo-500 animate-pulse">Uploading file to storage engine...</p>
          </div>
        ) : currentUrl ? (
          <div className="space-y-3 w-full max-w-xs relative group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mx-auto border border-emerald-500/20 shadow-inner">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[200px] mx-auto">
                {fileName || 'File uploaded successfully'}
              </p>
              {fileSize && (
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{formatBytes(fileSize)}</p>
              )}
            </div>

            {/* Previews */}
            {isImage && currentUrl && (
              <div className="relative h-20 w-32 mx-auto rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <img src={currentUrl} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}

            <div className="flex justify-center gap-2 pt-1.5" onClick={e => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                className="h-8 bg-white dark:bg-slate-900 hover:text-red-500"
                onClick={clearFile}
              >
                <X className="w-3 h-3 mr-1" /> Replace File
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto border border-slate-200/20">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Drag and drop your file here, or <span className="text-indigo-500">browse</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
                {helperText}
              </p>
            </div>
          </div>
        )}

        {/* Drag Overlay Helper */}
        {dragActive && (
          <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center backdrop-blur-xs">
            <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 animate-bounce">
              Drop file to start upload!
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-[10px] text-red-500 font-bold flex items-center gap-1.5 pt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
