'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { DetailedReportDialog } from './detailed-report-dialog';

interface ReportsPageClientProps {
  projectId: string;
}

export function ReportsPageClient({ projectId }: ReportsPageClientProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <FileText className="mr-2 h-4 w-4" />
        View Detailed Report
      </Button>
      <DetailedReportDialog
        projectId={projectId}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

