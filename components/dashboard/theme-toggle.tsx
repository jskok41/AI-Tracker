'use client';

import { Moon, Sun, Zap } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        disabled
      >
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const themes = [
    { id: 'light', label: 'Light Mode', icon: Sun },
    { id: 'dark', label: 'Dark Mode', icon: Moon },
    { id: 'cyberpunk', label: 'Cyberpunk Mode', icon: Zap },
  ];

  const currentTheme = themes.find(t => t.id === theme) || themes[0];
  const CurrentIcon = currentTheme.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-9 w-9 transition-all",
            "hover:bg-accent hover:text-accent-foreground",
            "border-border",
            theme === 'cyberpunk' && "border-[#00FF41]/30 hover:border-[#00FF41]/50 cyberpunk:text-[#00FF41]"
          )}
          title="Select Theme"
          aria-label="Select Theme"
        >
          <CurrentIcon className="h-4 w-4 transition-all" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="cyberpunk:bg-black/90 cyberpunk:backdrop-blur-sm cyberpunk:border-[#00FF41]/30">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          const isActive = theme === themeOption.id;
          
          return (
            <DropdownMenuItem
              key={themeOption.id}
              onClick={() => setTheme(themeOption.id)}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                isActive && "bg-accent",
                "cyberpunk:text-white cyberpunk:hover:bg-[#00FF41]/10 cyberpunk:hover:text-[#00FF41]",
                isActive && themeOption.id === 'cyberpunk' && "cyberpunk:bg-[#00FF41]/20 cyberpunk:text-[#00FF41]"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{themeOption.label}</span>
              {isActive && (
                <span className="ml-auto text-xs text-muted-foreground cyberpunk:text-[#00FF41]/70">✓</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
