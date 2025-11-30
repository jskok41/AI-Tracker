'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface AddFeedbackDialogProps {
  projectId: string;
  users: { id: string; name: string }[];
  triggerButton?: React.ReactNode;
}

export function AddFeedbackDialog({
  projectId,
  users,
  triggerButton,
}: AddFeedbackDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    userId: users.length > 0 ? users[0].id : '',
    rating: '',
    sentiment: 'POSITIVE',
    feedbackText: '',
    category: '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            userId: formData.userId,
            rating: formData.rating ? parseInt(formData.rating) : null,
            sentiment: formData.sentiment,
            feedbackText: formData.feedbackText || null,
            category: formData.category || null,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to add feedback');
        }

        toast.success('Feedback added successfully!');
        setOpen(false);
        setFormData({
          userId: users.length > 0 ? users[0].id : '',
          rating: '',
          sentiment: 'POSITIVE',
          feedbackText: '',
          category: '',
        });
        router.refresh();
      } catch (error) {
        toast.error('Failed to add feedback');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Feedback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Feedback</DialogTitle>
          <DialogDescription>
            Record user feedback for this project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="userId">User *</Label>
              <Select
                value={formData.userId}
                onValueChange={(value) =>
                  setFormData({ ...formData, userId: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Select
                  value={formData.rating}
                  onValueChange={(value) =>
                    setFormData({ ...formData, rating: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 ⭐</SelectItem>
                    <SelectItem value="2">2 ⭐⭐</SelectItem>
                    <SelectItem value="3">3 ⭐⭐⭐</SelectItem>
                    <SelectItem value="4">4 ⭐⭐⭐⭐</SelectItem>
                    <SelectItem value="5">5 ⭐⭐⭐⭐⭐</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sentiment">Sentiment</Label>
                <Select
                  value={formData.sentiment}
                  onValueChange={(value) =>
                    setFormData({ ...formData, sentiment: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POSITIVE">Positive</SelectItem>
                    <SelectItem value="NEUTRAL">Neutral</SelectItem>
                    <SelectItem value="NEGATIVE">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category (optional)</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="e.g., performance, functionality"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="feedbackText">Feedback Text</Label>
              <Textarea
                id="feedbackText"
                value={formData.feedbackText}
                onChange={(e) =>
                  setFormData({ ...formData, feedbackText: e.target.value })
                }
                placeholder="Enter feedback details..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Adding...' : 'Add Feedback'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

