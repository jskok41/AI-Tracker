'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EditPromptDialog } from '@/components/dashboard/edit-prompt-dialog';
import { Copy, Star, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';
import { deletePrompt } from '@/lib/actions';

interface PromptsListProps {
  prompts: any[];
  projects: { id: string; name: string }[];
  users: { id: string; name: string; email: string }[];
}

export function PromptsList({ prompts, projects, users }: PromptsListProps) {
  const [editingPrompt, setEditingPrompt] = useState<any | null>(null);

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success('Prompt copied to clipboard!');
  };

  const handleQuickDelete = async (promptId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this prompt?')) {
      return;
    }

    const result = await deletePrompt(promptId);
    if (result.success) {
      toast.success('Prompt deleted successfully!');
    } else {
      toast.error(result.error || 'Failed to delete prompt');
    }
  };

  return (
    <>
      <div className="grid gap-4">
        {prompts.map((prompt) => (
          <Card key={prompt.id} className="group hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Header with Actions */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{prompt.promptTitle}</h3>
                      {prompt.category && (
                        <Badge variant="outline" className="text-xs">
                          {prompt.category}
                        </Badge>
                      )}
                    </div>
                    {prompt.useCase && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {prompt.useCase}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPrompt(prompt);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => handleQuickDelete(prompt.id, e)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                {/* Tags */}
                {prompt.tags && (
                  <div className="flex flex-wrap gap-1">
                    {prompt.tags.split(',').map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Prompt Text */}
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="text-sm font-mono whitespace-pre-wrap line-clamp-3">
                    {prompt.promptText}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Copy className="h-3 w-3" />
                      <span>{prompt.usageCount || 0} uses</span>
                    </div>
                    {prompt.averageRating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-muted-foreground">{prompt.averageRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {prompt.lastUsedAt && (
                      <span className="text-xs text-muted-foreground">
                        Last used {formatRelativeTime(prompt.lastUsedAt)}
                      </span>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => handleCopy(prompt.promptText, e)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>

                {/* Author */}
                <div className="text-xs text-muted-foreground">
                  By {prompt.author?.name}
                  {prompt.project && <span className="ml-2">• {prompt.project.name}</span>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingPrompt && (
        <EditPromptDialog
          prompt={editingPrompt}
          open={!!editingPrompt}
          onOpenChange={(open) => !open && setEditingPrompt(null)}
          projects={projects}
          users={users}
        />
      )}
    </>
  );
}

