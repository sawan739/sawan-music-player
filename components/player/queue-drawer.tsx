'use client';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { QueueList } from './queue-list';
import { useUIStore } from '@/store/ui-store';

export function QueueDrawer() {
  const open = useUIStore(s => s.queueOpen);
  const setOpen = useUIStore(s => s.setQueueOpen);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="scrim" className="fixed inset-0 z-[58] bg-black/50 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
          <motion.aside
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Queue"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="glass-strong fixed inset-y-0 right-0 z-[60] flex w-full max-w-md flex-col border-y-0 border-r-0 shadow-2xl"
          >
            <header className="flex items-center justify-between px-5 pb-3 pt-5">
              <h2 className="font-display text-xl font-bold">Queue</h2>
              <button type="button" autoFocus aria-label="Close queue" onClick={() => setOpen(false)} className="icon-btn"><X size={20} /></button>
            </header>
            <QueueList className="flex-1 overflow-y-auto px-4 pb-8" />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
