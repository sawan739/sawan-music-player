'use client';
import { cn } from '@/utils/format';

type Props = {
  value: number;
  max: number;
  step?: number;
  label: string;
  valueText?: string;
  onChange: (value: number) => void;
  onCommit?: (value: number) => void;
  disabled?: boolean;
  className?: string;
  thick?: boolean;
};

/**
 * A native range input (keyboard + screen reader support for free) layered over a
 * custom track. The fill uses `transform: scaleX` so updates stay on the compositor.
 */
export function Slider({ value, max, step = 1, label, valueText, onChange, onCommit, disabled, className, thick }: Props) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const commit = (e: React.SyntheticEvent<HTMLInputElement>) => onCommit?.(Number(e.currentTarget.value));
  return (
    <div className={cn('group/slider relative flex h-5 items-center', disabled && 'opacity-50', className)}>
      <div className={cn('relative w-full overflow-hidden rounded-full bg-white/15 transition-[height] duration-200 group-hover/slider:h-1.5', thick ? 'h-1.5' : 'h-1')}>
        <div
          className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-gradient-to-r from-rain-400 to-accent transition-colors group-hover/slider:from-rain-300"
          style={{ transform: `scaleX(${ratio})` }}
        />
      </div>
      <div
        className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-white shadow-[0_0_0_4px_rgb(var(--accent)/.25)] transition-transform duration-200 group-focus-within/slider:scale-100 group-hover/slider:scale-100"
        style={{ left: `${ratio * 100}%` }}
      />
      <input
        type="range"
        aria-label={label}
        aria-valuetext={valueText}
        min={0}
        max={max || 1}
        step={step}
        value={Math.min(value, max || 1)}
        disabled={disabled}
        onChange={e => onChange(Number(e.target.value))}
        onPointerUp={commit}
        onKeyUp={commit}
        onTouchEnd={commit}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-default"
      />
    </div>
  );
}
