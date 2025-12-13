'use client';

import { Bell, Search, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { toast } from 'sonner';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function Header() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    toast.success('Signed out successfully');
    router.push('/auth/login');
  };

  const handleProfileClick = () => {
    toast.info('Profile page coming soon');
  };

  const handleSettingsClick = () => {
    toast.info('Settings page coming soon');
  };

  const handleHelpClick = () => {
    toast.info('Help & Support coming soon');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      {/* Search */}
      <div className="flex flex-1 items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search projects, metrics, agents..."
            className="h-10 w-full rounded-lg border bg-background pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-96 overflow-y-auto">
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Budget Warning</p>
                  <p className="text-xs text-muted-foreground">
                    Project spending at 85% of allocated budget
                  </p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">KPI Target Exceeded</p>
                  <p className="text-xs text-muted-foreground">
                    Customer Satisfaction Score exceeded target
                  </p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Risk Alert</p>
                  <p className="text-xs text-muted-foreground">
                    Critical risk requires immediate attention
                  </p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{session?.user?.name || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session?.user?.email || ''}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfileClick}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={handleSettingsClick}>Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={handleHelpClick}>Help & Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

