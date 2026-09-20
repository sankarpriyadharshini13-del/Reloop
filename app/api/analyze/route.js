import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30; // seconds (Vercel function limit for this route)

const MAX_BYTES = 4 * 1024 * 1024; // Vercel request bodies top out around 4.5 MB
const TIME_BUDGET_MS = 24_000;
const NO_STORE = { 'Cache-Control': 'no-store' };

// microsoft/resnet-50 is tried first. If Hugging Face's serverless provider no longer serves it
// (they have retired models before), other ImageNet-1k classifiers are tried. They share the same
// 1,000 labels, so the e-waste mapping in lib/match.js works for all of them.
const ENDPOINTS = [
  { model: 'microsoft/resnet-50', url: 'https://router.huggingface.co/hf-inference/models/microsoft/resnet-50' },
  { model: 'google/vit-base-patch16-224', url: 'https://router.huggingface.co/hf-inference/models/google/vit-base-patch16-224' },
  { model: 'facebook/convnext-tiny-224', url: 'https://router.huggingface.co/hf-inference/models/facebook/convnext-tiny-224' },
  // Legacy host, kept as a last resort because it is the URL most tutorials still use.
  { model: 'microsoft/resnet-50 (legacy)', url: 'https://api-inference.huggingface.co/models/microsoft/resnet-50' },
];

function demoFallback(reason) {
  return NextResponse.json(
    {
      predictions: [{ label: 'cell phone', score: 0.99 }],
      topLabel: 'cell phone',
      fallback: true,
      reason,
    },
    { headers: NO_STORE }
  );
}

function normalize(data) {
  const list = Array.isArray(data) && Array.isArray(data[0]) ? data[0] : data;
  if (!Array.isArray(list)) return [];
  return list
    .filter((p) => p && typeof p.label === 'string' && typeof p.score === 'number')
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((p) => ({ label: p.label, score: Math.round(p.score * 10000) / 10000 }));
}

async function classify(buffer, contentType, token) {
  const deadline = Date.now() + TIME_BUDGET_MS;

  for (const { model, url } of ENDPOINTS) {
    const remaining = deadline - Date.now();
    if (remaining < 1500) break;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Math.min(remaining, 15_000));

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': contentType,
          Accept: 'application/json',
          'x-wait-for-model': 'true',
        },
        body: buffer,
        signal: controller.signal,
        cache: 'no-store',
      });

      if (!response.ok) {
        console.warn(`[reloop] ${model} responded with HTTP ${response.status}`);
        continue;
      }

      const predictions = normalize(await response.json());
      if (predictions.length > 0) return { predictions, model };
      console.warn(`[reloop] ${model} returned no usable predictions`);
    } catch (error) {
      console.warn(`[reloop] ${model} request failed: ${error?.name || 'Error'}`);
    } finally {
      clearTimeout(timer);
    }
  }

  return null;
}

export async function POST(req) {
  let formData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Send the photo as multipart form data.' }, { status: 400, headers: NO_STORE });
  }

  const file = formData.get('image');
  if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') {
    return NextResponse.json({ error: 'No image found. Attach a photo in the "image" field.' }, { status: 400, headers: NO_STORE });
  }

  const contentType = file.type || 'application/octet-stream';
  if (!contentType.startsWith('image/')) {
    return NextResponse.json({ error: 'That file is not an image.' }, { status: 415, headers: NO_STORE });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'That photo is too large. Keep it under 4 MB.' }, { status: 413, headers: NO_STORE });
  }

  const token = process.env.HF_TOKEN;
  if (!token || token.includes('xxxx')) {
    console.warn('[reloop] HF_TOKEN is not set, returning the demo result.');
    return demoFallback('missing-token');
  }

  const buffer = await file.arrayBuffer();
  const result = await classify(buffer, contentType, token);

  if (!result) return demoFallback('unavailable');

  return NextResponse.json(
    {
      predictions: result.predictions,
      topLabel: result.predictions[0]?.label,
      model: result.model,
      fallback: false,
    },
    { headers: NO_STORE }
  );
}
