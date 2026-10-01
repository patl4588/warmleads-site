(() => {
  'use strict';
  const config = window.WARMLIST_CONFIG || {};
  const portal = String(config.PORTAL_URL || '').replace(/\/+$/, '');
  const $ = id => document.getElementById(id);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-start]').forEach(a => a.href = portal + '/start');

  /* ---------- navigation ---------- */
  const menu = document.querySelector('.menu-button'), nav = $('main-nav');
  const setMenu = open => { menu?.setAttribute('aria-expanded', String(open)); if (menu?.lastChild) menu.lastChild.textContent = open ? 'Close' : 'Menu'; nav?.classList.toggle('open', open); document.body.classList.toggle('menu-open', open); };
  menu?.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && nav?.classList.contains('open')) { setMenu(false); menu.focus(); } });
  const headerEl = document.querySelector('.site-header');
  const heroEl = document.querySelector('.hero');
  const launcherEl = document.querySelector('.chat-launcher');
  const INTERACTIVE = 'a,button:not(.chat-launcher),input,select,textarea,summary,label,[tabindex]';
  function launcherClear() {
    /* hide the Ask Warmlist pill while it would cover a button, link or form field */
    if (!launcherEl || document.body.classList.contains('menu-open')) return;
    const r = launcherEl.getBoundingClientRect(); if (!r.width) return;
    const pts = []; for (let x = r.left + 2; x < r.right; x += 12) for (const y of [r.top - 6, r.top + 2, r.top + r.height / 2, r.bottom - 2]) pts.push([x, y]);
    const covered = pts.some(([x, y]) => document.elementsFromPoint(x, y).some(n => n !== launcherEl && !launcherEl.contains(n) && (n.matches?.(INTERACTIVE) || n.matches?.('footer')) && !n.closest('dialog')));
    document.body.classList.toggle('chat-covering', covered);
  }
  let raf = 0;
  const onScroll = () => { headerEl?.classList.toggle('scrolled', scrollY > 8); document.body.classList.toggle('chat-ready', !heroEl || heroEl.getBoundingClientRect().bottom < innerHeight * .35); cancelAnimationFrame(raf); raf = requestAnimationFrame(launcherClear); };
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();
  document.addEventListener('toggle', onScroll, true); document.addEventListener('click', () => setTimeout(onScroll, 50));

  /* ---------- portal / preview note ---------- */
  const localHost = ['127.0.0.1', 'localhost', '[::1]', ''].includes(location.hostname);
  let usablePortal = false;
  try { const url = new URL(portal); usablePortal = (url.protocol === 'https:' || (localHost && url.protocol === 'http:')) && (localHost || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)); } catch {}
  if (config.PORTAL_MODE === 'mock' || !usablePortal) {
    const note = document.createElement('div'); note.className = 'configuration-note';
    note.textContent = usablePortal ? 'Design preview. “Start for $0” opens a test portal: no real sign-ins, charges or campaigns.' : 'Preview. The production signup is not connected yet.';
    headerEl?.after(note);
  }
  function showInfo(title, body) {
    const modal = document.createElement('dialog'); modal.className = 'thread-dialog';
    const h = document.createElement('h2'); h.textContent = title;
    const p = document.createElement('p'); p.textContent = body;
    const close = document.createElement('button'); close.type = 'button'; close.className = 'button primary'; close.textContent = 'Close';
    modal.append(h, p, close); document.body.append(modal);
    close.addEventListener('click', () => modal.close()); modal.addEventListener('close', () => modal.remove()); modal.showModal();
  }
  if (!usablePortal) document.querySelectorAll('[data-start]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); showInfo('Signup isn’t connected yet', 'This preview needs the production portal address before it can create accounts. No account has been created.'); }));

  /* ---------- hero lead card ---------- */
  const leadToggle = $('lead-toggle'), thread = $('lead-thread');
  leadToggle?.addEventListener('click', () => {
    const open = leadToggle.getAttribute('aria-expanded') !== 'true';
    leadToggle.setAttribute('aria-expanded', String(open)); thread.hidden = !open;
    leadToggle.textContent = open ? 'Hide the conversation' : 'Read the conversation';
    $('hero-lead')?.classList.toggle('thread-open', open);
  });

  /* ---------- three sources ---------- */
  /* label, title, avatar, from, to, message, note */
  const listDetails = [
    ['Step 1 · Your customers', 'Your best customers show us where the money is.', 'SA', 'Your Super Agent', 'Update for you', 'Your best-paying customers are HOA communities and golf courses. I’m now looking for more businesses like them around Boca Raton.', 'We don’t start with a bought list. We start with the customers who already pay you best.'],
    ['Step 2 · Decision-makers', 'The person who actually says yes.', 'SA', 'Your Super Agent', 'Update for you', 'Found the decision-maker at Harbor Pines: Dana, the community manager, with a published business email. No guessed addresses.', 'Community managers, facilities directors, owners: whoever really hires for the work.'],
    ['Step 3 · Old quotes', 'You sent the estimate. We bring it back.', 'A', 'Alex at your company', 'To: someone you quoted last spring', 'Hi Jamie, checking back on the tree-work quote we put together for you. If it’s still on your list, we can hold last season’s price and get you on the schedule. Want me to pencil in a date?', 'The right offer and one clear next step. A reply or a stop request ends the sequence.'],
    ['Step 4 · Past customers', 'A friendly reminder that you’re there.', 'A', 'Alex at your company', 'To: a past customer', 'Hi Pat, it’s been a while since we worked on your property. Storm season is coming. Want us to take a look at the trees before it does? And if a neighbor needs help, we’d be glad to meet them.', 'Seasonal check-ins and referral asks, in your voice. You approve them first.'],
    ['Step 5 · Follow-up', 'Followed up until they answer.', 'A', 'Alex at your company', 'To: Dana · Community manager · follow-up', 'Hi Dana, just checking whether tree work is on your list this season. If someone else handles the grounds, could you point me in the right direction?', 'Dana replied: “Could you visit next week and quote the grounds?” That reply went straight to your office.']
  ];
  document.querySelectorAll('[data-list]').forEach(button => button.addEventListener('click', () => {
    const v = listDetails[Number(button.dataset.list)]; if (!v) return;
    document.querySelectorAll('[data-list]').forEach(b => { const on = b === button; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); });
    ['list-label', 'list-title', 'list-avatar', 'list-from', 'list-to', 'list-message', 'list-description'].forEach((id, i) => { const n = $(id); if (n) n.textContent = v[i]; });
    $('list-avatar')?.classList.toggle('sa', v[2] === 'SA');
  }));

  /* ---------- industries band ---------- */
  const groups = [...document.querySelectorAll('[data-ind-group]')];
  groups.forEach(g => g.addEventListener('click', () => {
    const open = g.getAttribute('aria-expanded') !== 'true';
    groups.forEach(o => { const on = o === g && open; o.setAttribute('aria-expanded', String(on)); o.classList.toggle('active', on); $(o.getAttribute('aria-controls')).hidden = !on; });
  }));

  const data = window.WARMLIST_DATA || { industries: [] };

  /* ---------- sample emails ---------- */
  let industry = 0, day = 0;
  function renderSample() { const body = $('sample-body'); if (!body) return; const i = data.industries[industry]; if (!i) return; $('sample-to').textContent = 'To: ' + i.to; $('sample-subject').textContent = (day ? 'Re: ' : '') + i.subject; body.textContent = i[['intro', 'nudge', 'proof', 'last'][day]]; }
  renderSample();
  document.querySelectorAll('[data-industry]').forEach(button => button.addEventListener('click', () => { industry = Number(button.dataset.industry); document.querySelectorAll('[data-industry]').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); }); renderSample(); }));
  document.querySelectorAll('[data-day]').forEach(button => button.addEventListener('click', () => { day = Number(button.dataset.day); document.querySelectorAll('[data-day]').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); }); renderSample(); }));

  /* ---------- starting-kit checklist ---------- */
  const checklist = [...document.querySelectorAll('[data-checklist]')]; let saved = [];
  try { saved = JSON.parse(localStorage.getItem('warmlist-a-checklist') || '[]'); if (!Array.isArray(saved)) saved = []; } catch {}
  function updateChecklist() { const active = checklist.filter(c => c.checked).map(c => c.dataset.checklist); if ($('checklist-count')) $('checklist-count').textContent = `${active.length} of ${checklist.length} ready`; try { localStorage.setItem('warmlist-a-checklist', JSON.stringify(active)); } catch {} }
  checklist.forEach(c => { c.checked = saved.includes(c.dataset.checklist); c.addEventListener('change', updateChecklist); }); if (checklist.length) updateChecklist();
  $('checklist-reset')?.addEventListener('click', () => { checklist.forEach(c => c.checked = false); updateChecklist(); });

  /* ---------- owner view ---------- */
  const pause = $('dashboard-pause'); let campaignPaused = false;
  pause?.addEventListener('click', () => { campaignPaused = !campaignPaused; pause.setAttribute('aria-pressed', String(campaignPaused)); pause.textContent = campaignPaused ? 'Resume sending' : 'Pause sending'; $('dashboard-state').textContent = campaignPaused ? 'Sending paused in this example. No real campaign was changed.' : 'Sending is on. This preview does not change a real campaign.'; pause.closest('.dash')?.classList.toggle('paused', campaignPaused); });
  const replies = [['Ready for your office', 'A quote request, not an inbox to sort.', '“Could you visit next week and quote the grounds?”', 'Dana wants a quote. The whole conversation is attached, so you can reply and set the visit.'], ['Interested, not booked yet', 'They asked for more information.', '“Send us your service details. We’re reviewing vendors.”', 'Casey asked for details. Your office decides the next step. An interested reply is not a booked appointment.']];
  document.querySelectorAll('[data-reply]').forEach(button => button.addEventListener('click', () => { const v = replies[Number(button.dataset.reply)]; document.querySelectorAll('[data-reply]').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); }); ['reply-status', 'reply-title', 'reply-quote', 'reply-action'].forEach((id, i) => $(id).textContent = v[i]); }));
  $('invoice-example')?.addEventListener('click', () => { const [t, b] = data.invoiceDialog || []; if (t) showInfo(t, b); });

  /* ---------- consultation form ---------- */
  async function post(path, payload, ms) { if (!usablePortal) throw new Error('Portal not configured'); const ctrl = new AbortController(); const timer = setTimeout(() => ctrl.abort(), ms); try { const response = await fetch(portal + path, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload), signal: ctrl.signal }); if (!response.ok) throw new Error(`Service returned ${response.status}`); return response; } finally { clearTimeout(timer); } }
  const form = $('consultation-form');
  const fieldNames = { name: 'your name', business: 'your business', email: 'a valid email', industry: 'your industry', locations: 'the number of locations', phone: 'a full phone number' };
  function formError(status, fields, msg) {
    form.querySelectorAll('[aria-invalid]').forEach(f => f.removeAttribute('aria-invalid'));
    fields.forEach(f => { f.setAttribute('aria-invalid', 'true'); f.setAttribute('aria-describedby', 'consult-status'); });
    status.className = 'error'; status.setAttribute('role', 'alert'); status.textContent = msg;
    (fields[0] || status).focus();
  }
  form?.addEventListener('input', e => { if (e.target.getAttribute('aria-invalid') && e.target.checkValidity()) e.target.removeAttribute('aria-invalid'); });
  form?.addEventListener('submit', async e => {
    e.preventDefault(); const status = $('consult-status'); const button = form.querySelector('button[type="submit"]');
    const fields = Object.fromEntries(new FormData(form));
    const bad = [...form.elements].filter(f => f.name && f.name !== 'website' && (!f.checkValidity() || (['name', 'business'].includes(f.name) && String(f.value).trim().length < 2) || (f.name === 'phone' && f.value && String(f.value).replace(/\D/g, '').length < 10)));
    if (bad.length) { formError(status, bad, 'Please add ' + [...new Set(bad.map(f => fieldNames[f.name] || f.name))].join(', ') + '.'); return; }
    if (String(fields.website || '').trim()) { status.className = 'error'; status.textContent = 'Unable to submit this request. Please leave the hidden website field empty.'; return; }
    fields.locations = Number(fields.locations); fields.source = 'warmlist-site-a'; fields.page = location.pathname;
    form.querySelectorAll('[aria-invalid]').forEach(f => f.removeAttribute('aria-invalid'));
    status.className = ''; status.setAttribute('role', 'status'); status.textContent = 'Sending your request…'; button.disabled = true; form.setAttribute('aria-busy', 'true');
    let ok = false;
    try { await post('/api/consultation', fields, 15000); ok = true; status.className = 'ok'; status.textContent = config.PORTAL_MODE === 'mock' ? 'Thank you. The preview portal received your test request. This is not a real booking.' : 'Thank you. Your request was received and we’ll be in touch.'; form.reset(); }
    catch { status.className = 'error'; status.setAttribute('role', 'alert'); status.textContent = 'We couldn’t confirm your request. Your details are still here, so please try again shortly.'; }
    finally { button.disabled = false; form.removeAttribute('aria-busy'); status.focus(); form.classList.toggle('sent', ok); }
  });

  /* ---------- chat ---------- */
  const dialog = $('chat-panel'), launcher = document.querySelector('.chat-launcher');
  launcher?.addEventListener('click', () => { dialog.showModal(); launcher.setAttribute('aria-expanded', 'true'); $('chat-input').focus(); });
  $('chat-close')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('close', () => { launcher.setAttribute('aria-expanded', 'false'); launcher.focus(); });
  const messages = $('chat-messages'), chatForm = $('chat-form'); let chatBusy = false;
  let conversation = ''; try { conversation = sessionStorage.getItem('warmlist-a-chat') || ''; } catch {}
  if (!conversation) { const bytes = new Uint8Array(12); crypto.getRandomValues(bytes); conversation = 'c_' + [...bytes].map(x => x.toString(16).padStart(2, '0')).join(''); try { sessionStorage.setItem('warmlist-a-chat', conversation); } catch {} }
  function message(role, text) { const p = document.createElement('p'); p.className = 'chat-message ' + role; p.textContent = text; messages.append(p); messages.scrollTop = messages.scrollHeight; return p; }
  function consultLink() { const a = document.createElement('a'); a.href = 'index.html#consult'; a.textContent = 'Book a free consultation'; a.className = 'text-link'; a.addEventListener('click', () => dialog.close()); messages.append(a); }
  async function ask(text) {
    text = String(text).trim(); if (!text || chatBusy) return; chatBusy = true; message('user', text); $('chat-input').value = '';
    const send = chatForm.querySelector('button'); send.disabled = true; send.textContent = 'Sending…'; const pending = message('bot', 'Checking…');
    try {
      const response = await post('/api/chat', { conversation_id: conversation, message: text }, 30000); const result = await response.json(); pending.remove();
      if (typeof result.reply !== 'string' || !result.reply.trim()) { message('bot', 'I don’t have a confirmed answer. A consultation is the right next step.'); consultLink(); }
      else { message('bot', result.reply); if (result.suggest_consult === true) consultLink(); if (Array.isArray(result.suggestions)) { const target = document.querySelector('.chat-suggestions'); target.replaceChildren(); result.suggestions.filter(s => typeof s === 'string').slice(0, 4).forEach(s => { const b = document.createElement('button'); b.type = 'button'; b.textContent = s.slice(0, 150); b.addEventListener('click', () => ask(s)); target.append(b); }); } }
    } catch { pending.remove(); message('bot', 'I can’t reach the assistant right now. You can read the pricing and sample emails, or book a free consultation.'); consultLink(); }
    finally { chatBusy = false; send.disabled = false; send.textContent = 'Send'; messages.scrollTop = messages.scrollHeight; $('chat-input').focus(); }
  }
  chatForm?.addEventListener('submit', e => { e.preventDefault(); ask($('chat-input').value); });
  document.querySelectorAll('[data-question]').forEach(b => b.addEventListener('click', () => ask(b.dataset.question)));
})();

/* ---------- Super Agent workbench: the example plays by itself when the section is on screen, one business at a time,
   with Pause/Replay. It pauses off-screen and in hidden tabs. Reduced motion shows the finished story. Fictional data. ---------- */
(() => {
  'use strict';
  const root = document.getElementById('agents');
  const D = (window.WARMLIST_DATA || {}).bench;
  if (!root || !D) return;
  const $ = id => document.getElementById(id);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const NS = 'http://www.w3.org/2000/svg';
  const sv = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
  const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = seed => { let a = seed >>> 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };

  const trades = [...root.querySelectorAll('[data-trade]')], strip = root.querySelector('.trade-strip'), area = $('bench-area');
  const cards = [...root.querySelectorAll('[data-card]')];
  const cardBtn = k => cards.find(c => Number(c.dataset.card) === k);
  const playBtn = $('bench-play'), replayBtn = $('bench-replay');
  const list = $('act-list'), empty = $('act-empty'), leadBox = $('act-lead'), map = $('bench-map');
  let ind = 0, ter = 0, step = 1, selected = 0, timer = 0, playing = false, userPaused = false, inView = false;
  const STEP_MS = 1900, LOOP_PAUSE_MS = 4000, LAST = 6;

  /* The story, in the order it really happens. card = which agent does it (-1 = Super Agent). */
  function story() {
    const I = D.industries[ind], T = D.territories[ter], town = T.towns[0][0], place = `${T.name}`, pre = T.prep || 'in';
    return [
      { card: -1, sa: `Finding ${I.work} leads ${pre} ${place}`, status: `Finding ${I.work} leads ${pre} ${place}`, row: `Studied your best customers: ${I.looking}. Now looking for more like them ${pre} ${place}.` },
      { card: 0, sa: `Scouts found ${I.org}`, status: 'Found a business that fits', row: `Found a business that fits: ${I.org}, ${town}.` },
      { card: 1, sa: `Prospect Agent found the ${I.role.toLowerCase()}`, status: `${I.role} found`, row: `${I.role} found: ${I.first}, with a published business email.` },
      { card: 4, sa: 'Bounce Guard checked the addresses', status: 'Removed a bad address — example', row: `Checked ${I.first}’s address. Separately, removed a bad address at ${I.bad} so it’s never emailed.` },
      { card: 3, sa: 'Follow-up Agent sent a follow-up', status: 'Follow-up sent — example', row: `Sent your approved email from your inbox. No reply yet, so a polite follow-up went out.` },
      { card: 2, sa: `Qualify Agent confirmed ${I.first} is interested`, status: 'Matches your services; asked to talk', row: `${I.first} replied: “${I.reply}” Matches your services and area, and asked to talk.` },
      { card: 5, sa: 'New lead sent to your office', status: 'New qualified lead — example', row: `New lead → your office. ${I.org} sent with the full conversation.` }
    ];
  }

  /* ---------- map ---------- */
  function drawMap() {
    const T = D.territories[ter], I = D.industries[ind], R = rng(hash(T.id + I.id)), W = 440, H = 240;
    map.replaceChildren();
    for (let i = 0; i < 3; i++) { const y = 34 + i * 76 + R() * 20; map.append(sv('path', { class: 'road', d: `M0 ${y.toFixed(1)} L${W} ${(y + R() * 24 - 12).toFixed(1)}` })); }
    for (let i = 0; i < 4; i++) { const x = 50 + i * 105 + R() * 26; map.append(sv('path', { class: 'road', d: `M${x.toFixed(1)} 0 L${(x + R() * 22 - 11).toFixed(1)} ${H}` })); }
    const edge = T.coast, pts = [];
    if (edge === 'east' || edge === 'west') { for (let y = -10; y <= H + 10; y += 30) pts.push([(edge === 'east' ? 372 : 58) + (R() * 16 - 8), y]); }
    else { for (let x = -10; x <= W + 10; x += 34) pts.push([x, 206 + (R() * 10 - 5)]); }
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; d += ` Q${x0.toFixed(1)} ${y0.toFixed(1)} ${((x0 + x1) / 2).toFixed(1)} ${((y0 + y1) / 2).toFixed(1)}`; }
    const lp = pts[pts.length - 1]; d += ` L${lp[0].toFixed(1)} ${lp[1].toFixed(1)}`;
    const close = { east: ` L${W + 10} ${H + 10} L${W + 10} -10 Z`, west: ` L-10 ${H + 10} L-10 -10 Z`, south: ` L${W + 10} ${H + 10} L-10 ${H + 10} Z` }[edge];
    map.append(sv('path', { class: 'water', d: d + close }), sv('path', { class: 'shore', d }));
    T.towns.forEach(([name, x, y]) => { const t = sv('text', { class: 'town', x, y: y < 30 ? y + 24 : y - 12, 'text-anchor': x > 370 ? 'end' : x < 70 ? 'start' : 'middle' }); t.textContent = name; map.append(t); });
    const pins = sv('g', { class: 'pins' });
    T.towns.slice(1, 5).forEach(([, x, y], i) => { const g = sv('g', { class: 'pin match' + (i === 2 ? ' bad-pin' : ''), transform: `translate(${x} ${y})`, style: `--i:${i}` }); g.append(sv('circle', { r: 5 })); if (i === 2) g.append(sv('path', { class: 'x', d: 'M-4 -4 L4 4 M4 -4 L-4 4' })); pins.append(g); });
    const [, lx, ly] = T.towns[0]; const lead = sv('g', { class: 'pin lead-pin', id: 'lead-pin', transform: `translate(${lx} ${ly})` });
    lead.append(sv('circle', { class: 'ring', r: 13 }), sv('circle', { class: 'core', r: 6.5 })); pins.append(lead); map.append(pins);
    $('map-name').textContent = `${T.name}, ${T.state}`;
    map.setAttribute('aria-label', `Illustrative map of ${T.name}, ${T.state} with example businesses. Not real locations.`);
  }

  /* ---------- render ---------- */
  function renderDetail(k) {
    const s = story();
    if (k < 0) {
      $('bd-kicker').textContent = 'Selected: the manager'; $('bd-name').textContent = 'Super Agent';
      $('bd-desc').textContent = 'You deal with one agent. It gives the others their jobs, checks their work and keeps you updated.';
      $('bd-now').textContent = s[0].row;
    } else {
      const c = D.cards[k], idx = s.findIndex(x => x.card === k);
      $('bd-kicker').textContent = 'Managed by your Super Agent'; $('bd-name').textContent = c.name;
      $('bd-desc').textContent = c.desc; $('bd-now').textContent = s[idx].row;
    }
  }
  function renderSelection() {
    cards.forEach(c => { const on = Number(c.dataset.card) === selected; c.classList.toggle('active', on); c.setAttribute('aria-pressed', String(on)); });
    root.querySelector('.hub').dataset.selected = String(selected);
    renderDetail(selected);
  }
  let shownRows = 0;
  function renderStep(animate = false) {
    const s = story(), I = D.industries[ind], T = D.territories[ter];
    $('sa-now').textContent = s[step].sa;
    D.cards.forEach((c, k) => { const i = s.findIndex(x => x.card === k); $('ac-status-' + k).textContent = i <= step ? s[i].status : 'Ready'; cardBtn(k).classList.toggle('done', i <= step); cardBtn(k).classList.toggle('working', i === step); });
    cardBtn(-1).classList.toggle('working', step === 0);
    list.replaceChildren(...s.slice(0, step + 1).map((x, i) => {
      const li = el('li', 'act-row' + (animate && i >= shownRows && !reduced ? ' fresh' : '') + (x.card === 5 ? ' is-lead' : ''));
      li.append(el('span', 'act-who', x.card < 0 ? 'Super Agent' : D.cards[x.card].name), el('span', 'act-text', x.row)); return li;
    }));
    shownRows = step + 1;
    empty.hidden = true;
    leadBox.hidden = step < LAST;
    if (step >= LAST) { $('al-org').textContent = `${I.org} — ${T.name}`; $('al-meta').textContent = `${I.service} · ${I.first}, ${I.role}`; $('al-quote').textContent = `“${I.reply}”`; }
    map.classList.toggle('s-scan', step >= 1); map.classList.toggle('s-bad', step >= 3);
    const pin = $('lead-pin'); if (pin) { pin.classList.toggle('found', step >= 1); pin.classList.toggle('delivered', step >= LAST); }
    root.classList.toggle('is-playing', playing);
  }
  function setPlayUI() {
    playBtn.querySelector('.play-txt').textContent = playing ? 'Pause' : step >= LAST ? 'Play again' : 'Play the example';
    playBtn.setAttribute('aria-pressed', String(playing)); playBtn.classList.toggle('is-pause', playing);
    replayBtn.hidden = false;
  }
  function goTo(n, animate = false, followSelection = true) {
    step = Math.max(0, Math.min(LAST, n));
    if (followSelection) selected = story()[step].card;
    renderStep(animate); renderSelection(); setPlayUI();
  }
  /* the resting state is never empty: the first two lines are already there */
  const START = 1;
  function tick() {
    if (step < LAST) goTo(step + 1, true);
    /* after the delivered lead, rest ~4 s, then the next business */
    timer = step >= LAST ? setTimeout(nextBusiness, LOOP_PAUSE_MS) : setTimeout(tick, STEP_MS);
  }
  function nextBusiness() {
    /* gentle loop: the next business, starting fresh (nothing accumulates) */
    ind = (ind + 1) % trades.length; markTrade(false); drawMap(); shownRows = 0; goTo(START, true);
    timer = setTimeout(tick, STEP_MS);
  }
  function play(fromStart = false) {
    clearTimeout(timer); userPaused = false; playing = true;
    if (fromStart || step >= LAST) { shownRows = 0; goTo(START, true); }
    setPlayUI(); root.classList.add('is-playing');
    timer = setTimeout(tick, fromStart || step <= START ? 600 : 700);
  }
  function stop(byUser) { if (byUser) userPaused = true; playing = false; clearTimeout(timer); setPlayUI(); root.classList.remove('is-playing'); }
  playBtn.addEventListener('click', () => playing ? stop(true) : play(false));
  replayBtn.addEventListener('click', () => play(true));

  cards.forEach(c => c.addEventListener('click', () => {
    const k = Number(c.dataset.card); stop(true);
    const idx = story().findIndex(x => x.card === k);
    if (idx > step) goTo(idx, false, false);
    selected = k; renderSelection();
  }));
  function markTrade(scroll) {
    trades.forEach((b, k) => { b.classList.toggle('active', k === ind); b.setAttribute('aria-pressed', String(k === ind)); b.tabIndex = k === ind ? 0 : -1; });
    const b = trades[ind]; const left = b.offsetLeft - strip.offsetLeft - 8;
    if (left < strip.scrollLeft || left + b.offsetWidth > strip.scrollLeft + strip.clientWidth) strip.scrollTo({ left, behavior: reduced || !scroll ? 'auto' : 'smooth' });
  }
  function selectTrade(i) {
    ind = (i + trades.length) % trades.length; markTrade(true); refresh();
  }
  function refresh() { drawMap(); shownRows = 0; if (playing) play(true); else goTo(reduced ? LAST : START); }
  trades.forEach((b, i) => b.addEventListener('click', () => selectTrade(i)));
  root.querySelector('[data-trade-prev]').addEventListener('click', () => selectTrade(ind - 1));
  root.querySelector('[data-trade-next]').addEventListener('click', () => selectTrade(ind + 1));
  strip.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); selectTrade(ind + (e.key === 'ArrowRight' ? 1 : -1)); trades[ind].focus(); } });
  area.addEventListener('change', () => { ter = Number(area.value); refresh(); });

  /* start by itself when the section is on screen; pause when it scrolls away or the tab is hidden */
  const autoResume = () => { if (inView && !userPaused && !reduced && !document.hidden && !playing) play(false); };
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { for (const e of es) { inView = e.isIntersecting; if (inView) autoResume(); else if (playing) stop(false); } }, { threshold: .35 }).observe(root.querySelector('.bench-activity') || root);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { if (playing) stop(false); } else autoResume(); });

  /* hero links into the workbench */
  const scrollToBench = () => root.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  document.querySelectorAll('[data-found]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); stop(true); goTo(1); scrollToBench(); history.replaceState(null, '', '#agents'); }));
  document.querySelectorAll('[data-see-how]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); scrollToBench(); history.replaceState(null, '', '#agents'); if (reduced) goTo(LAST); else setTimeout(() => play(true), 500); }));
  document.querySelectorAll('[data-pick-trade]').forEach(b => b.addEventListener('click', () => {
    const i = D.industries.findIndex(d => d.id === b.dataset.pickTrade); if (i < 0) return;
    stop(false); ind = i; markTrade(false); drawMap(); scrollToBench(); history.replaceState(null, '', '#agents');
    if (reduced) goTo(LAST); else setTimeout(() => play(true), 500);
  }));
  trades.forEach((b, k) => b.tabIndex = k === ind ? 0 : -1); /* one tab stop; arrow keys move between trades */
  strip.setAttribute('aria-describedby', 'trade-hint');
  drawMap();
  goTo(reduced ? LAST : START);
})();
