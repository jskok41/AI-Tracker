'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderKanban,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Map,
  Tag,
  Building2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Risk Management', href: '/risks', icon: AlertTriangle },
  { name: 'Roadmap', href: '/roadmap', icon: Map },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

const CATEGORY_LABELS: Record<string, string> = {
  AI_AGENT: 'AI Agent',
  AI_INITIATIVE: 'AI Initiative',
  PROMPT_LIBRARY: 'Prompt Library',
  GEN_AI_PRODUCTION: 'Gen AI Production',
  RISK_MANAGEMENT: 'Risk Management',
  OTHER: 'Other',
};

interface SidebarProps {
  departments: { id: string; name: string }[];
  categories: string[];
}

function SidebarContent({ departments, categories }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchParams.get('category') === category) {
      params.delete('category');
    } else {
      params.set('category', category);
      params.delete('departmentId'); // Clear department filter when selecting category
    }
    router.push(`/projects?${params.toString()}`);
  };

  const handleDepartmentClick = (departmentId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchParams.get('departmentId') === departmentId) {
      params.delete('departmentId');
    } else {
      params.set('departmentId', departmentId);
      params.delete('category'); // Clear category filter when selecting department
    }
    router.push(`/projects?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/projects');
  };

  const getCategoryLabel = (category: string): string => {
    return CATEGORY_LABELS[category] || category;
  };

  return (
    <div className="hidden w-64 flex-col border-r bg-white md:flex">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">AI Tracker</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}

        {/* Categories Section */}
        {categories.length > 0 && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Tag className="h-4 w-4" />
                Categories
              </div>
              {(searchParams.get('category') || searchParams.get('departmentId')) && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-primary hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            {categories.map((category) => {
              const isActive = searchParams.get('category') === category;
              return (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <span className="h-2 w-2 rounded-full bg-current opacity-60" />
                  {getCategoryLabel(category)}
                </button>
              );
            })}
          </div>
        )}

        {/* Departments Section */}
        {departments.length > 0 && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Building2 className="h-4 w-4" />
              Departments
            </div>
            {departments.map((department) => {
              const isActive = searchParams.get('departmentId') === department.id;
              return (
                <button
                  key={department.id}
                  onClick={() => handleDepartmentClick(department.id)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <span className="h-2 w-2 rounded-full bg-current opacity-60" />
                  {department.name}
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          AI Benefits Tracker v1.0
        </div>
      </div>
    </div>
  );
}

export function Sidebar({ departments, categories }: SidebarProps) {
  return (
    <Suspense fallback={
      <div className="hidden w-64 flex-col border-r bg-white md:flex">
        <div className="flex h-16 items-center border-b px-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">AI Tracker</span>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </nav>
      </div>
    }>
      <SidebarContent departments={departments} categories={categories} />
    </Suspense>
  );
}
