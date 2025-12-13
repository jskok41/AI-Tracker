import { ReactNode } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getSidebarData() {
  const [departments, projects] = await Promise.all([
    prisma.department.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.aIProject.findMany({
      select: { category: true, description: true },
    }),
  ]);

  // Extract unique categories from projects
  const categories = new Set<string>();
  projects.forEach((project) => {
    categories.add(project.category);
    // Extract custom categories from description if they exist
    if (project.category === 'OTHER' && project.description) {
      const customMatch = project.description.match(/Custom Category:\s*(.+?)(?:\n|$)/i);
      if (customMatch && customMatch[1]) {
        const customCategory = customMatch[1].trim();
        if (customCategory.length > 0) {
          categories.add(customCategory);
        }
      }
    }
  });

  return {
    departments,
    categories: Array.from(categories).sort(),
  };
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const sidebarData = await getSidebarData();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar departments={sidebarData.departments} categories={sidebarData.categories} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

