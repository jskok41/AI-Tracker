'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FolderKanban,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Tag,
  Building2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Risk Management', href: '/risks', icon: AlertTriangle },
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

  // Get selected departments from URL params
  const getSelectedDepartments = (): string[] => {
    const departmentIds = searchParams.getAll('departmentId');
    return departmentIds.length > 0 ? departmentIds : [];
  };

  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(() => {
    const deptIds = getSelectedDepartments();
    // If no departments selected, default to "All" (empty array means all)
    return deptIds.length > 0 ? deptIds : [];
  });

  // Update selected departments when URL changes
  useEffect(() => {
    const deptIds = getSelectedDepartments();
    setSelectedDepartments(deptIds.length > 0 ? deptIds : []);
  }, [searchParams]);

  const handleCategoryClick = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchParams.get('category') === category) {
      params.delete('category');
    } else {
      params.set('category', category);
      // Keep department filters when selecting category
    }
    // Navigate to current page with updated params
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDepartmentToggle = (departmentId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentSelected = getSelectedDepartments();
    
    // If "All" is currently selected (empty array), start fresh with just this department
    const isAllCurrentlySelected = currentSelected.length === 0;
    
    let newSelected: string[];
    if (isAllCurrentlySelected) {
      // "All" was selected, so select only this department
      newSelected = [departmentId];
    } else if (currentSelected.includes(departmentId)) {
      // Remove department
      newSelected = currentSelected.filter(id => id !== departmentId);
      
      // If no departments remain, this means "All" should be selected
      if (newSelected.length === 0) {
        params.delete('departmentId');
        setSelectedDepartments([]);
        router.push(`${pathname}?${params.toString()}`);
        return;
      }
    } else {
      // Add department to existing selection
      newSelected = [...currentSelected, departmentId];
    }

    // Update URL params
    params.delete('departmentId');
    if (newSelected.length > 0) {
      newSelected.forEach(id => params.append('departmentId', id));
    }
    
    // Keep category filter when selecting departments (allow combined filtering)
    
    setSelectedDepartments(newSelected);
    // Navigate to current page with updated params
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleAllDepartmentsClick = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('departmentId');
    // Keep category filter when selecting "All" departments
    setSelectedDepartments([]);
    // Navigate to current page with updated params
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    // Navigate to current page without filters
    router.push(pathname);
    setSelectedDepartments([]);
  };

  const isAllSelected = selectedDepartments.length === 0;

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
              {(searchParams.get('category') || selectedDepartments.length > 0) && (
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
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Departments
              </div>
              {(selectedDepartments.length > 0 || searchParams.get('category')) && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-primary hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            
            {/* All Departments Option */}
            <button
              onClick={(e) => {
                e.preventDefault();
                handleAllDepartmentsClick();
              }}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                isAllSelected
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleAllDepartmentsClick();
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="h-4 w-4"
              />
              <span>All</span>
            </button>

            {/* Individual Departments */}
            {departments.map((department) => {
              const isSelected = selectedDepartments.includes(department.id);
              return (
                <button
                  key={department.id}
                  onClick={(e) => {
                    e.preventDefault();
                    handleDepartmentToggle(department.id);
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    isSelected
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      handleDepartmentToggle(department.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4"
                  />
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
