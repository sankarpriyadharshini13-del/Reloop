'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, ScanSearch, Sparkles, TriangleAlert } from 'lucide-react';
import UploadBox from './UploadBox';
import ResultCard from './ResultCard';
import ImpactStats from './ImpactStats';
import { compressImage } from '@/lib/image';
import { ewasteItems, findEwasteMatch } from '@/lib/match';

const MAX_INPUT_BYTES = 15 * 1024 * 1024;

export default function ScanClient() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const abortRef = useRef(null);
  const resultRef = useRef(null);

  // Free the object URL whenever the preview changes or the page unmounts.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // On phones the result appears below the fold, so bring it into view.
  useEffect(() => {
    if (result && window.matchMedia('(max-width: 1023px)').matches) {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  const handleFile = useCallback((picked) => {
    if (!picked) return;
    if (!picked.type.startsWith('image/')) {
      setError('That file is not an image. Choose a JPG, PNG or WebP photo.');
      setStatus('error');
      return;
    }
    if (picked.size > MAX_INPUT_BYTES) {
      setError('That photo is over 15 MB. Choose a smaller one.');
      setStatus('error');
      return;
    }
    setError('');
    setResult(null);
    setStatus('idle');
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
    setStatus('idle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const analyze = async () => {
    if (!file || status === 'loading') return;

    const controller = new AbortController();
    abortRef.current = controller;
    setStatus('loading');
    setError('');
    setResult(null);

    try {
      const blob = await compressImage(file);
      const formData = new FormData();
      formData.append('image', blob, 'scan.jpg');

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong while analyzing the photo. Please try again.');
      }

      const predictions = Array.isArray(data.predictions) ? data.predictions : [];
      setResult({
        scanId: Date.now(),
        match: findEwasteMatch(predictions),
        predictions,
        fallback: Boolean(data.fallback),
        manual: false,
      });
      setStatus('done');
    } catch (err) {
      if (err?.name === 'AbortError') return;
      setError(
        err instanceof TypeError
          ? 'We could not reach the server. Check your connection and try again.'
          : err.message || 'Something went wrong. Please try again.'
      );
      setStatus('error');
    }
  };

  const pickManually = (key) => {
    setResult({
      scanId: Date.now(),
      match: { key, item: ewasteItems[key], label: null, score: null },
      predictions: [],
      fallback: false,
      manual: true,
    });
  };

  const loading = status === 'loading';

  return (
    <div className="relative overflow-x-clip">
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-green-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-96 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
        <header className="max-w-2xl">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Scan your e-waste</h1>
          <p className="mt-3 text-lg text-slate-400">
            Upload a photo of an old phone, charger, laptop or any other electronic item. We&apos;ll tell you what it is
            and what to do with it.
          </p>
        </header>

        <ImpactStats className="mt-8" />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start">
          {/* Left: upload */}
          <div className="space-y-4 lg:sticky lg:top-24">
            <UploadBox preview={preview} loading={loading} onFile={handleFile} onClear={reset} />

            <button type="button" onClick={analyze} disabled={!file || loading} className="btn-primary w-full">
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  AI is analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                  Analyze with AI
                </>
              )}
            </button>

            {!file && !error && <p className="text-center text-sm text-slate-500">Add a photo to enable analysis.</p>}

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200"
              >
                <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <p>{error}</p>
              </div>
            )}
          </div>

          {/* Right: result */}
          <div ref={resultRef} className="scroll-mt-24">
            {loading && <AnalyzingCard />}

            {!loading && result?.match && (
              <ResultCard
                key={result.scanId}
                itemKey={result.match.key}
                item={result.match.item}
                preview={preview}
                confidence={result.match.score}
                modelLabel={result.match.label}
                fallback={result.fallback}
                manual={result.manual}
                onReset={reset}
              />
            )}

            {!loading && result && !result.match && (
              <NoMatchCard predictions={result.predictions} onPick={pickManually} onReset={reset} />
            )}

            {!loading && !result && <PlaceholderCard />}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyzingCard() {
  return (
    <div className="glass-strong p-6 sm:p-8" role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-green-400" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-white">AI is analyzing...</h2>
      </div>
      <p className="mt-2 text-sm text-slate-400">
        Identifying the item, checking its materials and working out your CO₂ savings.
      </p>
      <div className="mt-6 space-y-3" aria-hidden="true">
        <div className="h-16 animate-pulse rounded-2xl bg-white/[0.06]" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-24 animate-pulse rounded-2xl bg-white/[0.06]" />
          <div className="h-24 animate-pulse rounded-2xl bg-white/[0.06] [animation-delay:150ms]" />
          <div className="h-24 animate-pulse rounded-2xl bg-white/[0.06] [animation-delay:300ms]" />
        </div>
        <div className="h-24 animate-pulse rounded-2xl bg-white/[0.06] [animation-delay:450ms]" />
      </div>
    </div>
  );
}

function PlaceholderCard() {
  const items = [
    ['What it is', 'The item, its category and how sure the AI is.'],
    ['What is inside', 'Toxic materials that must never reach a landfill.'],
    ['What you save', 'CO₂ avoided, in kilograms and in tree-days.'],
    ['Where to take it', 'A map of e-waste recycling centers near you.'],
  ];
  return (
    <div className="glass p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-white">Your result will appear here</h2>
      <p className="mt-2 text-sm text-slate-400">After you analyze a photo, you get:</p>
      <dl className="mt-5 space-y-4">
        {items.map(([title, text]) => (
          <div key={title} className="flex gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green-500" aria-hidden="true" />
            <div>
              <dt className="font-medium text-white">{title}</dt>
              <dd className="text-sm text-slate-400">{text}</dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}

function NoMatchCard({ predictions, onPick, onReset }) {
  const guesses = predictions.slice(0, 3);
  return (
    <div className="glass-strong animate-fade-up p-6 sm:p-8">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-400/15 text-amber-300">
        <ScanSearch className="h-6 w-6" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-2xl font-bold text-white">We couldn&apos;t spot an e-waste item</h2>
      <p className="mt-2 text-slate-400">
        The AI is better with a single, well-lit device in the middle of the frame. Try another photo, or pick your item
        below.
      </p>

      {guesses.length > 0 && (
        <p className="mt-4 text-sm text-slate-500">
          The model&apos;s best guesses:{' '}
          {guesses.map((g, i) => (
            <span key={g.label}>
              {i > 0 && ', '}
              {g.label.split(',')[0]} ({Math.round(g.score * 100)}%)
            </span>
          ))}
        </p>
      )}

      <h3 className="mt-6 text-sm font-semibold text-white">Pick your item</h3>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Object.entries(ewasteItems).map(([key, item]) => (
          <button
            key={key}
            type="button"
            onClick={() => onPick(key)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-left text-sm font-medium text-slate-200 transition hover:border-green-400/60 hover:bg-green-500/10"
          >
            <span aria-hidden="true">{item.emoji}</span>
            <span className="truncate">{item.name}</span>
          </button>
        ))}
      </div>

      <button type="button" onClick={onReset} className="btn-ghost mt-6 w-full">
        Try another photo
      </button>
    </div>
  );
}
