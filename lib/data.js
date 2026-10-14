export const TODAY = '2026-10-12';

export const merchant = {
  name: 'Jahnvi',
  business: "Jahnvi's Bakehouse",
  city: 'Bengaluru',
};

export const clients = [
  {
    id: 'kaapi',
    name: 'Kaapi Corner',
    area: 'Indiranagar',
    contact: 'Rohan',
    contactRole: 'Accounts',
    orderedBy: 'Meera (owner)',
    nudges: [{ date: '2026-10-03', tone: 'Friendly', channel: 'WhatsApp' }],
    links: [
      { id: 'plink_KCa', date: '2026-08-28', amount: 2600, items: '45 brownies', paid: true, paidOn: '2026-09-09', paidVia: 'link' },
      { id: 'plink_KCb', date: '2026-09-04', amount: 1900, items: '30 cookies, 8 loaves', paid: true, paidOn: '2026-09-16', paidVia: 'cash' },
      { id: 'plink_KC1', date: '2026-09-18', amount: 2400, items: '40 brownies, 20 banana bread' },
      { id: 'plink_KC2', date: '2026-09-25', amount: 2100, items: '35 brownies, 12 tea cakes' },
      { id: 'plink_KC3', date: '2026-10-02', amount: 1700, items: '30 cookies, 10 tea cakes' },
    ],
    usualDaysToPay: 12,
  },
  {
    id: 'lane9',
    name: 'Lane 9 Café',
    area: 'HSR Layout',
    contact: 'Ankit',
    contactRole: 'Owner',
    orderedBy: 'Ankit (owner)',
    nudges: [],
    links: [
      { id: 'plink_L9a', date: '2026-09-12', amount: 2600, items: '45 brownies', paid: true, paidOn: '2026-09-21', paidVia: 'link' },
      { id: 'plink_L91', date: '2026-09-26', amount: 2800, items: '50 brownies' },
      { id: 'plink_L92', date: '2026-10-03', amount: 2300, items: '40 cookies, 8 loaves' },
    ],
    usualDaysToPay: 9,
  },
  {
    id: 'fern',
    name: 'Green Fern Café',
    area: 'Koramangala',
    contact: 'Priya',
    contactRole: 'Manager',
    orderedBy: 'Priya (manager)',
    nudges: [],
    links: [
      { id: 'plink_GF1', date: '2026-10-03', amount: 2500, items: '30 croissants, 20 cookies' },
      { id: 'plink_GF2', date: '2026-10-08', amount: 1800, items: '25 muffins' },
    ],
    usualDaysToPay: 7,
  },
  {
    id: 'studio12',
    name: 'Studio 12 Café',
    area: 'Jayanagar',
    contact: 'Sana',
    contactRole: 'Owner',
    orderedBy: 'Sana (owner)',
    nudges: [],
    links: [{ id: 'plink_S1', date: '2026-10-08', amount: 2800, items: '2 celebration cakes' }],
    usualDaysToPay: 5,
  },
  {
    id: 'bloom',
    name: 'Bloom Café',
    area: 'Whitefield',
    contact: 'Neha',
    contactRole: 'Owner',
    orderedBy: 'Neha (owner)',
    nudges: [{ date: '2026-09-24', tone: 'Friendly', channel: 'WhatsApp' }],
    links: [
      { id: 'plink_BCa', date: '2026-09-15', amount: 3200, items: '60 cookies, 10 loaves', paid: true, paidOn: '2026-09-26', paidVia: 'link' },
      { id: 'plink_BCb', date: '2026-09-29', amount: 2100, items: '35 brownies', paid: true, paidOn: '2026-10-06', paidVia: 'link' },
    ],
    usualDaysToPay: 6,
  },
];

export function daysSince(dateStr, today = TODAY) {
  const a = new Date(dateStr + 'T00:00:00');
  const b = new Date(today + 'T00:00:00');
  return Math.round((b - a) / 86400000);
}

export function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function fmtINR(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

export function fmtDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
