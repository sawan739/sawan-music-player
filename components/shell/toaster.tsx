'use client';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Heart, ListEnd, Info } from 'lucide-react';
import { useUIStore, type ToastTone } from '@/store/ui-store';

const ICONS: Record<ToastTone, React.ReactNode> = {
  default: <Info size={17} className="text-muted" />,
  like: <Heart size={17} className="text-blush-400" fill="currentColor" />,
  success: <CheckCircle2 size={17} className="text-rain-400" />,
  error: <AlertCircle size={17} className="text-blush-400" />,
  queue: <ListEnd size={17} className="text-dusk-400" />,
};

export function Toaster() {
  const toasts = useUIStore(s => s.toasts);
  const dismiss = useUIStore(s => s.dismissToast);
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[9.5rem] z-[90] flex flex-col items-center gap-2 px-4 md:bottom-28">
      <AnimatePresence initial={false}>
        {toasts.map(t => (
          <motion.button
            type="button"
            key={t.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', damping: 24, stiffness: 380 }}
            onClick={() => dismiss(t.id)}
            className="glass-strong pointer-events-auto flex max-w-md items-center gap-3 rounded-full px-4 py-2.5 text-left text-sm font-medium text-mist shadow-card"
          >
            {ICONS[t.tone]}
            <span className="line-clamp-2">{t.message}</span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
