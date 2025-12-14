'use client';

import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBreakdown } from './status-breakdown';
import { CategoryBreakdown } from './category-breakdown';
import { CyberpunkStatusGauge } from './cyberpunk-status-gauge';
import { CyberpunkNeuralNetwork } from './cyberpunk-neural-network';

interface CyberpunkChartsWrapperProps {
  projectsByStatus: Array<{
    status: string;
    count: number;
    projects?: Array<{
      projectName: string;
      count: number;
    }>;
  }>;
  projectsByCategory: Array<{
    category: string;
    count: number;
    subCategories?: Array<{
      subCategory: string;
      count: number;
    }>;
  }>;
}

export function CyberpunkChartsWrapper({
  projectsByStatus,
  projectsByCategory,
}: CyberpunkChartsWrapperProps) {
  const { theme } = useTheme();

  if (theme === 'cyberpunk') {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-white">Projects by Status</CardTitle>
            <CardDescription className="text-[#00FF41]/70">
              Current distribution of AI projects with Department & Team breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CyberpunkStatusGauge 
              statuses={projectsByStatus.map(status => ({
                status: status.status,
                count: status.count,
                projects: status.projects,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-white">Projects by Category</CardTitle>
            <CardDescription className="text-[#00FF41]/70">
              Neural network visualization with Department & Team breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CyberpunkNeuralNetwork 
              categories={projectsByCategory.map(cat => ({
                category: cat.category,
                count: cat.count,
                subCategories: cat.subCategories,
              }))}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default charts for light/dark mode
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Projects by Status</CardTitle>
          <CardDescription>Current distribution of AI projects with detailed breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <StatusBreakdown 
            statuses={projectsByStatus.map(status => ({
              status: status.status,
              count: status.count,
              projects: status.projects,
            }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Projects by Category and Sub-Category</CardTitle>
          <CardDescription>Detailed breakdown of AI initiatives by category and deployment approach</CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryBreakdown 
            categories={projectsByCategory.map(cat => ({
              category: cat.category,
              count: cat.count,
              subCategories: cat.subCategories,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
