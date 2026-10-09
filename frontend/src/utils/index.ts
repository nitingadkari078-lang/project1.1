import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const config = {
  apiUrl: '/api',
  appName: 'MediVault',
  version: '0.1.0'
};

