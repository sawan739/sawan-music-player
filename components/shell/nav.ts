import { Compass, Home, Library, Search } from 'lucide-react';

export const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/discover', label: 'Discover', icon: Compass },
  { href: '/library', label: 'Library', icon: Library },
] as const;

export const isActive = (pathname: string, href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`));
