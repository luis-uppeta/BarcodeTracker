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
    'vigenair': 'VigenAiR',
    'videomate': 'VideoMate',
    'feedgen': 'FeedGen',
    'advatars': 'Advatars',
    'sandbox5': 'Sandbox 5',
    'sandbox6': 'Sandbox 6',
    'sandbox7': 'Sandbox 7',
    'sandbox8': 'Sandbox 8'
  };
  return names[value] || value;
}

export const sandboxOptions = [
  { value: 'vigenair', label: 'VigenAiR' },
  { value: 'videomate', label: 'VideoMate' },
  { value: 'feedgen', label: 'FeedGen' },
  { value: 'advatars', label: 'Advatars' },
  { value: 'sandbox5', label: 'Sandbox 5' },
  { value: 'sandbox6', label: 'Sandbox 6' },
  { value: 'sandbox7', label: 'Sandbox 7' },
  { value: 'sandbox8', label: 'Sandbox 8' },
];
