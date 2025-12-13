'use client';

import { useTheme } from 'next-themes';
import { CyberpunkBackground } from './cyberpunk-background';

export function CyberpunkBackgroundWrapper() {
  const { theme } = useTheme();
  
  if (theme === 'cyberpunk') {
    return <CyberpunkBackground />;
  }
  
  return null;
}
