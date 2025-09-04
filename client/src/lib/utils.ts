import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '剛剛';
  if (diffMins < 60) return `${diffMins} 分鐘前`;
  if (diffHours < 24) return `${diffHours} 小時前`;
  return `${diffDays} 天前`;
}

export function getSandboxName(value: string): string {
  const names: Record<string, string> = {
    'ytw': 'YouTube Works',
    'flow': 'FLOW',
    'welcome-wall': 'Welcome Wall'
  };
  return names[value] || value;
}

export const sandboxOptions = [
  { value: 'ytw', label: 'YouTube Works' },
  { value: 'flow', label: 'flow' },
  { value: 'welcome-wall', label: 'Welcome Wall' },
];
