'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Check,
  CheckCircle2,
  ExternalLink,
  FlaskConical,
  Info,
  Leaf,
  Lightbulb,
  Loader2,
  MapPin,
  Navigation,
  RotateCcw,
  Share2,
  TreePine,
  Trophy,
  TriangleAlert,
  Wind,
} from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';
import { POINTS_PER_SCAN, addScan, formatKg, formatTreeTime, treeDaysFor } from '@/lib/impact';
import { useImpact } from '@/lib/useImpact';

const DEFAULT_MAP =
  'https://maps.google.com/maps?q=e-waste+recycling+center+near+me&z=12&output=embed';

function mapEmbedUrl(coords) {
  if (!coords) return DEFAULT_MAP;
  const q = encodeURIComponent(`e-waste recycling center near ${coords.lat},${coords.lng}`);
  return `https://maps.google.com/maps?q=${q}&z=13&output=embed`;
}

function mapLinkUrl(coords) {
  const query = coords ? `e-waste recycling center near ${coords.lat},${coords.lng}` : 'e-waste recycling center near me';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function Tile({ icon: Icon, label, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
        <Icon className="h-4 w-4 text-green-400" aria-hidden="true" />
        {label}
      </div>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

export default function ResultCard({
  itemKey,
  item,
  preview,
  confidence = null,
  modelLabel = null,
  fallback = false,
  manual = false,
  onReset,
}) {
  const impact = useImpact();
  const awarded = useRef(false);
  const [gain, setGain] = useState(0);
  const [copied, setCopied] = useState(false);
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState('');

  const co2 = Number(item.co2);
  const treeDays = treeDaysFor(co2);
  const treeTime = formatTreeTime(treeDays);
  const toxicList = String(item.toxic)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const percent = confidence != null ? Math.round(confidence * 100) : null;

  // Award the Green Score exactly once per result.
  useEffect(() => {
    if (awarded.current) return;
    awarded.current = true;
    addScan({ co2 });
    setGain(POINTS_PER_SCAN);
  }, [co2]);

  const locate = () => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setGeoError('Location is not available in this browser. Use the Google Maps link instead.');
      return;
    }
    setLocating(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: Number(pos.coords.latitude.toFixed(4)),
          lng: Number(pos.coords.longitude.toFixed(4)),
        });
        setLocating(false);
      },
      () => {
        setGeoError('We could not get your location. Allow location access, or open Google Maps and search your area.');
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  };

  const share = async () => {
    const text = `I just kept a ${item.name.toLowerCase()} out of landfill with ReLoop ♻️ It saves about ${formatKg(co2)} kg of CO₂, roughly ${treeTime} of one tree's work. My Green Score: ${impact.score}.`;
    const url = window.location.origin;

    const copyToClipboard = async () => {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    };

    try {
      if (navigator.share) {
        await navigator.share({ title: 'ReLoop', text, url });
      } else {
        await copyToClipboard();
      }
    } catch (error) {
      if (error?.name === 'AbortError') return;
      try {
        await copyToClipboard();
      } catch {
        /* nothing else to try */
      }
    }
  };

  return (
    <article className="glass-strong animate-fade-up overflow-hidden" aria-live="polite">
      {/* Header */}
      <div className="border-b border-white/10 bg-gradient-to-br from-green-500/20 via-green-600/5 to-transparent p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div
            className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-3xl shadow-glow"
            aria-hidden="true"
          >
            {item.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-green-400">Detected item</p>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">{item.name}</h2>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {item.recyclable ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1 text-sm font-semibold text-white">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Recyclable
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-600 px-3 py-1 text-sm font-semibold text-white">
                  Limited recycling
                </span>
              )}
              <span className="rounded-full border border-white/15 px-3 py-1 text-sm text-slate-300">
                {item.category}
              </span>
              {item.hazard === 'high' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1 text-sm font-medium text-amber-300">
                  <TriangleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                  Special handling
                </span>
              )}
            </div>
          </div>
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Your uploaded photo"
              className="hidden h-16 w-16 shrink-0 rounded-xl border border-white/15 object-cover sm:block"
            />
          )}
        </div>

        {fallback ? (
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-400/10 px-3.5 py-2.5 text-sm text-amber-200">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              The AI service could not be reached, so this is a sample result and not based on your photo. Try again in a
              moment.
            </span>
          </p>
        ) : manual ? (
          <p className="mt-4 text-sm text-slate-400">You picked this item manually.</p>
        ) : (
          percent != null && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">AI confidence</span>
                <span className="font-semibold text-white">{percent}%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-300"
                  style={{ width: `${Math.max(percent, 3)}%` }}
                />
              </div>
              {modelLabel && (
                <p className="mt-1.5 truncate text-xs text-slate-500" title={modelLabel}>
                  The model saw: {modelLabel}
                </p>
              )}
            </div>
          )
        )}
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        {/* Facts */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Tile icon={FlaskConical} label="Toxic materials">
            <div className="flex flex-wrap gap-1.5">
              {toxicList.map((t) => (
                <span key={t} className="rounded-lg bg-white/[0.07] px-2 py-1 text-xs font-medium text-slate-200">
                  {t}
                </span>
              ))}
            </div>
          </Tile>

          <Tile icon={Wind} label="CO₂ saved">
            <p className="font-display text-3xl font-bold text-white">
              {formatKg(co2)}
              <span className="ml-1 text-base font-medium text-slate-400">kg</span>
            </p>
          </Tile>

          <Tile icon={TreePine} label="Tree equivalent">
            <p className="font-display text-xl font-bold leading-tight text-white">1 tree for {treeTime}</p>
            <p className="mt-1 text-xs text-slate-400">of absorbing CO₂</p>
          </Tile>
        </div>

        {/* Tip */}
        <div className="flex gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-green-400" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-white">Before you drop it off</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-300">{item.tip}</p>
          </div>
        </div>

        {/* Green score */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-5 text-white shadow-glow">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/20" aria-hidden="true">
                <Trophy className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-medium text-green-50">Green Score</p>
                <p className="font-display text-4xl font-extrabold leading-none">
                  <AnimatedNumber value={impact.score} />
                </p>
              </div>
            </div>
            {gain > 0 && (
              <span
                key={itemKey}
                className="animate-pop rounded-full bg-white px-4 py-2 font-display text-xl font-extrabold text-green-600 shadow-lg"
              >
                +{gain}
              </span>
            )}
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-green-50/90">
            <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
            Saved on this device. Every scan adds {POINTS_PER_SCAN} points.
          </p>
        </div>

        {/* Map */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <MapPin className="h-5 w-5 text-green-400" aria-hidden="true" />
              Nearest recycling centers
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={locate}
                disabled={locating}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.07] px-3 py-2 text-sm font-medium text-white transition hover:bg-white/[0.12] disabled:opacity-60"
              >
                {locating ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Navigation className="h-4 w-4" aria-hidden="true" />
                )}
                {coords ? 'Location set' : 'Use my location'}
              </button>
              <a
                href={mapLinkUrl(coords)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.07] px-3 py-2 text-sm font-medium text-white transition hover:bg-white/[0.12]"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Open in Maps
              </a>
            </div>
          </div>
          {geoError && <p className="mt-2 text-sm text-amber-300">{geoError}</p>}
          <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-ink-deep">
            <iframe
              key={mapEmbedUrl(coords)}
              src={mapEmbedUrl(coords)}
              title="Map of e-waste recycling centers near you"
              className="h-64 w-full border-0 sm:h-80"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={onReset} className="btn-primary flex-1">
            <RotateCcw className="h-5 w-5" aria-hidden="true" />
            Scan another
          </button>
          <button type="button" onClick={share} className="btn-ghost flex-1">
            {copied ? <Check className="h-5 w-5 text-green-400" aria-hidden="true" /> : <Share2 className="h-5 w-5" aria-hidden="true" />}
            {copied ? 'Copied to clipboard' : 'Share impact'}
          </button>
        </div>

        <p className="text-center text-xs text-slate-500">
          CO₂ figures are approximate averages for recycling instead of landfilling. Real savings vary by model and
          local recycling process.
        </p>
      </div>
    </article>
  );
}
