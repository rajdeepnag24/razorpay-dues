import { templateDraft } from '../../../lib/templates';

export const runtime = 'nodejs';

// Drafts a WhatsApp nudge. Uses Claude when ANTHROPIC_API_KEY is set in Vercel;
// otherwise, or on any error, falls back to the template writer so the demo never breaks.
export async function POST(req) {
  const f = await req.json();
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ text: templateDraft(f), source: 'template' });

  const prompt = `You write short WhatsApp payment reminders for an Indian micro supplier (a home baker) to a business client (a café).
Facts (use exactly, do not invent anything):
- Sender: ${f.merchantName}
- Person to address: ${f.contact} (${f.contactRole}) at ${f.clientName}
- Amount due: ₹${Math.round(f.amount).toLocaleString('en-IN')} across ${f.linkCount} deliveries, from ${f.firstDate} to ${f.lastDate}
- Oldest unpaid delivery: ${f.oldestDays} days ago; this client usually pays in ${f.usualDaysToPay} days
- Reminders already sent: ${f.nudgeCount}
- Payment link (one link for everything): ${f.link}
- Part payment allowed: ${f.partial ? 'yes, mention it briefly' : 'no, do not mention it'}
Write in ${f.lang} with a ${f.tone.toLowerCase()} tone. Keep the relationship warm; this is a repeat client.
Rules: 45–70 words, plain text, at most one emoji (none if tone is Firm), put the link on its own line, sign off with the sender's name. Output only the message.`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!r.ok) throw new Error('LLM ' + r.status);
    const j = await r.json();
    const text = (j.content || []).map((c) => c.text || '').join('').trim();
    if (!text) throw new Error('empty');
    return Response.json({ text, source: 'ai' });
  } catch (e) {
    return Response.json({ text: templateDraft(f), source: 'template' });
  }
}
