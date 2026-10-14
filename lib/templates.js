// Fallback nudge writer. Used when no LLM key is set, or when the LLM call fails.
// It still adapts to tone, language, days late and how many nudges were sent before.

export function templateDraft(f) {
  const v = Math.abs(f.variant || 0);
  const pick = (arr) => arr[v % arr.length];
  const amt = '₹' + Math.round(f.amount).toLocaleString('en-IN');
  const range = f.linkCount > 1 ? `${f.linkCount} deliveries (${f.firstDate} to ${f.lastDate})` : `the delivery on ${f.firstDate}`;
  const partEn = f.partial ? ' You can also pay part of it now if that is easier.' : '';
  const partHi = f.partial ? ' Abhi thoda bhi pay kar sakte ho, agar easy ho.' : '';
  const again = f.nudgeCount > 0;

  if (f.lang === 'Hinglish') {
    if (f.tone === 'Firm')
      return `Hi ${f.contact}, ${f.clientName} ka ${amt} ab ${f.oldestDays} din se pending hai, ${range} ke liye. Please is week clear kar dijiye, taaki next deliveries time pe chalti rahein.${partHi}\nPay here: ${f.link}\n– ${f.merchantName}`;
    if (f.tone === 'Direct')
      return `Hi ${f.contact}, ${range} ka ${amt} pending hai (${f.oldestDays} din). ${again ? 'Pichle message ka follow-up hai. ' : ''}Ek link mein sab hai:${partHi}\n${f.link}\nThanks! – ${f.merchantName}`;
    return `Hi ${f.contact}! Hope sab badhiya hai 😊 ${again ? 'Bas ek gentle reminder: ' : 'Ek chhota sa note: '}${range} ka ${amt} pending hai. Yeh link se ek baar mein ho jayega:${partHi}\n${f.link}\nThank you! – ${f.merchantName}`;
  }

  if (f.lang === 'Hindi')
    return `नमस्ते ${f.contact} जी, ${f.clientName} का ${amt} (${f.linkCount} डिलीवरी) ${f.oldestDays} दिन से बाकी है। कृपया इस लिंक से भुगतान कर दें:\n${f.link}\nधन्यवाद – ${f.merchantName}`;

  if (f.tone === 'Firm')
    return `Hi ${f.contact}, ${amt} for ${range} is now ${f.oldestDays} days overdue${again ? `, and this is my ${ordinal(f.nudgeCount + 1)} reminder` : ''}. Please clear it by this Friday so I can keep your deliveries on schedule.${partEn}\nPay here: ${f.link}\n– ${f.merchantName}`;
  if (f.tone === 'Direct')
    return `Hi ${f.contact}, ${pick(['a quick follow-up', 'checking in', 'a short reminder'])}: ${amt} for ${range} is pending (${f.oldestDays} days). One link covers all of it:${partEn}\n${f.link}\nThanks, ${f.merchantName}`;
  const hello = pick(['hope the week is going well!', 'hope the café is buzzing this week!', 'hope all is good at your end!']);
  const lead = again ? pick(['Just a gentle follow-up on my last note: ', 'Circling back on my earlier message: ', 'A small reminder from my side: ']) : pick(['A quick note: ', 'Sharing a quick update on payments: ', 'Just a heads-up: ']);
  const close = pick(['Thank you!', 'Thanks so much!', 'Thanks, and see you on Thursday’s drop!']);
  return `Hi ${f.contact}, ${hello} ${lead}${amt} for ${range} is pending. You can pay it all in one go here:${partEn}\n${f.link}\n${close} ${f.merchantName}`;
}

function ordinal(n) {
  return n === 2 ? 'second' : n === 3 ? 'third' : n + 'th';
}
