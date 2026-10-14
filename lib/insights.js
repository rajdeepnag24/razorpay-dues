// Demo history for the Insights screen (illustrative, last 60 days).
// Each nudge: who, which tone, amount covered, and days until paid (null = still unpaid).
export const nudgeHistory = [
  { client: 'Lane 9 Café', tone: 'Friendly', amount: 3400, paidAfter: 2 },
  { client: 'Green Fern Café', tone: 'Direct', amount: 2900, paidAfter: 4 },
  { client: 'Studio 12 Café', tone: 'Friendly', amount: 2800, paidAfter: 1 },
  { client: 'Kaapi Corner', tone: 'Firm', amount: 5200, paidAfter: 6 },
  { client: 'Lane 9 Café', tone: 'Direct', amount: 2600, paidAfter: 9 },
  { client: 'Green Fern Café', tone: 'Friendly', amount: 1800, paidAfter: 3 },
  { client: 'Kaapi Corner', tone: 'Friendly', amount: 3900, paidAfter: 11 },
  { client: 'Studio 12 Café', tone: 'Direct', amount: 2400, paidAfter: 2 },
  { client: 'Lane 9 Café', tone: 'Firm', amount: 3100, paidAfter: 5 },
  { client: 'Kaapi Corner', tone: 'Friendly', amount: 6200, paidAfter: null },
];

// Overdue links that were never nudged, same period (the comparison group).
export const notNudged = { links: 12, paidIn7: 4, medianDays: 13 };

// Total overdue at the end of each of the last 8 weeks (₹).
export const overdueTrend = [24600, 22100, 25300, 21800, 19400, 20900, 17600];

function median(a) {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function computeInsights(history = nudgeHistory) {
  const paid = history.filter((h) => h.paidAfter != null);
  const paidIn7 = history.filter((h) => h.paidAfter != null && h.paidAfter <= 7).length;
  const tones = ['Friendly', 'Direct', 'Firm'].map((t) => {
    const hs = history.filter((h) => h.tone === t);
    const ok = hs.filter((h) => h.paidAfter != null && h.paidAfter <= 7).length;
    return { tone: t, n: hs.length, ok, rate: hs.length ? ok / hs.length : 0 };
  });
  const byClient = {};
  paid.forEach((h) => { (byClient[h.client] = byClient[h.client] || []).push(h.paidAfter); });
  const clients = Object.entries(byClient)
    .map(([name, d]) => ({ name, avg: d.reduce((s, x) => s + x, 0) / d.length, n: d.length }))
    .sort((a, b) => b.avg - a.avg);
  return {
    sent: history.length,
    collected: paid.reduce((s, h) => s + h.amount, 0),
    rateNudged: paidIn7 / history.length,
    rateNot: notNudged.paidIn7 / notNudged.links,
    medianNudged: median(paid.map((h) => h.paidAfter)),
    medianNot: notNudged.medianDays,
    tones,
    clients,
  };
}
