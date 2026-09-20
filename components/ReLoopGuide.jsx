'use client';

import { useRef, useState } from 'react';
import { Bot, Camera, ExternalLink, Loader2, MapPin, MessageCircle, Send, X } from 'lucide-react';
import { compressImage } from '@/lib/image';
import { findEwasteMatch } from '@/lib/match';

const QUICK_ACTIONS = [
  { label: 'How do I use ReLoop?' },
  { label: 'Why recycle electronics?' },
  { label: 'What can I scan?' },
];

function answerQuestion(question) {
  const text = question.toLowerCase();
  if (text.includes('map') || text.includes('near') || text.includes('shop') || text.includes('location')) {
    return 'I can help you find a nearby e-waste recycling centre. Tap “Find nearby” below and allow location access for a more accurate Google Maps search.';
  }
  if (text.includes('photo') || text.includes('image') || text.includes('scan') || text.includes('upload')) {
    return 'Tap the camera button in this chat, choose a clear photo of one device, and I will analyze it. For the most accurate result, keep the device well lit and centered.';
  }
  if (text.includes('why') || text.includes('use') || text.includes('purpose') || text.includes('benefit')) {
    return 'ReLoop helps you understand what an old electronic item is, how to handle it safely, how much CO₂ recycling can save, and where to take it next.';
  }
  if (text.includes('battery') || text.includes('safe') || text.includes('prepare')) {
    return 'Before drop-off, back up and erase personal data, remove batteries only if they are designed to come out safely, and never put swollen or damaged batteries in household waste.';
  }
  return 'I can explain how ReLoop works, why e-waste recycling matters, what you can scan, how to prepare a device, or help you find a nearby recycling centre.';
}

function mapsUrl(coords) {
  const query = coords ? `e-waste recycling center near ${coords.lat},${coords.lng}` : 'e-waste recycling center near me';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export default function ReLoopGuide() {
  const fileRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi, I am your ReLoop guide. Ask me how it works, send an electronics photo, or find a nearby recycling centre.' },
  ]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);

  const addBotMessage = (text) => setMessages((current) => [...current, { from: 'bot', text }]);

  const ask = (text = question) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((current) => [...current, { from: 'user', text: trimmed }, { from: 'bot', text: answerQuestion(trimmed) }]);
    setQuestion('');
  };

  const analyzePhoto = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      addBotMessage('Please choose a JPG, PNG, or WebP image of an electronic device.');
      return;
    }
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const blob = await compressImage(file);
      const formData = new FormData();
      formData.append('image', blob, 'reloop-guide-scan.jpg');
      const response = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'The photo could not be analyzed.');
      const predictions = Array.isArray(data.predictions) ? data.predictions : [];
      const match = findEwasteMatch(predictions);
      setAnalysis({ match, fallback: Boolean(data.fallback) });
      addBotMessage(match ? `I found a possible ${match.item.name}. See the quick result below for what to do next.` : 'I could not confidently identify that item. Try one well-lit photo with a single device in the frame.');
    } catch (error) {
      addBotMessage(error.message || 'I could not reach the analyzer. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const findNearby = () => {
    if (!navigator.geolocation) {
      addBotMessage('Location is not available in this browser. You can still open Google Maps and search nearby recycling centres.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude.toFixed(4), lng: position.coords.longitude.toFixed(4) });
        setLocating(false);
      },
      () => {
        setLocating(false);
        addBotMessage('I could not access your location. Open the map link and choose your area in Google Maps.');
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60] sm:bottom-6 sm:right-6">
      {open && (
        <section className="glass-strong mb-3 flex w-[min( calc(100vw-2rem),24rem)] max-w-[calc(100vw-2rem)] flex-col overflow-hidden shadow-2xl shadow-black/40 sm:w-96" aria-label="ReLoop guide chat">
          <header className="flex items-center justify-between border-b border-white/10 bg-green-500/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-green-500 text-white shadow-glow"><Bot className="h-5 w-5" aria-hidden="true" /></span>
              <div><p className="font-display font-bold text-white">ReLoop Guide</p><p className="text-xs text-green-300">Here to help you loop it back</p></div>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl text-slate-300 transition hover:bg-white/10 hover:text-white" aria-label="Close ReLoop Guide"><X className="h-5 w-5" /></button>
          </header>

          <div className="max-h-[min(24rem,52vh)] space-y-3 overflow-y-auto p-4" aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${message.from}-${index}`} className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${message.from === 'user' ? 'rounded-br-md bg-green-500 text-white' : 'rounded-bl-md bg-white/[0.07] text-slate-200'}`}>{message.text}</p>
              </div>
            ))}

            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action) => <button key={action.label} type="button" onClick={() => ask(action.label)} className="rounded-full border border-green-400/25 bg-green-500/10 px-3 py-1.5 text-left text-xs font-medium text-green-200 transition hover:bg-green-500/20">{action.label}</button>)}
            </div>

            {analysis?.match && (
              <div className="rounded-2xl border border-green-400/20 bg-green-500/10 p-3.5">
                <div className="flex items-start gap-3"><span className="text-2xl" aria-hidden="true">{analysis.match.item.emoji}</span><div className="min-w-0"><p className="text-xs font-medium text-green-300">Possible match</p><p className="font-display text-lg font-bold text-white">{analysis.match.item.name}</p><p className="mt-1 text-xs leading-relaxed text-slate-300">{analysis.match.item.tip}</p></div></div>
                {analysis.fallback && <p className="mt-2 text-xs text-amber-200">Demo result: connect HF_TOKEN for photo-based AI detection.</p>}
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold text-white">Find a nearby drop-off</p><MapPin className="h-4 w-4 text-green-400" aria-hidden="true" /></div>
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={findNearby} disabled={locating} className="btn-primary !flex-1 !rounded-xl !px-3 !py-2.5 text-sm">{locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />} {locating ? 'Locating...' : 'Use my location'}</button>
                <a href={mapsUrl(location)} target="_blank" rel="noreferrer" className="btn-ghost !rounded-xl !px-3 !py-2.5" aria-label="Open nearby recycling centres in Google Maps" title="Open Google Maps"><ExternalLink className="h-4 w-4" /></a>
              </div>
              {location && <a href={mapsUrl(location)} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-1 text-xs font-medium text-green-300 hover:text-green-200"><ExternalLink className="h-3 w-3" /> Open nearby electronics shops in Google Maps</a>}
            </div>
          </div>

          <form onSubmit={(event) => { event.preventDefault(); ask(); }} className="flex items-center gap-2 border-t border-white/10 p-3">
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => { analyzePhoto(event.target.files?.[0]); event.target.value = ''; }} />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={analyzing} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 text-green-300 transition hover:bg-white/10 disabled:opacity-50" aria-label="Analyze an electronics photo" title="Analyze a photo"><Camera className="h-5 w-5" /></button>
            <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask ReLoop..." className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-green-400/50 focus:outline-none" aria-label="Ask ReLoop a question" />
            <button type="submit" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-green-500 text-white transition hover:bg-green-400" aria-label="Send question"><Send className="h-4 w-4" /></button>
          </form>
        </section>
      )}

      <button type="button" onClick={() => setOpen((value) => !value)} className="group ml-auto grid h-14 w-14 place-items-center rounded-full border border-green-300/30 bg-green-500 text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-green-400" aria-expanded={open} aria-label={open ? 'Close ReLoop Guide' : 'Open ReLoop Guide'}>
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6 transition group-hover:scale-110" />}
      </button>
    </div>
  );
}