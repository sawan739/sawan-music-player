'use client';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

function greetingFor(hour: number) {
  if (hour < 5) return 'Up late';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Time-aware greeting; computed after mount so server and client markup match. */
export function Greeting() {
  const [text, setText] = useState('Welcome back');
  useEffect(() => setText(greetingFor(new Date().getHours())), []);
  return (
    <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
      {text}, <span className="text-gradient">Sawan</span>
    </motion.h1>
  );
}
