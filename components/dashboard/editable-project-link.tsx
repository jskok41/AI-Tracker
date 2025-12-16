'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ExternalLink, Edit2, Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useCanEditProject } from '@/lib/hooks/use-can-edit-project';

interface EditableProjectLinkProps {
  projectId: string;
  label: string;
  value: string | null;
  fieldName: 'sharePointLink' | 'appLink';
  onUpdate?: () => void;
}

export function EditableProjectLink({
  projectId,
  label,
  value,
  fieldName,
  onUpdate,
}: EditableProjectLinkProps) {
  const router = useRouter();
  const canEdit = useCanEditProject(projectId);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [isSaving, setIsSaving] = useState(false);

  // Update local value when prop changes
  useEffect(() => {
    setEditValue(value || '');
  }, [value]);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    // Validate URL if not empty
    if (editValue.trim() && !isValidUrl(editValue.trim())) {
      toast.error('Please enter a valid URL (must start with http:// or https://)');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [fieldName]: editValue.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update link');
      }

      toast.success(`${label} updated successfully`);
      setIsEditing(false);
      router.refresh(); // Refresh page data
      onUpdate?.();
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update link');
      setEditValue(value || '');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setIsEditing(false);
  };

  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  if (!canEdit) {
    // Read-only view for users without edit permission
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground cyberpunk:text-[#00FF41]/70 min-w-[140px]">{label}:</span>
        {value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 dark:text-blue-400 cyberpunk:text-[#00FF41] hover:underline flex items-center gap-1.5 flex-1 min-w-0"
          >
            <span className="truncate">{value}</span>
            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
          </a>
        ) : (
          <span className="text-sm text-muted-foreground italic cyberpunk:text-[#00FF41]/50">Not provided</span>
        )}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 flex-1">
        <span className="text-sm font-medium text-muted-foreground cyberpunk:text-[#00FF41]/70 min-w-[140px] flex-shrink-0">{label}:</span>
        <Input
          type="url"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder="https://..."
          className="flex-1 text-sm cyberpunk:bg-black/50 cyberpunk:border-[#00FF41]/30"
          disabled={isSaving}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSave();
            } else if (e.key === 'Escape') {
              handleCancel();
            }
          }}
        />
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 w-8 p-0 cyberpunk:text-[#00FF41] cyberpunk:hover:bg-[#00FF41]/10"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSaving}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 group">
      <span className="text-sm font-medium text-muted-foreground cyberpunk:text-[#00FF41]/70 min-w-[140px]">{label}:</span>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 dark:text-blue-400 cyberpunk:text-[#00FF41] hover:underline flex items-center gap-1.5 flex-1 min-w-0"
          >
            <span className="truncate">{value}</span>
            <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
          </a>
        ) : (
          <span className="text-sm text-muted-foreground italic cyberpunk:text-[#00FF41]/50">Not provided</span>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
          className={cn(
            "h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
            "cyberpunk:text-[#00FF41] cyberpunk:hover:bg-[#00FF41]/10"
          )}
          title={`Edit ${label}`}
        >
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

