'use client';

import { Recycle, TreePine, Trophy, Wind } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';
import { getLevel } from '@/lib/impact';
import { useImpact } from '@/lib/useImpact';

function Stat({ icon: Icon, label, children }) {
  return (
    <div className="rounded-xl bg-white/[0.04] px-4 py-3">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Icon className="h-3.5 w-3.5 text-green-400" aria-hidden="true" />
        {label}
      </div>
      <div className="mt-1 font-display text-2xl font-bold text-white">{children}</div>
    </div>
  );
}

/** Personal impact summary, stored on this device only. */
export default function ImpactStats({ className = '' }) {
  const { score, scans, co2 } = useImpact();
  const level = getLevel(score);
  const treeDays = Math.round(co2 * 10);

  return (
    <section className={`glass p-4 sm:p-5 ${className}`} aria-label="Your impact so far">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="text-sm font-semibold text-white">
          Your level: <span className="text-green-400">{level.name}</span>
        </p>
        <p className="text-xs text-slate-400">
          {scans === 0
            ? 'Scan your first item to start your Green Score.'
            : level.next
              ? `${level.toNext} points to ${level.next}`
              : 'You reached the top level.'}
        </p>
      </div>

      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(level.progress * 100)}
        aria-label="Progress to next level"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-700"
          style={{ width: `${Math.max(level.progress * 100, scans > 0 ? 4 : 0)}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat icon={Trophy} label="Green Score">
          <AnimatedNumber value={score} />
        </Stat>
        <Stat icon={Recycle} label="Items scanned">
          <AnimatedNumber value={scans} />
        </Stat>
        <Stat icon={Wind} label="CO₂ saved">
          <AnimatedNumber value={co2} decimals={1} />
          <span className="ml-1 text-sm font-medium text-slate-400">kg</span>
        </Stat>
        <Stat icon={TreePine} label="Tree-days">
          <AnimatedNumber value={treeDays} />
        </Stat>
      </div>
    </section>
  );
}
