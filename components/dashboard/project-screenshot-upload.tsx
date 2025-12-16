'use client';

import { useState, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useCanEdit } from '@/lib/hooks/use-permissions';

interface ProjectScreenshotUploadProps {
  projectId: string;
  currentScreenshotUrl?: string | null;
  onUploadComplete?: (url: string) => void;
}

export function ProjectScreenshotUpload({
  projectId,
  currentScreenshotUrl,
  onUploadComplete,
}: ProjectScreenshotUploadProps) {
  const { theme } = useTheme();
  const canEdit = useCanEdit();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentScreenshotUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG or JPG)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);

      const response = await fetch('/api/projects/upload-screenshot', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      setPreview(data.url);
      toast.success('Screenshot uploaded successfully');
      onUploadComplete?.(data.url);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload screenshot');
      setPreview(currentScreenshotUrl || null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    setIsUploading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/screenshot`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove screenshot');
      }

      setPreview(null);
      toast.success('Screenshot removed');
      onUploadComplete?.('');
    } catch (error) {
      console.error('Remove error:', error);
      toast.error('Failed to remove screenshot');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Render template based on theme
  const renderTemplate = () => {
    if (preview) {
      return (
        <div className="relative group">
          <img
            src={preview}
            alt="Project screenshot"
            className="w-full h-48 object-cover rounded-lg border-2 border-border cyberpunk:border-[#00FF41]/30"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleClick}
                disabled={isUploading}
                className="cyberpunk:bg-black/50 cyberpunk:border-[#00FF41]/50 cyberpunk:text-[#00FF41]"
              >
                <Upload className="h-4 w-4 mr-1" />
                Replace
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Light mode template
    if (theme === 'light') {
      return (
        <div
          onClick={handleClick}
          className={cn(
            'relative w-full h-48 rounded-lg border-2 border-dashed cursor-pointer',
            'bg-gradient-to-br from-blue-50 to-white',
            'border-blue-200 hover:border-blue-300',
            'transition-all hover:shadow-md',
            isUploading && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full animate-pulse" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-800">UPLOAD PROJECT SCREENSHOT</p>
              <p className="text-sm text-gray-500 mt-1">Supported formats: PNG, JPG</p>
            </div>
            {isUploading && (
              <div className="w-full max-w-xs px-4">
                <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse" style={{ width: '66%' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Dark mode template
    if (theme === 'dark') {
      return (
        <div
          onClick={handleClick}
          className={cn(
            'relative w-full h-48 rounded-lg border-2 border-dashed cursor-pointer',
            'bg-gradient-to-br from-gray-900 to-black',
            'border-gray-700 hover:border-gray-600',
            'transition-all hover:shadow-lg hover:shadow-purple-500/20',
            isUploading && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/50">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full animate-pulse" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-white">UPLOAD PROJECT SCREENSHOT</p>
              <p className="text-sm text-gray-400 mt-1">Supported formats: PNG, JPG</p>
            </div>
            {isUploading && (
              <div className="w-full max-w-xs px-4">
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-purple-700 animate-pulse" style={{ width: '66%' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Cyberpunk mode template
    return (
      <div
        onClick={handleClick}
        className={cn(
          'relative w-full h-48 rounded-lg border-2 border-dashed cursor-pointer',
          'bg-black/40 backdrop-blur-sm',
          'border-[#00FF41]/30 hover:border-[#00FF41]/50',
          'shadow-[0_0_20px_rgba(0,255,65,0.1)] hover:shadow-[0_0_30px_rgba(0,255,65,0.2)]',
          'transition-all',
          isUploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        {/* Cyberpunk circuit board pattern background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 200 200" preserveAspectRatio="none">
            <defs>
              <pattern id="circuit" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0,20 L40,20 M20,0 L20,40" stroke="#00FF41" strokeWidth="0.5" />
                <circle cx="20" cy="20" r="2" fill="#00FF41" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)" />
          </svg>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 relative z-10">
          <div className="relative">
            {/* Low-poly cloud icon with neon glow */}
            <div className="relative">
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                className="drop-shadow-[0_0_20px_rgba(0,255,65,0.8)]"
              >
                <defs>
                  <linearGradient id="cyberpunkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00FF41" />
                    <stop offset="100%" stopColor="#00CC33" />
                  </linearGradient>
                </defs>
                {/* Cloud shape */}
                <path
                  d="M20,32 Q15,28 15,24 Q15,18 20,18 Q22,12 28,12 Q32,8 36,12 Q42,10 46,14 Q50,14 52,18 Q56,18 58,22 Q60,24 58,28 Q62,30 60,34 Q58,38 54,38 L20,38 Q16,38 18,34 Q15,34 20,32 Z"
                  fill="none"
                  stroke="url(#cyberpunkGradient)"
                  strokeWidth="2"
                />
                {/* Upload arrow */}
                <path
                  d="M32,20 L32,36 M24,28 L32,20 L40,28"
                  stroke="url(#cyberpunkGradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            {/* Glitch effect lines */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-[#00FF41] opacity-60 animate-pulse" />
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00FF41] opacity-60 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
          <div className="text-center">
            <p className="font-bold text-[#00FF41] text-lg drop-shadow-[0_0_10px_rgba(0,255,65,0.8)]">
              UPLOAD PROJECT SCREENSHOT
            </p>
            <p className="text-sm text-[#00FF41]/70 mt-1">Supported formats: PNG, JPG</p>
          </div>
          {isUploading && (
            <div className="w-full max-w-xs px-4">
              <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-[#00FF41]/30">
                <div
                  className="h-full bg-gradient-to-r from-[#00FF41] to-[#00CC33] animate-pulse"
                  style={{ width: '66%' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // If user can't edit, show read-only view
  if (!canEdit) {
    if (!preview) {
      return null; // Don't show anything if no screenshot and can't edit
    }
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <ImageIcon className="h-4 w-4 text-muted-foreground cyberpunk:text-[#00FF41]/70" />
          <span className="text-sm font-medium cyberpunk:text-white">Project Screenshot</span>
        </div>
        <div className="relative">
          <img
            src={preview}
            alt="Project screenshot"
            className="w-full h-48 object-cover rounded-lg border-2 border-border cyberpunk:border-[#00FF41]/30"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <ImageIcon className="h-4 w-4 text-muted-foreground cyberpunk:text-[#00FF41]/70" />
        <span className="text-sm font-medium cyberpunk:text-white">Project Screenshot</span>
      </div>
      {isUploading && !preview ? (
        <div className="w-full h-48 rounded-lg border-2 border-dashed border-border cyberpunk:border-[#00FF41]/30 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground cyberpunk:text-[#00FF41]" />
        </div>
      ) : (
        renderTemplate()
      )}
    </div>
  );
}

