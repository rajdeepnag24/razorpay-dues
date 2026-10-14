'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { clients as seed, merchant, daysSince, addDays, fmtINR, fmtDate, TODAY } from '../lib/data';
import { computeInsights, nudgeHistory, overdueTrend } from '../lib/insights';
import './hero.css';

const I = {
  back: <path d="M15 18l-6-6 6-6" />,
  chev: <path d="M9 18l6-6-6-6" />,
  link: (<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>),
  page: (<><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>),
  grid: (<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>),
  home: (<><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></>),
  swap: (<><path d="M7 4v16M3 8l4-4 4 4" /><path d="M17 20V4M21 16l-4 4-4-4" /></>),
  wallet: (<><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M16 13h2" /><path d="M3 10h18" /></>),
  clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  spark: <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  msg: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>),
  refresh: (<><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></>),
  bell: (<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>),
  chart: (<><path d="M3 3v18h18" /><path d="M7 15l4-4 3 3 5-6" /></>),
  cash: (<><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /></>),
  search: (<><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>),
  dots: (<><circle cx="12" cy="5" r="1.6" fill="currentColor" /><circle cx="12" cy="12" r="1.6" fill="currentColor" /><circle cx="12" cy="19" r="1.6" fill="currentColor" /></>),
  cart: (<><path d="M3 4h2l2.4 11h11l2-8H6.2" /><circle cx="9" cy="19.5" r="1.3" /><circle cx="17" cy="19.5" r="1.3" /></>),
  help: (<><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7" /><path d="M12 17h.01" /></>),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  copy: (<><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h8" /></>),
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
  mail: (<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>),
  doc: (<><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></>),
  monitor: (<><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>),
  rupee: (<><path d="M7 5h10M7 9h10M7 5c5 0 5 8 0 8l7 6" /></>),
  brief: (<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" /></>),
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
};
function Icon({ name, size = 18, stroke = 2, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>{I[name]}</svg>
  );
}

const TONES = ['Friendly', 'Direct', 'Firm'];
const LANGS = ['English', 'Hinglish', 'Hindi'];
const TERMS = [0, 7, 15, 30];
const termLabel = (t) => (t === 0 ? 'On delivery' : `${t} days`);
const initials = (n) => n.split(' ').map((w) => w[0]).slice(0, 2).join('');
const cloneSeed = () => seed.map((c) => ({ ...c, links: c.links.map((l) => ({ ...l })), nudges: [...c.nudges] }));

function summarize(c) {
  const open = c.links.filter((l) => !l.paid);
  const amount = open.reduce((s, l) => s + l.amount, 0);
  const terms = c.terms || 0;
  const oldest = open.length ? Math.max(...open.map((l) => daysSince(l.date) - terms)) : 0;
  const lastNudge = c.nudges[c.nudges.length - 1];
  return { open, amount, oldest, lastNudge };
}
function lateColor(d) {
  if (d >= 20) return { bar: '#d9822b', chipBg: '#fdebd6', chipFg: '#9a4c06' };
  if (d >= 12) return { bar: '#e9a15a', chipBg: '#fdf0e1', chipFg: '#9a4c06' };
  return { bar: '#8fb3ea', chipBg: '#eaf1fd', chipFg: '#1d4fb8' };
}
function dayChip(d) { return d < 0 ? `due in ${-d} d` : d === 0 ? 'today' : `${d} d`; }
function lateText(d) { return d < 0 ? `due in ${-d} days` : d === 0 ? 'due today' : `${d} days late`; }
function nudgeLabel(n) {
  if (!n) return 'Not nudged yet';
  const d = daysSince(n.date);
  return d === 0 ? 'Nudged today' : `Nudged ${d} day${d > 1 ? 's' : ''} ago`;
}
function nextAuto(c) {
  const n = c.nudges.length;
  if (n >= 3) return null;
  const last = c.nudges[n - 1];
  const tomorrow = addDays(TODAY, 1);
  let date = last ? addDays(last.date, 7) : tomorrow;
  if (date < tomorrow) date = tomorrow;
  return { date, tone: TONES[n] };
}

export default function App() {
  const [data, setData] = useState(cloneSeed);
  const [stack, setStack] = useState(['home']);
  const [dir, setDir] = useState('fwd');
  const [clientId, setClientId] = useState(null);
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Days late');
  const [duesTab, setDuesTab] = useState('open');
  const [sheet, setSheet] = useState(null);
  const [toast, setToast] = useState(null);
  const [start, setStart] = useState(null);
  const [finish, setFinish] = useState(null);
  const [created, setCreated] = useState(null);
  const [fresh, setFresh] = useState(null);
  const [linkFor, setLinkFor] = useState(null);
  const [simPay, setSimPay] = useState(true);
  const [reward, setReward] = useState(null);
  const [extraHist, setExtraHist] = useState([]);
  const [waPreview, setWaPreview] = useState(true);
  const [lastText, setLastText] = useState('');
  useEffect(() => { if (/intro/.test(window.location.search)) setStack(['today']); }, []);
  const dataRef = useRef(data);
  dataRef.current = data;
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const screen = stack[stack.length - 1];
  const push = (s) => { setDir('fwd'); setStack((st) => [...st, s]); };
  const pop = () => { setDir('back'); setStack((st) => (st.length > 1 ? st.slice(0, -1) : st)); };
  const goTo = (arr) => { setDir('back'); setStack(arr); };

  const client = data.find((c) => c.id === clientId);
  const rows = useMemo(() => data.map((c) => ({ c, ...summarize(c) })).filter((r) => r.amount > 0).sort((a, b) => b.oldest - a.oldest), [data]);
  const done = useMemo(() => data.filter((c) => summarize(c).amount === 0 && c.links.some((l) => l.paid)).map((c) => {
    const paid = c.links.filter((l) => l.paid);
    return { c, collected: paid.reduce((s, l) => s + l.amount, 0), lastPaid: paid.map((l) => l.paidOn || TODAY).sort().pop() };
  }), [data]);
  const total = rows.reduce((s, r) => s + r.amount, 0);
  const history = useMemo(() => [...nudgeHistory, ...extraHist], [extraHist]);

  function showToast(t) { setToast(t); setTimeout(() => setToast(null), 2400); }
  function resetDemo() {
    timers.current.forEach(clearTimeout); timers.current = [];
    setData(cloneSeed()); setStack(['home']); setClientId(null); setStart(null); setFinish(null);
    setFilter('All'); setSortBy('Days late'); setDuesTab('open'); setCreated(null); setFresh(null); setReward(null); setExtraHist([]); setSheet(null);
  }
  function markPaid(linkId) {
    const c = data.find((x) => x.links.some((l) => l.id === linkId));
    const willClear = c && summarize(c).open.length === 1;
    setData((d) => d.map((x) => ({ ...x, links: x.links.map((l) => (l.id === linkId ? { ...l, paid: true, paidOn: TODAY, paidVia: 'cash' } : l)) })));
    setSheet(null);
    showToast(willClear ? `All paid. ${c.name} moved to Completed.` : 'Marked paid. Moved to History.');
  }
  function createLink(f) {
    const id = 'plink_' + Math.random().toString(36).slice(2, 8).toUpperCase();
    const link = { id, date: TODAY, amount: f.amount, items: f.items || 'Payment link' };
    let cid = null;
    let wasDone = false;
    if (f.tag) {
      if (f.clientId === 'new') {
        cid = 'new_' + Date.now();
        const nc = { id: cid, name: f.newName.trim(), area: 'New client', contact: f.newContact.trim(), contactRole: 'Contact', orderedBy: f.newContact.trim(), nudges: [], links: [link], usualDaysToPay: null, terms: 0 };
        setData((d) => [...d, nc]);
      } else {
        cid = f.clientId;
        const ex = data.find((c) => c.id === cid);
        wasDone = !!ex && summarize(ex).amount === 0;
        setData((d) => d.map((c) => (c.id === cid ? { ...c, links: [...c.links, link] } : c)));
      }
    }
    setFresh(cid ? { clientId: cid, linkId: id } : null);
    setCreated({ link, clientId: cid, wasDone, name: f.clientId === 'new' ? f.newName.trim() : data.find((c) => c.id === cid)?.name, url: 'https://rzp.io/rzp/' + id.slice(6).toLowerCase() });
    push('created');
  }
  function setTerms(id, t) { setData((d) => d.map((c) => (c.id === id ? { ...c, terms: t } : c))); }
  function setAuto(id, on) {
    const c = data.find((x) => x.id === id);
    setData((d) => d.map((x) => (x.id === id ? { ...x, auto: on } : x)));
    const nx = c && nextAuto(c);
    showToast(on ? (nx ? `Auto-nudge on · next ${fmtDate(nx.date)}, ${nx.tone}` : 'Auto-nudge on') : 'Auto-nudge off');
  }
  function simulatePayment(cid, tone) {
    const c = dataRef.current.find((x) => x.id === cid);
    if (!c) return;
    const open = c.links.filter((l) => !l.paid);
    if (!open.length) return;
    const amount = open.reduce((s, l) => s + l.amount, 0);
    setData((d) => d.map((x) => (x.id === cid ? { ...x, links: x.links.map((l) => (l.paid ? l : { ...l, paid: true, paidOn: TODAY, paidVia: 'link' })) } : x)));
    setExtraHist((h) => [...h, { client: c.name, tone, amount, paidAfter: 0 }]);
    setReward({ stage: 'banner', cid, name: c.name, contact: c.contact, amount, tone, usual: c.usualDaysToPay, links: open.length });
  }
  function recordNudge(tone) {
    const cid = clientId;
    setData((d) => d.map((c) => (c.id === cid ? { ...c, nudges: [...c.nudges, { date: TODAY, tone, channel: 'WhatsApp' }] } : c)));
    setFinish(Date.now());
    if (simPay) timers.current.push(setTimeout(() => simulatePayment(cid, tone), 6000));
  }
  const openClient = (id) => { setClientId(id); push('client'); };
  const k = computeInsights(history);

  return (
    <div className="stage">
      <aside className="guide" aria-label="Demo guide">
        <div className="kicker">RAZORPAY AI × PM BUILD CHALLENGE · TRACK 1</div>
        <h1>Dues</h1>
        <p className="lede">See who owes you, and nudge them on WhatsApp in under 2 minutes. A concept inside the Razorpay Payments app.</p>
        <ol>
          <li>Tap the <b>Dues</b> card on Home</li>
          <li>Open the most overdue café</li>
          <li>Check Open links; mark cash as paid</li>
          <li>Draft a nudge: pick tone and language</li>
          <li>Send it from your own WhatsApp</li>
          <li>Come back: the payment lands 🎉</li>
        </ol>
        <button className="ghost play" onClick={() => { setDir('fwd'); setStack(['today']); }}><Icon name="spark" size={15} /> Play “Today → Dues” intro</button>
        <label className="sim"><input type="checkbox" checked={simPay} onChange={(e) => setSimPay(e.target.checked)} /> Simulate the café paying 6 s after a nudge</label>
        <label className="sim"><input type="checkbox" checked={waPreview} onChange={(e) => setWaPreview(e.target.checked)} /> Show WhatsApp inside the demo (no new tab)</label>
        <p className="fine"><b>Also try:</b> Payment Link → tag a café → it shows in Dues. On a café: Auto-nudge, credit terms, Open / History. Fully paid cafés move to Completed.</p>
        <p className="fine">Demo data for Jahnvi, a home baker supplying cafés. Links are placeholders. Drafts use Claude when configured, otherwise a smart template.</p>
        <button className="ghost" onClick={resetDemo}><Icon name="refresh" size={15} /> Reset demo</button>
      </aside>

      <div className="phone">
        <div className={`screen ${dir}`} key={screen + stack.length}>
          {screen === 'today' && <Today rows={rows} total={total} onDone={() => { setStart(Date.now()); setFinish(null); setDuesTab('open'); setDir('fwd'); setStack(['home', 'dues']); }} />}
          {screen === 'wa' && client && <WA c={client} text={lastText} onBack={() => { setDir('fwd'); setStack((st) => [...st.slice(0, -1), 'sent']); }} />}
          {screen === 'home' && <Home total={total} count={rows.length} oldest={rows[0]?.oldest || 0} onDues={() => { setStart(Date.now()); setFinish(null); setDuesTab('open'); push('dues'); }}
            onLink={() => { setLinkFor(null); push('newlink'); }} onSettings={() => push('settings')} onSoon={() => showToast('Not part of this demo')} />}
          {screen === 'newlink' && <NewLink clients={data} initial={linkFor} onBack={pop} onCreate={createLink} />}
          {screen === 'created' && created && (
            <Created cr={created} total={data.find((c) => c.id === created.clientId) ? summarize(data.find((c) => c.id === created.clientId)).amount : 0}
              onCopy={() => showToast('Link copied')}
              onDues={() => { setStart(Date.now()); setFinish(null); setDuesTab('open'); setDir('fwd'); setStack(['home', 'dues']); }}
              onHome={() => goTo(['home'])} />
          )}
          {screen === 'settings' && <Settings onBack={pop} onDues={() => { setStart(Date.now()); setFinish(null); setDuesTab('open'); push('dues'); }} onSoon={() => showToast('Not part of this demo')} />}
          {screen === 'dues' && (
            <Dues rows={rows} done={done} total={total} tab={duesTab} setTab={setDuesTab} fresh={fresh?.clientId} filter={filter} setFilter={setFilter} sortBy={sortBy} setSortBy={setSortBy}
              onBack={pop} onOpen={openClient} onInsights={() => push('insights')} />
          )}
          {screen === 'insights' && <Insights k={k} total={total} onBack={pop} />}
          {screen === 'client' && client && (
            <Client c={client} s={summarize(client)} freshLink={fresh?.linkId}
              onTerms={(t) => { setTerms(client.id, t); showToast(`Credit terms set to ${termLabel(t).toLowerCase()}`); }}
              onAuto={(on) => setAuto(client.id, on)}
              onNewLink={() => { setLinkFor(client.id); push('newlink'); }}
              onBack={pop} onMark={(l) => setSheet(l)} onNudge={() => push('nudge')} />
          )}
          {screen === 'nudge' && client && (
            <Nudge c={client} s={summarize(client)} inApp={waPreview} onBack={pop} onSent={(tone, text) => { setLastText(text); recordNudge(tone); push(waPreview ? 'wa' : 'sent'); }} />
          )}
          {screen === 'sent' && client && (
            <Sent c={client} start={start} finish={finish} next={rows.find((r) => r.c.id !== clientId && !r.lastNudge)}
              onDone={() => goTo(['home', 'dues'])}
              onNext={(id) => { setClientId(id); setDir('fwd'); setStack(['home', 'dues', 'client']); }} />
          )}
        </div>

        {reward && reward.stage === 'banner' && (
          <button className="notif" onClick={() => setReward({ ...reward, stage: 'sheet' })}>
            <span className="notif-ic">₹</span>
            <span className="notif-txt"><b>{reward.name} paid {fmtINR(reward.amount)}</b><small>Right after your {reward.tone} nudge · tap to see</small></span>
          </button>
        )}
        {reward && reward.stage === 'sheet' && (
          <div className="scrim" onClick={() => setReward(null)}>
            <div className="sheet reward" role="dialog" aria-modal="true" aria-label="Payment received" onClick={(e) => e.stopPropagation()}>
              <div className="burst" aria-hidden="true">{Array.from({ length: 14 }).map((_, i) => <i key={i} />)}</div>
              <div className="grab" />
              <div className="rw-tick"><Icon name="check" size={30} stroke={2.8} /></div>
              <div className="rw-amt">{fmtINR(reward.amount)}</div>
              <h3>{reward.name} paid in full</h3>
              <p>{reward.contact} cleared {reward.links} link{reward.links > 1 ? 's' : ''} after your {reward.tone.toLowerCase()} nudge.
                {reward.usual ? <> They usually take <b>~{reward.usual} days</b>. This time: <b>same day</b>.</> : null}</p>
              <div className="rw-stats">
                <div><b>{fmtINR(k.collected)}</b><span>collected after nudges</span></div>
                <div><b>{Math.round(k.rateNudged * 100)}%</b><span>paid within 7 days of a nudge</span></div>
              </div>
              <div className="rw-moved"><Icon name="check" size={14} /> {reward.name} moved to Completed</div>
              <button className="cta" onClick={() => { setReward(null); setDir('fwd'); setStack(['home', 'dues', 'insights']); }}><Icon name="chart" size={17} /> See Insights</button>
              <button className="ghost wide" onClick={() => setReward(null)}>Done</button>
            </div>
          </div>
        )}

        {sheet && (
          <div className="scrim" onClick={() => setSheet(null)}>
            <div className="sheet" role="dialog" aria-modal="true" aria-label="Mark as paid" onClick={(e) => e.stopPropagation()}>
              <div className="grab" />
              <div className="sheet-ic"><Icon name="cash" size={22} /></div>
              <h3>Mark {fmtINR(sheet.amount)} as paid?</h3>
              <p>Use this when {client?.name} paid by cash or straight to your UPI. This delivery ({fmtDate(sheet.date)}) moves to History, and no nudge goes out for it.</p>
              <button className="cta" onClick={() => markPaid(sheet.id)}>Yes, mark as paid</button>
              <button className="ghost wide" onClick={() => setSheet(null)}>Cancel</button>
            </div>
          </div>
        )}
        {toast && <div className="toast" role="status"><Icon name="check" size={16} /> {toast}</div>}
      </div>
    </div>
  );
}


const PHONES = { kaapi: '+91 98861 4xxxx', lane9: '+91 99005 2xxxx', fern: '+91 97412 8xxxx', studio12: '+91 90083 1xxxx' };
const NOISE = [
  { key: 'n1', amount: 2100, items: '35 brownies', date: '2026-10-06', paid: true, phone: '+91 99860 7xxxx' },
  { key: 'n2', amount: 2600, items: '45 brownies', date: '2026-09-21', paid: true, phone: '+91 99005 2xxxx' },
];

function Today({ rows, total, onDone }) {
  const [phase, setPhase] = useState('flat');
  const [ready, setReady] = useState(false);
  const W = 358;
  const items = [
    ...rows.flatMap((r) => r.open.map((l) => ({ key: l.id, amount: l.amount, items: l.items, date: l.date, cid: r.c.id, phone: PHONES[r.c.id] || '+91 9xxxx xxxxx' }))),
    ...NOISE,
  ].sort((a, b) => b.date.localeCompare(a.date));
  const flatPos = {};
  items.forEach((it, i) => { flatPos[it.key] = { x: 0, y: i * 58, w: W, h: 52 }; });
  const groupPos = {};
  const cards = [];
  let y = 0;
  const chipW = (W - 24 - 12) / 3;
  rows.forEach((r) => {
    const links = [...r.open].sort((a, b) => a.date.localeCompare(b.date));
    const lines = Math.ceil(links.length / 3);
    const h = 54 + lines * 40 + 8;
    cards.push({ r, y, h });
    links.forEach((l, j) => { groupPos[l.id] = { x: 12 + (j % 3) * (chipW + 6), y: y + 54 + Math.floor(j / 3) * 40, w: chipW, h: 34 }; });
    y += h + 10;
  });
  const height = Math.max(items.length * 58, y);
  function go() { setPhase('group'); setTimeout(() => setReady(true), 1500); }
  const flat = phase === 'flat';
  return (
    <div className="scroll with-cta today">
      <div className="topbar">
        <div style={{ flex: 1, paddingLeft: 8 }}>
          <span className={flat ? 'era today' : 'era after'}>{flat ? 'TODAY' : 'WITH DUES'}</span>
          <div className="tb-title">{flat ? 'Payment Links' : 'Dues'}</div>
          <div className="tb-sub">{flat ? `${items.length} links · so who owes what?` : `${fmtINR(total)} unpaid · ${rows.length} cafés`}</div>
        </div>
      </div>
      <div className="pad">
        {flat ? (
          <div className="hero bad" key="bad">
            <div className="hero-k">THE PROBLEM</div>
            <div className="hero-h">So… who still owes you?</div>
            <div className="hero-pills">
              {['No client view', 'No days-late', 'Reminders off'].map((t, i) => (
                <span key={t} className="hpill" style={{ animationDelay: `${200 + i * 160}ms` }}><span className="hx">✕</span>{t}</span>
              ))}
            </div>
          </div>
        ) : (
          <div className="hero good" key="good">
            <span className="hero-spark" aria-hidden="true">{[...Array(8)].map((_, i) => <i key={i} />)}</span>
            <div className="hero-k">WELCOME TO DUES</div>
            <div className="hero-h">Here’s where Dues comes in 👋</div>
            <div className="hero-pills">
              {['Grouped by café', 'Days late at a glance', '1-tap WhatsApp nudge'].map((t, i) => (
                <span key={t} className="hpill" style={{ animationDelay: `${300 + i * 160}ms` }}><span className="hx">✓</span>{t}</span>
              ))}
            </div>
          </div>
        )}
        <div className="morph" style={{ height }}>
          {cards.map(({ r, y: cy, h }, i) => (
            <div key={r.c.id} className={flat ? 'mcard' : 'mcard on'} style={{ transform: `translateY(${cy}px)`, height: h, transitionDelay: flat ? '0ms' : `${250 + i * 90}ms` }}>
              <span className="ini sm">{initials(r.c.name)}</span>
              <span className="mc-name"><b>{r.c.name}</b><small>{r.open.length} link{r.open.length > 1 ? 's' : ''}</small></span>
              <span className="mc-right"><b className="mono">{fmtINR(r.amount)}</b><span className="dchip" style={{ background: lateColor(r.oldest).chipBg, color: lateColor(r.oldest).chipFg }}>{dayChip(r.oldest)}</span></span>
            </div>
          ))}
          {items.map((it, i) => {
            const pos = flat ? flatPos[it.key] : (groupPos[it.key] || { ...flatPos[it.key], gone: true });
            return (
              <div key={it.key} className={`mi ${flat ? 'flat' : 'chip'}${it.paid ? ' paid' : ''}`}
                style={{ transform: `translate(${pos.x}px, ${pos.y}px)${pos.gone ? ' scale(.9)' : ''}`, width: pos.w, height: pos.h, opacity: pos.gone ? 0 : 1, transitionDelay: flat ? '0ms' : `${i * 45}ms` }}>
                <div className="mi-flat">
                  <span><b className="mono">{fmtINR(it.amount)}</b><small>{it.items}</small></span>
                  <span className="mi-r"><span className={it.paid ? 'st paid' : 'st'}>{it.paid ? 'Paid' : 'Issued'}</span><small>{it.phone} · {fmtDate(it.date)}</small></span>
                </div>
                <div className="mi-chip"><b className="mono">{fmtINR(it.amount)}</b><small>{fmtDate(it.date)}</small></div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="cta-bar">
        {flat ? <button className="cta" onClick={go}><Icon name="spark" size={17} /> Turn on Dues</button>
          : <button className="cta" disabled={!ready} onClick={onDone}>Open Dues <Icon name="chev" size={17} /></button>}
      </div>
    </div>
  );
}

function WA({ c, text, onBack }) {
  const [read, setRead] = useState(false);
  useEffect(() => {
    const a = setTimeout(() => setRead(true), 1100);
    const b = setTimeout(onBack, 3400);
    return () => { clearTimeout(a); clearTimeout(b); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const linkMatch = text.match(/https?:\/\/\S+/);
  return (
    <div className="wa-screen">
      <div className="wa-top">
        <button className="wa-back" onClick={onBack} aria-label="Back to Razorpay"><Icon name="back" size={20} /></button>
        <span className="wa-av">{initials(c.contact + ' ' + c.name)}</span>
        <span className="wa-who"><b>{c.contact} · {c.name}</b><small>online</small></span>
      </div>
      <button className="wa-return" onClick={onBack}><Icon name="back" size={12} /> Razorpay</button>
      <div className="wa-body">
        <div className="wa-day">TODAY</div>
        <div className="wa-bubble">
          {linkMatch && (
            <div className="wa-card"><b>Pay {merchant.business}</b><small>rzp.io · Razorpay Payment Link</small></div>
          )}
          <div className="wa-text">{text}</div>
          <div className="wa-meta">11:04 am
            <svg width="16" height="11" viewBox="0 0 16 11" aria-hidden="true"><path d="M1 6l3 3L10 2M6 9l1 1 7-8" fill="none" stroke={read ? '#53bdeb' : '#8696a0'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
        </div>
      </div>
      <div className="wa-input"><span>Message</span><span className="wa-mic" /></div>
    </div>
  );
}

function Home({ total, count, oldest, onDues, onLink, onSettings, onSoon }) {
  return (
    <div className="scroll home">
      <header className="rz-hero">
        <div className="rz-top">
          <div className="rz-av">J</div>
          <div className="rz-id"><div className="rz-name">{merchant.business.toUpperCase()}</div><div className="rz-bal">Balance <small>₹</small><b>0</b><small>.00</small></div></div>
          <button className="rz-ic" aria-label="Search" onClick={onSoon}><Icon name="search" size={22} /></button>
          <button className="rz-ic" aria-label="Menu and settings" onClick={onSettings}><Icon name="dots" size={22} /></button>
        </div>
        <div className="rz-share-l">Share your Razorpay.me link to get paid instantly <b>Preview</b></div>
        <div className="rz-share"><span>razorpay.me/<b>@jahnvibakes</b></span><button onClick={onSoon}>Share</button></div>
      </header>

      <div className="rz-body">
        {count > 0 && (
          <button className="dues-tile" onClick={onDues}>
            <div className="dt-left">
              <span className="new">NEW</span>
              <div className="dt-title">Dues</div>
              <div className="dt-amt">{fmtINR(total)} <span>unpaid</span></div>
              <div className="dt-meta">{count} clients · oldest {oldest} days</div>
            </div>
            <div className="dt-cta">View <Icon name="chev" size={16} /></div>
          </button>
        )}

        <section className="rz-card">
          <div className="rz-label">ACCEPT PAYMENTS</div>
          <div className="rz-acc">
            <button onClick={onLink}><span className="rz-circ"><Icon name="link" size={22} /></span>Payment Link</button>
            <button onClick={onSoon}><span className="rz-circ"><Icon name="page" size={22} /></span>Payment Pages</button>
            <button onClick={onSoon}><span className="rz-circ dark"><Icon name="chev" size={22} /></span>View all products</button>
          </div>
        </section>

        <section className="rz-card">
          <div className="rz-label">RECENT TRANSACTIONS</div>
          <div className="txn"><span>Payment link · Bloom Café</span><b>{fmtINR(2100)}</b></div>
          <div className="txn"><span>Payment link · Lane 9 Café</span><b>{fmtINR(2600)}</b></div>
        </section>
      </div>

      <button className="rz-help" onClick={onSoon}><Icon name="help" size={18} /> Help</button>
      <nav className="tabbar" aria-label="Tabs">
        <span className="on"><Icon name="home" size={20} />Home</span>
        <button onClick={onSoon}><Icon name="swap" size={20} />Transactions</button>
        <button onClick={onSoon}><Icon name="grid" size={20} />Products</button>
        <button onClick={onSoon}><Icon name="cart" size={20} />Storefront</button>
      </nav>
    </div>
  );
}

function NewLink({ clients, initial, onBack, onCreate }) {
  const [amount, setAmount] = useState('');
  const [items, setItems] = useState('');
  const [tag, setTag] = useState(true);
  const [clientId, setClientId] = useState(initial || clients[0]?.id || 'new');
  const [newName, setNewName] = useState('');
  const [newContact, setNewContact] = useState('');
  const amt = Number(amount) || 0;
  const c = clients.find((x) => x.id === clientId);
  const owed = c ? summarize(c).amount : 0;
  const ok = amt > 0 && (!tag || clientId !== 'new' || (newName.trim() && newContact.trim()));
  return (
    <div className="scroll with-cta">
      <TopBar title="New payment link" sub="Share it on WhatsApp after you deliver" onBack={onBack} />
      <div className="pad">
        <label className="field"><span>Amount</span>
          <div className="amt-in"><b>₹</b><input inputMode="numeric" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} aria-label="Amount in rupees" /></div>
        </label>
        <label className="field"><span>Payment for</span>
          <input placeholder="e.g. 40 brownies, 12 Oct delivery" value={items} onChange={(e) => setItems(e.target.value)} />
        </label>

        <div className="dues-box">
          <label className="toggle">
            <input type="checkbox" checked={tag} onChange={(e) => setTag(e.target.checked)} />
            <span className="knob" aria-hidden="true" />
            <span><b>Track in Dues</b> <span className="new sm">NEW</span><br /><small className="muted">Group this link under a client so you can see who owes you</small></span>
          </label>
          {tag && (
            <>
              <div className="ctrl-label">Client</div>
              <div className="pick">
                {clients.map((x) => (
                  <button key={x.id} className={clientId === x.id ? 'chip on' : 'chip'} onClick={() => setClientId(x.id)}>{x.name}</button>
                ))}
                <button className={clientId === 'new' ? 'chip on' : 'chip'} onClick={() => setClientId('new')}><Icon name="plus" size={13} /> New client</button>
              </div>
              {clientId === 'new' ? (
                <div className="two">
                  <label className="field"><span>Client name</span><input placeholder="e.g. Brew Lab" value={newName} onChange={(e) => setNewName(e.target.value)} /></label>
                  <label className="field"><span>Who pays</span><input placeholder="e.g. Kiran" value={newContact} onChange={(e) => setNewContact(e.target.value)} /></label>
                </div>
              ) : c && (
                <div className="preview-due">
                  <span>{c.name} owes</span>
                  <b className="mono">{fmtINR(owed)} → {fmtINR(owed + amt)}</b>
                  <small>{owed === 0 ? 'Moves from Completed back to Open. ' : ''}Nudges go to {c.contact} ({c.contactRole})</small>
                </div>
              )}
            </>
          )}
        </div>
        <p className="hint">Today, Payment Links have no client field. This one field is all Dues needs.</p>
      </div>
      <div className="cta-bar">
        <button className="cta" disabled={!ok} onClick={() => onCreate({ amount: amt, items: items.trim(), tag, clientId, newName, newContact })}>
          Create link{amt ? ` for ${fmtINR(amt)}` : ''}
        </button>
      </div>
    </div>
  );
}

function Created({ cr, total, onCopy, onDues, onHome }) {
  const share = () => window.open('https://wa.me/?text=' + encodeURIComponent(`Hi! Payment link for ${cr.link.items} (${fmtINR(cr.link.amount)}): ${cr.url}`), '_blank', 'noopener');
  return (
    <div className="scroll sent">
      <div className="pad center">
        <div className="tick blue"><Icon name="link" size={36} stroke={2.4} /></div>
        <h2>Link created · {fmtINR(cr.link.amount)}</h2>
        <p className="muted">{cr.link.items}</p>
        <div className="url-box"><span className="mono">{cr.url.replace('https://', '')}</span><button className="text-btn" onClick={onCopy}><Icon name="copy" size={14} /> Copy</button></div>
      </div>
      <div className="pad">
        {cr.clientId ? (
          <div className="added">
            <span className="added-ic"><Icon name="wallet" size={18} /></span>
            <span><b>{cr.wasDone ? 'Back in Open Dues' : 'Added to Dues'}</b><br /><small>{cr.name} now owes <b>{fmtINR(total)}</b>. It leaves Dues on its own once paid.</small></span>
          </div>
        ) : (
          <div className="added off"><span><b>Not tracked in Dues</b><br /><small>No client was picked for this link.</small></span></div>
        )}
        <button className="cta wa" onClick={share}><Icon name="msg" size={17} /> Share on WhatsApp</button>
        {cr.clientId && <button className="ghost wide" onClick={onDues}>View in Dues <Icon name="chev" size={16} /></button>}
        <button className="ghost wide plain" onClick={onHome}>Back to Home</button>
      </div>
    </div>
  );
}

function Settings({ onBack, onDues, onSoon }) {
  const items = [
    ['doc', '#3b82f6', 'Bank accounts and settlements', 'Bank account, Settlement cycle'],
    ['monitor', '#16a34a', 'Website and app', 'Website/App details, API keys, Webhooks'],
    ['rupee', '#2563eb', 'Payments and refunds', 'Balances, Credits, Reminders, Fee bearer, Transaction limits'],
    ['wallet', '#0b1f44', 'Dues', 'Who owes you, and nudge them on WhatsApp', true],
    ['brief', '#8b5cf6', 'Business details and GST', 'Business details, GST, Customer support, Manage team'],
    ['bell', '#7c3aed', 'Notification', 'Email, SMS, WhatsApp'],
  ];
  return (
    <div className="scroll set">
      <div className="set-top"><b>Settings</b><button className="icon-btn" onClick={onBack} aria-label="Close"><Icon name="close" size={22} /></button></div>
      <div className="set-prof">
        <div className="rz-av lg">J</div>
        <div><div className="set-name">{merchant.business.toUpperCase()}</div><div className="muted">Owner</div></div>
      </div>
      <div className="set-contact">
        <div><Icon name="phone" size={16} /> +91 98450 00000</div>
        <div><Icon name="mail" size={16} /> jahnvi@example.com</div>
      </div>
      {items.map(([ic, col, t, sub, isNew]) => (
        <button key={t} className={isNew ? 'set-row hl' : 'set-row'} onClick={isNew ? onDues : onSoon}>
          <span className="set-ic" style={{ background: col }}><Icon name={ic} size={15} /></span>
          <span className="set-txt"><b>{t}{isNew && <span className="new sm">NEW</span>}</b><small>{sub}</small></span>
          <Icon name="chev" size={18} style={{ color: '#2b7de9' }} />
        </button>
      ))}
    </div>
  );
}

function TopBar({ title, sub, onBack, right }) {
  return (
    <div className="topbar">
      <button className="icon-btn" onClick={onBack} aria-label="Back"><Icon name="back" size={22} /></button>
      <div style={{ flex: 1, minWidth: 0 }}><div className="tb-title">{title}</div>{sub && <div className="tb-sub">{sub}</div>}</div>
      {right}
    </div>
  );
}

const SORTS = {
  'Days late': (a, b) => b.oldest - a.oldest,
  Amount: (a, b) => b.amount - a.amount,
  'Slow payers': (a, b) => (b.c.usualDaysToPay ?? 0) - (a.c.usualDaysToPay ?? 0),
  'A–Z': (a, b) => a.c.name.localeCompare(b.c.name),
};

function Dues({ rows, done, total, tab, setTab, fresh, filter, setFilter, sortBy, setSortBy, onBack, onOpen, onInsights }) {
  const shown = rows.filter((r) => filter === 'All' || (filter === '15+ days' ? r.oldest >= 15 : filter === 'Auto-nudge' ? r.c.auto : !r.lastNudge)).sort(SORTS[sortBy]);
  const max = Math.max(30, ...rows.map((r) => r.oldest));
  return (
    <div className="scroll">
      <TopBar title="Dues" sub="Who owes you, by client" onBack={onBack}
        right={<button className="pill-btn" onClick={onInsights}><Icon name="chart" size={16} /> Insights</button>} />
      <div className="pad">
        <div className="seg tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'open'} className={tab === 'open' ? 'on' : ''} onClick={() => setTab('open')}>Open · {rows.length}</button>
          <button role="tab" aria-selected={tab === 'done'} className={tab === 'done' ? 'on' : ''} onClick={() => setTab('done')}>Completed · {done.length}</button>
        </div>

        {tab === 'open' ? (
          <>
            <div className="summary">
              <div className="sum-l">Unpaid now</div>
              <div className="sum-amt">{fmtINR(total)}</div>
              <div className="stackbar" aria-hidden="true">
                {rows.map((r) => <i key={r.c.id} style={{ flex: r.amount, background: lateColor(r.oldest).bar }} />)}
              </div>
              <div className="sum-meta">{rows.length} clients · {rows.reduce((s, r) => s + r.open.length, 0)} open links · oldest {rows[0]?.oldest || 0} days</div>
            </div>

            <div className="chips" role="tablist">
              {['All', '15+ days', 'Not nudged', 'Auto-nudge'].map((f) => (
                <button key={f} role="tab" aria-selected={filter === f} className={filter === f ? 'chip on' : 'chip'} onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>

            <div className="sortbar">
              <span>Sort</span>
              {Object.keys(SORTS).map((k) => (
                <button key={k} className={sortBy === k ? 'sort on' : 'sort'} aria-pressed={sortBy === k} onClick={() => setSortBy(k)}>{k}</button>
              ))}
            </div>

            {shown.map((r) => {
              const col = lateColor(r.oldest);
              return (
                <button key={r.c.id} className={r.c.id === fresh ? 'row fresh' : 'row'} onClick={() => onOpen(r.c.id)}>
                  <span className="ini">{initials(r.c.name)}</span>
                  <span className="row-main">
                    <span className="row-top"><b>{r.c.name}</b><b className="mono">{fmtINR(r.amount)}</b></span>
                    <span className="row-mid">
                      <span className="bar"><i style={{ width: `${(Math.max(0, r.oldest) / max) * 100}%`, background: col.bar }} /></span>
                      <span className="dchip" style={{ background: col.chipBg, color: col.chipFg }}>{dayChip(r.oldest)}</span>
                    </span>
                    <span className="row-sub">
                      {r.open.length} link{r.open.length > 1 ? 's' : ''} · {nudgeLabel(r.lastNudge)}
                      {sortBy === 'Slow payers' ? (r.c.usualDaysToPay ? ` · pays in ~${r.c.usualDaysToPay} d` : ' · new client') : ''}
                      {r.c.id === fresh ? ' · just added' : ''}
                      {r.c.auto && <span className="auto-tag"><Icon name="bolt" size={10} /> Auto</span>}
                    </span>
                  </span>
                  <Icon name="chev" size={18} style={{ color: '#9aa3b2' }} />
                </button>
              );
            })}
            {shown.length === 0 && <div className="empty">Nothing here. Nice.</div>}
            <p className="hint">Links show up here when you pick a client while creating them. When every link for a client is paid, they move to Completed.</p>
          </>
        ) : (
          <>
            {done.map((d) => (
              <button key={d.c.id} className="row" onClick={() => onOpen(d.c.id)}>
                <span className="ini ok"><Icon name="check" size={18} stroke={2.6} /></span>
                <span className="row-main">
                  <span className="row-top"><b>{d.c.name}</b><b className="mono">{fmtINR(d.collected)}</b></span>
                  <span className="row-sub">All paid · last payment {fmtDate(d.lastPaid)}</span>
                </span>
                <Icon name="chev" size={18} style={{ color: '#9aa3b2' }} />
              </button>
            ))}
            {done.length === 0 && <div className="empty">No client is fully paid yet.</div>}
            <p className="hint">Create a new link for a completed client and they move back to Open.</p>
          </>
        )}
      </div>
    </div>
  );
}

function Client({ c, s, freshLink, onTerms, onAuto, onNewLink, onBack, onMark, onNudge }) {
  const [tab, setTab] = useState(s.open.length ? 'open' : 'history');
  const paid = c.links.filter((l) => l.paid).sort((a, b) => (b.paidOn || TODAY).localeCompare(a.paidOn || TODAY));
  const collected = paid.reduce((t, l) => t + l.amount, 0);
  const nx = nextAuto(c);
  const showCta = tab === 'open' && s.amount > 0;
  return (
    <div className={showCta ? 'scroll with-cta' : 'scroll'}>
      <TopBar title={c.name} sub={c.area} onBack={onBack}
        right={<button className="pill-btn" onClick={onNewLink}><Icon name="plus" size={15} /> New link</button>} />
      <div className="pad">
        <div className="due-card">
          {s.amount > 0 ? (
            <>
              <div className="sum-l">Total due</div>
              <div className="due-amt">{fmtINR(s.amount)}</div>
              <div className="due-meta">
                <span className="dchip" style={{ background: lateColor(s.oldest).chipBg, color: lateColor(s.oldest).chipFg }}>{lateText(s.oldest)}</span>
                <span>{c.usualDaysToPay ? `pays in ~${c.usualDaysToPay} d` : 'new client'}</span>
              </div>
            </>
          ) : (
            <>
              <div className="sum-l">All paid</div>
              <div className="due-amt">{fmtINR(collected)}</div>
              <div className="due-meta"><span className="dchip donechip">Completed</span><span>{paid.length} link{paid.length > 1 ? 's' : ''} paid</span></div>
            </>
          )}
        </div>

        <div className="seg tabs" role="tablist" style={{ marginTop: 12 }}>
          <button role="tab" aria-selected={tab === 'open'} className={tab === 'open' ? 'on' : ''} onClick={() => setTab('open')}>Open · {s.open.length}</button>
          <button role="tab" aria-selected={tab === 'history'} className={tab === 'history' ? 'on' : ''} onClick={() => setTab('history')}>History · {paid.length}</button>
        </div>

        {tab === 'open' ? (
          <>
            {s.open.length === 0 && (
              <div className="allpaid">
                <b>Nothing open 🎉</b>
                <small>New link for {c.name}? It moves them back to Open.</small>
                <button className="ghost" onClick={onNewLink}><Icon name="plus" size={15} /> New link</button>
              </div>
            )}
            {s.open.map((l) => (
              <div className={l.id === freshLink ? 'link-row fresh' : 'link-row'} key={l.id}>
                <div>
                  <b>{fmtDate(l.date)}</b> <span className="muted">· {dayChip(daysSince(l.date) - (c.terms || 0))}</span>{l.id === freshLink && <span className="new sm">NEW</span>}
                  <div className="muted small">{l.items}</div>
                </div>
                <div className="lr-right">
                  <b className="mono">{fmtINR(l.amount)}</b>
                  <button className="text-btn" onClick={() => onMark(l)}>Mark paid</button>
                </div>
              </div>
            ))}

            {s.amount > 0 && (
              <>
                <div className="auto-card">
                  <label className="toggle" style={{ margin: 0 }}>
                    <input type="checkbox" checked={!!c.auto} onChange={(e) => onAuto(e.target.checked)} />
                    <span className="knob" aria-hidden="true" />
                    <span><b><Icon name="bolt" size={13} /> Auto-nudge</b><br /><small className="muted">Up to 3 nudges, 7 days apart. Tone steps up. Stops the moment they pay.</small></span>
                  </label>
                  {c.auto && (
                    <div className="plan">
                      {TONES.map((t, i) => {
                        const sent = c.nudges[i];
                        const isNext = !sent && nx && i === c.nudges.length;
                        return (
                          <div key={t} className={sent ? 'step sent' : isNext ? 'step next' : 'step'}>
                            <span className="pip" /><b>{t}</b>
                            <span>{sent ? `sent ${fmtDate(sent.date)}` : isNext ? `next · ${fmtDate(nx.date)}` : 'if still unpaid'}</span>
                          </div>
                        );
                      })}
                      {!nx && <p className="ds-note">3 nudges sent. Auto-nudge pauses here. A call may work better now.</p>}
                      <p className="ds-note">Sent from Razorpay's WhatsApp as "{merchant.business} via Razorpay", with one link for the full amount. You get a copy of each nudge.</p>
                    </div>
                  )}
                </div>

                <div className="payer">
                  <span className="tile-ic"><Icon name="user" /></span>
                  <span><b>Nudge goes to {c.contact}</b><br /><small>{c.contactRole} · orders come from {c.orderedBy}</small></span>
                </div>

                <div className="terms-row">
                  <span><b>Credit terms</b><br /><small>Days late start after this</small></span>
                  <select value={c.terms || 0} onChange={(e) => onTerms(Number(e.target.value))} aria-label="Credit terms">
                    {TERMS.map((t) => <option key={t} value={t}>{termLabel(t)}</option>)}
                  </select>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {paid.length === 0 && <div className="muted small pad-y">No payments yet.</div>}
            {paid.length > 0 && <div className="hist-sum">{fmtINR(collected)} collected from {c.name}</div>}
            {paid.map((l) => (
              <div className="link-row paid-row" key={l.id}>
                <div>
                  <b>{fmtDate(l.date)}</b> <span className="muted">· delivered</span>
                  <div className="muted small">{l.items}</div>
                </div>
                <div className="lr-right">
                  <b className="mono">{fmtINR(l.amount)}</b>
                  <span className={l.paidVia === 'cash' ? 'via cash' : 'via'}>{l.paidVia === 'cash' ? 'Marked paid' : 'Paid via link'} · {fmtDate(l.paidOn || TODAY)}</span>
                </div>
              </div>
            ))}
            <div className="section-label">NUDGES SENT</div>
            {c.nudges.length === 0 && <div className="muted small pad-y">No nudges yet.</div>}
            {c.nudges.map((n, i) => (
              <div className="nudge-hist" key={i}><Icon name="msg" size={15} /> {n.tone} nudge on {n.channel} · {fmtDate(n.date)}</div>
            ))}
          </>
        )}
      </div>
      {showCta && (
        <div className="cta-bar">
          <button className="cta" onClick={onNudge}><Icon name="spark" size={17} /> Draft a nudge now</button>
        </div>
      )}
    </div>
  );
}

function Nudge({ c, s, inApp, onBack, onSent }) {
  const [tone, setTone] = useState(c.nudges.length ? c.nudges[c.nudges.length - 1].tone : 'Friendly');
  const [lang, setLang] = useState('English');
  const [partial, setPartial] = useState(false);
  const [text, setText] = useState('');
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const reqId = useRef(0);
  const variant = useRef(0);
  const link = `https://rzp.io/rzp/demo-${c.id}`;

  async function draft() {
    const id = ++reqId.current;
    setLoading(true);
    const dates = s.open.map((l) => l.date).sort();
    const body = {
      merchantName: merchant.name, contact: c.contact, contactRole: c.contactRole, clientName: c.name,
      amount: s.amount, linkCount: s.open.length, firstDate: fmtDate(dates[0]), lastDate: fmtDate(dates[dates.length - 1]),
      oldestDays: Math.max(0, s.oldest), usualDaysToPay: c.usualDaysToPay, nudgeCount: c.nudges.length, tone, lang, partial, link, variant: variant.current,
    };
    try {
      const r = await fetch('/api/draft', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json();
      if (id === reqId.current) { setText(j.text); setSource(j.source); }
    } catch {
      if (id === reqId.current) { setText(`Hi ${c.contact}, ${fmtINR(s.amount)} is pending. Pay here: ${link} – ${merchant.name}`); setSource('template'); }
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }
  useEffect(() => { draft(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [tone, lang, partial]);

  function send() {
    if (!inApp) window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
    onSent(tone, text);
  }

  return (
    <div className="scroll with-cta">
      <TopBar title={`Nudge ${c.contact}`} sub={c.name} onBack={onBack} />
      <div className="pad">
        <div className="combined">
          <span className="tile-ic"><Icon name="link" /></span>
          <span><b>One link for {fmtINR(s.amount)}</b><br /><small>covers {s.open.length} open deliveries · {lateText(s.oldest)}</small></span>
        </div>

        <div className="ctrl-label">Tone</div>
        <Seg options={TONES} value={tone} onChange={setTone} />
        <div className="ctrl-label">Language</div>
        <Seg options={LANGS} value={lang} onChange={setLang} />
        <label className="toggle">
          <input type="checkbox" checked={partial} onChange={(e) => setPartial(e.target.checked)} />
          <span className="knob" aria-hidden="true" />
          <span>Allow part payment</span>
        </label>

        <div className="draft">
          <div className="draft-head">
            <span className={source === 'ai' ? 'badge ai' : 'badge'}><Icon name="spark" size={12} /> {loading ? 'Drafting…' : source === 'ai' ? 'AI draft' : 'Smart draft'}</span>
            <button className="text-btn" onClick={() => { variant.current += 1; draft(); }} disabled={loading}><Icon name="refresh" size={13} /> Redo</button>
          </div>
          {loading ? (
            <div className="shimmer" aria-label="Drafting message"><i /><i /><i /><i style={{ width: '60%' }} /></div>
          ) : (
            <textarea aria-label="Message" value={text} onChange={(e) => setText(e.target.value)} rows={8} />
          )}
        </div>
        <p className="hint">You review every message. Nothing is sent until you tap Send in WhatsApp.</p>
      </div>
      <div className="cta-bar">
        <button className="cta wa" onClick={send} disabled={loading || !text.trim()}><Icon name="msg" size={17} /> Send on WhatsApp</button>
      </div>
    </div>
  );
}

function Seg({ options, value, onChange }) {
  return (
    <div className="seg" role="radiogroup">
      {options.map((o) => (
        <button key={o} role="radio" aria-checked={value === o} className={value === o ? 'on' : ''} onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  );
}

function Sent({ c, start, finish, next, onDone, onNext }) {
  const secs = start && finish ? Math.max(1, Math.round((finish - start) / 1000)) : null;
  const mm = secs != null ? `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}` : null;
  const [remind, setRemind] = useState(true);
  return (
    <div className="scroll sent">
      <div className="pad center">
        <div className="tick"><Icon name="check" size={40} stroke={2.6} /></div>
        <h2>Nudge sent to {c.contact}</h2>
        <p className="muted">{c.name} · status changes to “Nudged today”. You will see it here the moment they pay.</p>
        {mm && (
          <div className="timer">
            <Icon name="clock" size={16} /> Done in <b>{mm}</b>
            <span className={secs <= 120 ? 'ok' : 'warn'}>{secs <= 120 ? 'under 2 min' : 'over 2 min'}</span>
          </div>
        )}
        <label className="toggle left">
          <input type="checkbox" checked={remind} onChange={(e) => setRemind(e.target.checked)} />
          <span className="knob" aria-hidden="true" />
          <span>Remind <b>me</b> in 3 days if still unpaid</span>
        </label>
      </div>
      <div className="pad">
        {next && (
          <button className="row" onClick={() => onNext(next.c.id)}>
            <span className="ini">{initials(next.c.name)}</span>
            <span className="row-main">
              <span className="row-top"><b>Next: {next.c.name}</b><b className="mono">{fmtINR(next.amount)}</b></span>
              <span className="row-sub">{lateText(next.oldest)} · not nudged yet</span>
            </span>
            <Icon name="chev" size={18} style={{ color: '#9aa3b2' }} />
          </button>
        )}
        <button className="ghost wide" onClick={onDone}>Back to Dues</button>
      </div>
    </div>
  );
}

function Insights({ k, total, onBack }) {
  const trend = [...overdueTrend, total];
  const max = Math.max(...trend), min = Math.min(...trend);
  const pts = trend.map((v, i) => `${(i / (trend.length - 1)) * 100},${36 - ((v - min) / (max - min || 1)) * 30}`).join(' ');
  const pct = (x) => Math.round(x * 100) + '%';
  const best = [...k.tones].filter((t) => t.n >= 3).sort((a, b) => b.rate - a.rate)[0];
  return (
    <div className="scroll">
      <TopBar title="Insights" sub="How your nudges are working · last 60 days" onBack={onBack} />
      <div className="pad">
        <div className="demo-pill">Demo data</div>
        <div className="kpis">
          <div className="kpi-tile dark"><span>Paid within 7 days of a nudge</span><b>{pct(k.rateNudged)}</b><small>vs {pct(k.rateNot)} when not nudged</small></div>
          <div className="kpi-tile"><span>Typical days to pay</span><b>{k.medianNudged} d</b><small>vs {k.medianNot} d without a nudge</small></div>
          <div className="kpi-tile"><span>Collected after nudges</span><b>{fmtINR(k.collected)}</b><small>from {k.sent} nudges sent</small></div>
          <div className="kpi-tile"><span>Unpaid now</span><b>{fmtINR(total)}</b><small>{trend[0] > total ? 'down' : 'up'} {fmtINR(Math.abs(trend[0] - total))} in 8 weeks</small></div>
        </div>

        <div className="card-i">
          <div className="ci-h">Paid within 7 days</div>
          <div className="cmp"><span>Nudged</span><span className="cmp-tr"><i style={{ width: pct(k.rateNudged), background: 'var(--wa)' }} /></span><b>{pct(k.rateNudged)}</b></div>
          <div className="cmp"><span>Not nudged</span><span className="cmp-tr"><i style={{ width: pct(k.rateNot), background: '#b9c4d6' }} /></span><b>{pct(k.rateNot)}</b></div>
        </div>

        <div className="card-i">
          <div className="ci-h">Which tone works <small>paid in 7 days</small></div>
          {k.tones.map((t) => (
            <div className="cmp" key={t.tone}><span>{t.tone}</span><span className="cmp-tr"><i style={{ width: pct(t.rate), background: 'var(--blue)' }} /></span><b>{t.ok}/{t.n}</b></div>
          ))}
          {best && <p className="tip">Tip: {best.tone} works best for you so far. Save Firm for the third nudge.</p>}
        </div>

        <div className="card-i">
          <div className="ci-h">Unpaid, last 8 weeks</div>
          <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="spark" aria-label="Unpaid trend over 8 weeks">
            <polyline points={pts} fill="none" stroke="var(--navy)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="spark-x"><span>{fmtINR(trend[0])}</span><span>now {fmtINR(total)}</span></div>
        </div>

        <div className="card-i">
          <div className="ci-h">Slowest payers <small>avg days to pay after a nudge</small></div>
          {k.clients.map((c) => (
            <div className="cmp" key={c.name}><span>{c.name}</span><span className="cmp-tr"><i style={{ width: `${Math.min(100, (c.avg / 12) * 100)}%`, background: c.avg > 6 ? 'var(--orange)' : '#8fb3ea' }} /></span><b>{c.avg.toFixed(1)} d</b></div>
          ))}
        </div>
      </div>
    </div>
  );
}
