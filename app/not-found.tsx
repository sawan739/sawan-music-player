import Link from 'next/link';
import { LogoMark } from '@/components/brand/logo';

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-6 text-center">
      <div>
        <LogoMark className="mx-auto h-16 w-16 opacity-80" />
        <h1 className="mt-6 font-display text-3xl font-extrabold">This page drifted away</h1>
        <p className="mt-2 text-muted">Like a cloud after the rain. Let&apos;s get you back to the music.</p>
        <Link href="/" className="btn-primary mt-6">Go home</Link>
      </div>
    </div>
  );
}
