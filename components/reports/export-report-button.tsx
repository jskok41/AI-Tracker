'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExportReportButtonProps {
  projectId?: string;
  reportType?: 'executive' | 'financial' | 'technical';
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';
}

export function ExportReportButton({ 
  projectId, 
  reportType = 'executive',
  className,
  variant = 'default',
  size = 'default',
}: ExportReportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: 'json' | 'pdf') => {
    setExporting(true);
    try {
      const params = new URLSearchParams({
        format,
        type: reportType,
      });
      if (projectId) {
        params.append('projectId', projectId);
      }

      const response = await fetch(`/api/reports/export?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to export report');

      if (format === 'json') {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = projectId
          ? `project-report-${Date.now()}.json`
          : `ai-benefits-report-${reportType}-${Date.now()}.json`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // PDF export would be handled here when implemented
        alert('PDF export coming soon');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const buttonText = exporting 
    ? 'Exporting...' 
    : projectId 
      ? 'Export Report' 
      : `Generate ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={exporting} className={className} variant={variant} size={size}>
          <Download className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('json')}>
          <Download className="mr-2 h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')} disabled>
          <Download className="mr-2 h-4 w-4" />
          Export as PDF (Coming Soon)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

