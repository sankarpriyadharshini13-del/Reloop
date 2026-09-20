'use client';

import { useEffect, useRef, useState } from 'react';

/** Counts smoothly from the previously shown value to the new one. */
export default function AnimatedNumber({ value, decimals = 0, duration = 900, className = '' }) {
  const [display, setDisplay] = useState(value);
  const shown = useRef(value);

  useEffect(() => {
    const from = shown.current;
    const to = value;
    if (from === to) return undefined;

    let frame;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (to - from) * eased;
      shown.current = next;
      setDisplay(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <span className={className}>{display.toFixed(decimals)}</span>;
}
