'use client';
import { useEffect, useId, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/utils/format';

type Props = { open: boolean; onClose: () => void; title: string; description?: string; children: React.ReactNode; className?: string };

/** Accessible modal: Escape closes, focus moves in on open and returns on close, Tab is trapped. */
export function Dialog({ open, onClose, title, description, children, className }: Props) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const focusables = () => [...(panel.current?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? [])].filter(el => !el.hasAttribute('disabled'));
    requestAnimationFrame(() => (panel.current?.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0])?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
      if (e.key === 'Tab') {
        const els = focusables();
        if (!els.length) return;
        const first = els[0], last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => { window.removeEventListener('keydown', onKey, true); previous?.focus?.(); };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] grid place-items-end p-0 sm:place-items-center sm:p-4">
          <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            className={cn('glass-strong relative w-full max-w-md rounded-t-3xl p-6 shadow-2xl sm:rounded-3xl', className)}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 id={titleId} className="font-display text-xl font-bold">{title}</h2>
                {description && <p className="mt-1 text-sm text-muted">{description}</p>}
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="icon-btn -mr-2 -mt-1 h-9 w-9"><X size={18} /></button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
