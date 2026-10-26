'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { NAV_ITEMS, isActive } from './nav';
import { cn } from '@/utils/format';

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="glass-strong relative z-30 border-x-0 border-b-0 pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link href={href} aria-current={active ? 'page' : undefined} className={cn('relative flex h-full flex-col items-center justify-center gap-1 text-[0.7rem] font-semibold transition', active ? 'text-mist' : 'text-faint hover:text-muted')}>
                {active && <motion.span layoutId="mobile-nav-active" className="absolute top-0 h-[3px] w-10 rounded-full bg-accent" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
                <motion.span animate={{ scale: active ? 1.12 : 1, y: active ? -1 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
                  <Icon size={22} className={active ? 'text-accent' : ''} />
                </motion.span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
