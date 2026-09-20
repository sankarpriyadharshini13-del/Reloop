'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Camera, Leaf, Menu, Recycle, X } from 'lucide-react';
import { useImpact } from '@/lib/useImpact';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#impact', label: 'Impact' },
  { href: '/scan', label: 'Scan' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { score } = useImpact();

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-ink/80 px-3 py-2.5 shadow-lg shadow-black/20 backdrop-blur-xl sm:px-5"
      >
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-glow">
            <Recycle className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <span className="font-display text-xl font-bold text-white">
            ReLoop <span aria-hidden="true">♻️</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const active = link.href === pathname;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                    active ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          {score > 0 && (
            <span
              className="hidden items-center gap-1.5 rounded-xl bg-green-500/15 px-3 py-2 text-sm font-semibold text-green-300 sm:inline-flex"
              title="Your Green Score"
            >
              <Leaf className="h-4 w-4" aria-hidden="true" />
              {score}
              <span className="sr-only"> Green Score points</span>
            </span>
          )}
          <Link
            href="/scan"
            className="hidden items-center gap-2 rounded-xl bg-gradient-to-br from-green-500 to-green-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-green-600/30 transition hover:brightness-110 md:inline-flex"
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            Scan now
          </Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div
          id="mobile-menu"
          className="glass-strong mx-auto mt-2 max-w-6xl !bg-ink p-2 md:hidden"
        >
          <ul className="flex flex-col">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 font-medium text-slate-200 hover:bg-white/5"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {score > 0 && (
            <p className="mt-1 flex items-center gap-2 border-t border-white/10 px-4 pt-3 pb-2 text-sm text-green-300">
              <Leaf className="h-4 w-4" aria-hidden="true" />
              Green Score: {score}
            </p>
          )}
        </div>
      )}
    </header>
  );
}
