import ewasteData from '@/data/ewasteData.json';

// ResNet-50 predicts the 1,000 ImageNet classes, so its labels look like
// "cellular telephone, cellular phone, cellphone, cell, mobile phone".
// Every item in ewasteData.json lists the ImageNet aliases that should map to it.

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const compiled = Object.entries(ewasteData).map(([key, item]) => ({
  key,
  patterns: [key, ...(item.keywords || [])].map((keyword) => {
    const k = keyword.toLowerCase();
    return { length: k.length, regex: new RegExp(`\\b${escapeRegExp(k)}s?\\b`) };
  }),
}));

/** Returns the ewasteData key for a model label, or null. The longest matching keyword wins. */
export function matchLabel(label) {
  const text = String(label || '').toLowerCase();
  let best = null;
  for (const { key, patterns } of compiled) {
    for (const p of patterns) {
      if (p.regex.test(text) && (!best || p.length > best.length)) {
        best = { key, length: p.length };
      }
    }
  }
  return best ? best.key : null;
}

/**
 * Walks the model's predictions (best first) and returns the first one that maps to a known
 * e-waste item with a meaningful score.
 */
export function findEwasteMatch(predictions, minScore = 0.04) {
  if (!Array.isArray(predictions)) return null;
  for (const prediction of predictions) {
    if (!prediction || typeof prediction.label !== 'string') continue;
    if (typeof prediction.score === 'number' && prediction.score < minScore) continue;
    const key = matchLabel(prediction.label);
    if (key) {
      return {
        key,
        item: ewasteData[key],
        label: prediction.label,
        score: typeof prediction.score === 'number' ? prediction.score : null,
      };
    }
  }
  return null;
}

export const ewasteItems = ewasteData;
