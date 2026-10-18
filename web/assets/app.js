/* Byt a host — bytahost.cz · v3 (12.10.2026) · SPA bez buildu: routing přes hash, data v data/byty.js (+ recenze.js), zápis žádostí do Supabase (REST, anon INSERT). */
(function () {
  document.documentElement.classList.add('js');
  const CFG = window.BH_CFG || {};
  let B = window.BYTY || { meta: {}, byty: [] };
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const kc = n => (n == null ? '—' : Math.round(n).toLocaleString('cs-CZ').replace(/ /g, ' ') + ' Kč');
  const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const addD = (s, n) => { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return iso(d); };
  const today = iso(new Date());
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LANGS = ['cs', 'en', 'ru'];
  let LANG = (() => { const u = new URLSearchParams(location.search).get('lang'); if (LANGS.includes(u)) return u; let s = null; try { s = localStorage.getItem('bh_lang'); } catch (e) {} if (LANGS.includes(s)) return s; const n = (navigator.language || 'cs').toLowerCase(); return n.startsWith('cs') || n.startsWith('sk') ? 'cs' : (n.startsWith('ru') || n.startsWith('uk') || n.startsWith('be') ? 'ru' : 'en'); })();
  const L3 = (cs, en, ru) => LANG === 'ru' ? ru : LANG === 'en' ? en : cs;
  const RU = window.BH_RU || {};
  const STAR = '<svg class="ico" style="width:14px;height:14px;fill:currentColor;stroke:none"><use href="#i-star"/></svg>';

  /* ---------- i18n: CS = text v HTML, EN = slovník ---------- */
  const EN = {
    'nav.apt': 'Apartments', 'nav.own': 'For owners', 'nav.how': 'How it works', 'nav.contact': 'Contact', 'nav.portal': 'Owner portal', 'nav.book': 'Book now',
    'hero.h1': 'Prague, like home.<br><span class="g">Straight from the host.</span>', 'hero.lead': 'Over 40 apartments in Prague that we run ourselves, 4.9+ guest rating and Airbnb Superhost. Book directly with us 10 % cheaper than on Airbnb and Booking, or let us manage your flat.',
    's.in': 'Check-in', 's.out': 'Check-out', 's.guests': 'Guests', 's.go': 'Show availability', 'hero.pause': 'Pause video', 'hero.play': 'Play video',
    'st.apt': 'apartments in Prague under management', 'st.rev': 'guest reviews', 'st.rat': 'average guest rating', 'apt.sh': 'Airbnb Superhost', 'st.direct': 'when you book direct with us',
    'apt.h2': 'Choose your place in Prague', 'apt.p': 'We operate every apartment ourselves: we know what is inside, who cleans and who picks up the phone. Prices are final, with no platform service fees.',
    'why.h2': 'Same apartment, lower price, personal care', 'why.p': 'Platforms take a commission from every booking. When you book direct, part of that saving goes to you.', 'why.1b': '10 % less than Airbnb and Booking', 'why.1p': 'Same apartment, same dates, 10 % lower price than on the platforms. You can see it on every listing.', 'why.2b': 'No hidden fees', 'why.2p': 'You see the nightly rate, cleaning and city tax. Nothing else is added.', 'why.3b': 'Card or bank transfer', 'why.3p': 'After confirmation you receive a secure payment link. Nothing is charged automatically.', 'why.4b': 'One team from A to Z', 'why.4p': 'The same people who prepare the apartment answer your messages and help with arrival.',
    'rev.h2': 'What guests say', 'rev.p': 'Real reviews from Airbnb, exactly as guests wrote them.',
    'own.h2': '15 % of the income. We take care of everything else.', 'own.p': 'Listings, pricing, guests, cleaning, maintenance, city tax and statements. You just watch the portal and get paid every month.', 'own.t1': 'No flat fees or setup fees. You pay only from what the flat earns.', 'own.t2': 'Direct bookings through this website without platform commission, so more stays with you.', 'own.t3': 'First 90 days as a trial, 2-month notice, no penalties.', 'own.cta': 'See what you keep', 'own.cta2': 'How it works', 'own.fee': 'of what Airbnb and Booking pay you. It includes everything:', 'own.i1': 'Photos and listings on Airbnb, Booking and this website', 'own.i2': 'Prices by season and demand, daily', 'own.i3': 'Guests and messages 7 days a week, in their language', 'own.i4': 'Cleaning after every stay, linen, toiletries', 'own.i5': 'Maintenance and small repairs at cost', 'own.i6': 'City tax and guest register', 'own.i7': 'Monthly statement by the 10th', 'own.i8': 'Owner portal: occupancy and money online', 'own.note': 'Prague managers usually charge 15 to 20 % plus VAT and extra fees on top. With us it is 15 %, full stop.', 'own.call': 'Call us', 'hdr.own': 'Management · 15 %', 'f.flat': 'Flat: street or district (optional)', 'o.f.or': 'or simply', 'o.f.hours': 'We answer every day. If we miss you, we call back.', 'l.h2': 'Owner portal', 'l.p': 'Occupancy, bookings, cleanings, city tax and the monthly statement of your flat. Any time, anywhere.', 'l.t1': 'Overview by day and by month', 'l.t2': 'Every booking from Airbnb, Booking and this website', 'l.t3': 'Statements and our invoice to download', 'l.h3': 'Sign in', 'l.num': 'Client number', 'l.pwd': 'Password', 'l.rem': 'Remember me on this device', 'l.go': 'Sign in', 'l.help': 'You received your client number and password from us when signing the contract. Forgotten password: call +420 721 712 762.', 'l.out': 'Sign out',
    'how.h2': 'From booking to departure', 'how.p': 'Four steps, no waiting at a reception desk.', 'how.1h': 'Pick your dates', 'how.1p': 'The calendar shows availability and the final nightly price. Sending the form creates a non-binding request.', 'how.2h': 'We confirm and send payment', 'how.2p': 'Usually within a few hours we confirm the dates and send a secure card payment link or bank details.', 'how.3h': 'Arrival instructions', 'how.3p': 'The day before arrival you get the address, key-box code and an apartment guide. Self check-in from 2 PM.', 'how.4h': 'We are one message away', 'how.4p': 'Write to us any time during your stay. Check-out by 11 AM, keys back in the box.',
    'faq.h2': 'What guests ask', 'c.h2': 'Write to us', 'c.p': 'A question about a stay, a special request or interest in management. We usually reply within 24 hours, faster in season.', 'c.i.h': 'Byt a host · B&H', 'c.i.p': 'Call or write, whichever you prefer.', 'c.i.n': 'Prague · Czechia. Guests can also reach us in the Airbnb and Booking.com chat.',
    'f.name': 'Name', 'f.email': 'E-mail', 'f.phone': 'Phone', 'f.topic': 'Topic', 'f.t1': 'Stay / booking', 'f.t2': 'Managing my apartment', 'f.t3': 'Other', 'f.msg': 'Message', 'f.send': 'Send message', 'f.send2': 'Call me back', 'f.addr': 'Apartment address', 'f.disp': 'Layout', 'f.state': 'Condition', 'f.st1': 'Furnished, ready', 'f.st2': 'Partly furnished', 'f.st3': 'Empty / after renovation', 'f.st4': 'Already renting short-term',
    'o.h2': 'Rent out without the work. For 15 % of income.', 'o.p': 'We run over 40 apartments in Prague, our own and managed for owners. We do only short-term rental and we do all of it: from photos to the statement. You do nothing.', 'o.t1': 'The same care as for our own flats, the same team, the same prices', 'o.t2': 'Money goes to you directly from Airbnb and Booking, we invoice only 15 %', 'o.t3': 'A revenue estimate for your flat within 24 hours, free and non-binding', 'o.cta': 'Get a revenue estimate', 'o.portal': 'Owner portal preview', 'o.s1': 'apartments managed and operated', 'o.s2': 'guest rating · Superhost', 'o.s3': 'guest reviews', 'o.s4': 'the only fee, no flat charges', 'o.y.h2': 'And what do you do?', 'o.y.p': 'Almost nothing. Three things stay with the owner, we help with everything else.', 'o.y1h': 'A flat ready to rent', 'o.y1p': 'A furnished flat, household and liability insurance, utilities and internet. Whatever is missing, we recommend and buy for you at cost.', 'o.y2h': 'Host registration', 'o.y2p': 'Notification to the district and building consent where the rules require it. We prepare the forms, you just sign.', 'o.y3h': 'Watch the portal', 'o.y3p': 'Occupancy, bookings, cleanings and statements online any time. Block your own stay with one click.', 'o.m.h2': 'Two ways to work together', 'o.m.p': 'Most owners choose management for 15 %. For selected flats we can also offer a fixed rent.', 'o.m1t': 'Recommended', 'o.m1h': 'Management for 15 %', 'o.m1p': 'Of what Airbnb and Booking pay you. Income grows with occupancy and season, you see every booking. No flat fees, 2-month notice, first 90 days as a trial.', 'o.m1c': 'Get a revenue estimate', 'o.m2t': 'Selected flats', 'o.m2h': 'Guaranteed rent', 'o.m2pr': 'fixed amount', 'o.m2p': 'The same amount every month regardless of occupancy; we run the flat at our own risk. Offered after a visit for flats in a good location and condition. We tell you the rent at the meeting.', 'o.m2c': 'Ask about the rent', 'o.how.p': 'Usually 2 to 3 weeks from the visit to the first listing going live.', 'o.faq.h2': 'What owners ask', 'o.f.p': 'Just your name and phone. We ask about the flat, send a revenue estimate and arrange a visit. No obligation.',
    'o.calc': 'What your flat can earn', 'o.calc.note': 'Indicative monthly income after the Airbnb and Booking commission. We send a precise estimate for your flat within 24 hours. Cleaning is paid by the guest, no monthly fees.',
    'o.w.h2': 'Everything that is in the 15 %', 'o.w.p': 'The whole operation, not just handing over keys. None of it is charged separately.', 'o.how.h2': 'From the first meeting to the first payout', 'o.h1h': 'Visit and estimate', 'o.h1p': 'We come to see the flat and give you a realistic occupancy and price estimate based on our neighbouring apartments, not marketing.', 'o.h2h': 'Preparing the apartment', 'o.h2p': 'We recommend equipment, arrange a photographer, key box, lock and linen. All at cost, without our mark-up.', 'o.h3h': 'Going live', 'o.h3p': 'Airbnb, Booking and this website. Prices are set by season and tuned daily in the first weeks.', 'o.h4h': 'Payout and portal', 'o.h4p': 'Every month a statement with bookings, cleanings and fees. Money comes to you directly from the platforms; we invoice only our 15 %.',
    'o.r.h2': 'Clear rules, no small print', 'o.f.h2': 'We call you within 24 hours',
    'p.h2': 'Your numbers online, any time', 'p.p': 'Every owner has a secured page: day-by-day occupancy, Airbnb and Booking reservations, cleanings, city tax and the monthly statement with our fee. Access is protected by the PIN we gave you.', 'p.note': 'Prospective owners: we are happy to show a demo portal with anonymised data at a meeting.',
    'ft.p': 'Byt a host · B&H. Apartments in Prague run by us, and short-term rental management for owners.', 'ft.guests': 'For guests', 'ft.terms': 'Booking terms', 'ft.owners': 'For owners', 'ft.mgmt': 'Management for 15 %', 'ft.inq': 'Inquiry', 'ft.contact': 'Contact', 'ft.write': 'Write to us', 'ft.cp': 'Prices in CZK incl. VAT. City tax 50 CZK per person per night according to the Prague ordinance.',
  };
  const D = {
    cs: { guests: 'hostů', guest1: 'host', guests2: 'hosté', bedroom: 'ložnice', beds: 'postele', bed1: 'postel', bath: 'koupelna', baths: 'koupelny', from: 'od', night: 'noc', direct: 'přímo u nás', detail: 'Detail a rezervace', airbnb: 'Airbnb', booking: 'Booking.com', reviews: 'recenzí', closed: 'Momentálně nedostupné', about: 'O apartmánu', amen: 'Vybavení', loc: 'Lokalita', locp: 'Pin ukazuje přibližnou polohu. Přesnou adresu s číslem domu pošleme po potvrzení rezervace.', rules: 'Pravidla a příjezd', avail: 'Dostupnost a ceny', calp: 'Klikněte na den příjezdu a den odjezdu. Ceny jsou za noc při rezervaci přímo u nás, bez dalších poplatků platforem.', bookp: 'Nezávazná žádost. Potvrdíme a pošleme platební odkaz.', checkin: 'Příjezd', checkout: 'Odjezd', adults: 'Dospělí', kids: 'Děti do 18', nights: 'nocí', nightsx: 'noc', cleaning: 'Úklid', tax: 'Městský poplatek', taxp: '50 Kč / dospělý / noc', total: 'Celkem', send: 'Odeslat žádost o rezervaci', sending: 'Odesílám…', ok: 'Děkujeme! Žádost jsme přijali. Ozveme se co nejdříve s potvrzením a platebním odkazem.', err: 'Odeslání se nepodařilo. Zkuste to prosím za chvíli znovu, nebo nám napište přes kontakt.', or: 'nebo rezervujte na', pick: 'Vyberte termín v kalendáři', unavail: 'Termín není celý volný', minn: 'Minimální délka pobytu v tomto termínu je {n} nocí', name: 'Jméno a příjmení', email: 'E-mail', phone: 'Telefon', note: 'Poznámka (čas příjezdu, přání)', mon: ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'], wk: ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'], free: 'apartmánů volných pro', none: 'Pro zadaný termín bohužel nemáme volný apartmán. Zkuste posunout data nebo nám napište.', clear: 'Zrušit filtr', sent: 'Zpráva odeslána, ozveme se.', sent2: 'Poptávka odeslána, ozveme se do 24 hodin.', pin: 'Vstup s PINem', self: 'Samoobslužný check-in od {ci}, odjezd do 11:00. Nekuřácký byt, bez večírků. Mazlíčci po domluvě.', pet: 'Poplatek za mazlíčka', back: 'Apartmány', all: 'Všechny', allph: 'Všechny fotky', selfci: 'samoobslužný check-in', avail2: 'volno', booked: 'obsazeno', yours: 'váš výběr', pernight: 'ceny za noc, přímo u nás', onair: 'na Airbnb', revh: 'Recenze hostů', translated: 'Přeloženo', prague1: 'Praha 1', nusle: 'Nusle & Vyšehrad', save: 'ušetříte', lbad: 'Špatné číslo klienta nebo heslo.', lwait: 'Přihlašuji…', lgo: 'Přihlásit', lnet: 'Portál se nepodařilo načíst. Zkuste to za chvíli znovu.' },
    en: { guests: 'guests', guest1: 'guest', guests2: 'guests', bedroom: 'bedroom', beds: 'beds', bed1: 'bed', bath: 'bathroom', baths: 'bathrooms', from: 'from', night: 'night', direct: 'direct with us', detail: 'Details & booking', airbnb: 'Airbnb', booking: 'Booking.com', reviews: 'reviews', closed: 'Currently unavailable', about: 'About the apartment', amen: 'Amenities', loc: 'Location', locp: 'The pin shows the approximate location. The exact address follows after confirmation.', rules: 'House rules & arrival', avail: 'Availability & prices', calp: 'Click the check-in and check-out day. Prices are per night when booking direct, with no platform fees.', bookp: 'Non-binding request. We confirm and send a payment link.', checkin: 'Check-in', checkout: 'Check-out', adults: 'Adults', kids: 'Children under 18', nights: 'nights', nightsx: 'night', cleaning: 'Cleaning', tax: 'City tax', taxp: '50 CZK / adult / night', total: 'Total', send: 'Send booking request', sending: 'Sending…', ok: 'Thank you! We received your request and will reply shortly with a confirmation and payment link.', err: 'Sending failed. Please try again in a moment or use the contact form.', or: 'or book on', pick: 'Pick your dates in the calendar', unavail: 'Not all nights are available', minn: 'Minimum stay for these dates is {n} nights', name: 'Full name', email: 'E-mail', phone: 'Phone', note: 'Note (arrival time, wishes)', mon: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], wk: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'], free: 'apartments available for', none: 'Sorry, nothing is free for these dates. Try shifting the dates or write to us.', clear: 'Clear filter', sent: 'Message sent, we will get back to you.', sent2: 'Inquiry sent, we will reply within 24 hours.', pin: 'Enter with PIN', self: 'Self check-in from {ci}, check-out by 11 AM. Non-smoking, no parties. Pets on request.', pet: 'Pet fee', back: 'Apartments', all: 'All', allph: 'All photos', selfci: 'self check-in', avail2: 'available', booked: 'booked', yours: 'your dates', pernight: 'per night, direct', onair: 'on Airbnb', revh: 'Guest reviews', translated: 'Translated', prague1: 'Prague 1', nusle: 'Nusle & Vyšehrad', save: 'you save', lbad: 'Wrong client number or password.', lwait: 'Signing in…', lgo: 'Sign in', lnet: 'The portal could not be loaded. Please try again in a moment.' },
  };
  D.ru = Object.assign({}, D.en, RU.D || {});
  const t = k => D[LANG][k] ?? D.en[k] ?? D.cs[k] ?? k;
  function applyLang() {
    $$('[data-i],[data-i-html]').forEach(el => {
      const key = el.dataset.i || el.dataset.iHtml; if (!key) return;
      if (!('cs' in el.dataset)) el.dataset.cs = el.innerHTML;
      const DIC = LANG === 'en' ? EN : LANG === 'ru' ? (RU.EN || EN) : null;
      if (DIC && DIC[key] != null) el.innerHTML = DIC[key]; else el.innerHTML = el.dataset.cs;
    });
    $$('.lang button').forEach(b => b.classList.toggle('on', b.dataset.lang === LANG));
    document.documentElement.lang = LANG; try { localStorage.setItem('bh_lang', LANG); } catch (e) {}
    try { const u = new URL(location.href); if (LANG === 'cs') u.searchParams.delete('lang'); else u.searchParams.set('lang', LANG); history.replaceState(null, '', u.pathname + u.search + u.hash); } catch (e) {}   // odkaz na jazyk: bytahost.cz/?lang=ru
    renderFaq(); renderOwnerBlocks(); renderPortal(); renderTerms(); renderFilters(); renderGrid(FILTR); renderReviews();
    if (ROUTE.page === 'detail') renderDetail(ROUTE.slug, true);
  }

  /* ---------- data helpers ---------- */
  const verejne = () => B.byty.filter(b => !b.skryty);
  const bySlug = s => B.byty.find(b => b.slug === s);
  const img = (p, small) => small ? p.replace(/\.jpg$/, '-s.jpg') : p;
  const lok = b => LANG !== 'cs' && b.lokalita_en ? b.lokalita_en : b.lokalita;
  const lid = b => ((b.airbnb_url || '').match(/rooms\/(\d+)/) || [])[1];
  const SLEVA = () => (B.meta && B.meta.sleva_primo) || 0.9;
  const airKc = b => b.od_kc ? Math.round(b.od_kc / SLEVA() / 10) * 10 : null;
  const OBL = [[/Praha 1|Staré Město|Nové Město|Havelsk|Muzea|Václavsk|Národní/i, 'prague1'], [/Vinohrady|Korunní/i, 'Vinohrady'], [/Žižkov|Basilej|Olšansk|Baranova/i, 'Žižkov'], [/Florenc|Karlín/i, 'Karlín'], [/Holešovice|Vltav/i, 'Holešovice'], [/Nusle|Vyšehrad/i, 'nusle'], [/Smíchov|Anděl/i, 'Smíchov'], [/Harfa|O2/i, 'Harfa']];
  const oblastKey = b => { const s = b.lokalita || ''; for (const [re, k] of OBL) if (re.test(s)) return k; return 'Praha'; };
  const oblastName = k => (k === 'prague1' || k === 'nusle') ? t(k) : k;
  function minNoci(b, d) { const r = b.min_noci_pravidlo || {}; for (const k of Object.keys(r)) { if (k === 'default') continue; const [a, z] = k.split('..'); if (d >= a && d <= z) return r[k]; } return r.default || 2; }
  function nociList(od, doo) { const out = []; let d = od; while (d < doo) { out.push(d); d = addD(d, 1); } return out; }
  function kalkul(b, od, doo, dosp, deti) {
    const n = nociList(od, doo); if (!n.length) return { err: 'pick' };
    let sum = 0; for (const d of n) { const c = b.ceny[d]; if (!c || !c[1]) return { err: 'unavail' }; sum += c[0]; }
    const mn = minNoci(b, od); if (n.length < mn) return { err: 'minn', n: mn };
    const uklid = b.uklid_kc || 0, tax = (b.mesto_kc_os_noc || 50) * dosp * n.length;
    return { noci: n.length, ubyt: sum, uklid, tax, celkem: sum + uklid + tax, prum: Math.round(sum / n.length) };
  }
  function popis(b) {
    const am = (b.vybaveni || []).map(s => s.toLowerCase());
    const has = re => am.some(a => re.test(a)) || re.test((b.nazev_airbnb || '').toLowerCase());
    const feats = [];
    if (LANG === 'cs') {
      if (has(/parking/)) feats.push('parkování'); if (has(/balcon|loggia/)) feats.push('balkon'); if (has(/terrace/)) feats.push('terasu'); if (has(/garden|backyard/)) feats.push('zahradu'); if (has(/air condition|\bac\b/)) feats.push('klimatizaci'); if (has(/washer/)) feats.push('pračku'); if (has(/dishwasher/)) feats.push('myčku'); if (has(/elevator/)) feats.push('výtah'); if (has(/workspace/)) feats.push('pracovní místo');
      const loz = b.loznice === 1 ? '1 ložnicí' : b.loznice + ' ložnicemi'; const kp = b.koupelny === 1 ? '1 koupelnou' : b.koupelny + ' koupelnami';
      return `${b.nazev} je apartmán v lokalitě ${lok(b)} až pro ${b.hoste} ${b.hoste === 1 ? 'hosta' : b.hoste < 5 ? 'hosty' : 'hostů'}, s ${loz} a ${kp}${b.typ ? ' (' + b.typ + ')' : ''}. ${feats.length ? 'K dispozici je ' + feats.join(', ') + '. ' : ''}Plně vybavená kuchyně, rychlá Wi-Fi, ložní prádlo a ručníky jsou samozřejmostí. Check-in je samoobslužný přes schránku na klíče, takže přijedete, kdy potřebujete.`;
    }
    if (has(/parking/)) feats.push('parking'); if (has(/balcon|loggia/)) feats.push('a balcony'); if (has(/terrace/)) feats.push('a terrace'); if (has(/garden|backyard/)) feats.push('a garden'); if (has(/air condition|\bac\b/)) feats.push('air conditioning'); if (has(/washer/)) feats.push('a washer'); if (has(/dishwasher/)) feats.push('a dishwasher'); if (has(/elevator/)) feats.push('an elevator'); if (has(/workspace/)) feats.push('a workspace');
    return `${b.nazev} is an apartment in ${lok(b)} for up to ${b.hoste} guests, with ${b.loznice} bedroom${b.loznice > 1 ? 's' : ''} and ${b.koupelny} bathroom${b.koupelny > 1 ? 's' : ''}${b.typ ? ' (' + b.typ + ')' : ''}. ${feats.length ? 'It offers ' + feats.join(', ') + '. ' : ''}A fully equipped kitchen, fast Wi-Fi, bed linen and towels are standard. Check-in is self-service via a key box, so you arrive whenever you need.`;
  }

  /* ---------- reveal on scroll + counters ---------- */
  let IO = null;
  function rvCheck() { const h = innerHeight; $$('.rv:not(.in)').forEach(e => { const r = e.getBoundingClientRect(); if (r.height && r.top < h * .94 && r.bottom > 0) e.classList.add('in'); }); }
  function watchRv(root) {
    const els = $$('.rv:not(.in)', root || document);
    if (REDUCED || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    if (!IO) IO = new IntersectionObserver(en => en.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); IO.unobserve(x.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: .05 });
    els.forEach(e => IO.observe(e));
    requestAnimationFrame(rvCheck);
  }
  let RVT = 0; window.addEventListener('scroll', () => { if (RVT) return; RVT = requestAnimationFrame(() => { RVT = 0; rvCheck(); }); }, { passive: true }); window.addEventListener('resize', rvCheck);
  function countUp(el, to, suffix) {
    if (REDUCED) { el.textContent = to.toLocaleString('cs-CZ') + (suffix || ''); return; }
    const t0 = performance.now(), dur = 1300; const step = now => { const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(to * e).toLocaleString('cs-CZ') + (suffix || ''); if (p < 1) requestAnimationFrame(step); }; requestAnimationFrame(step);
  }

  /* ---------- home: stats + filters + grid + search ---------- */
  function trust() {
    const v = verejne(); const apt = $('#t-apt'), revEl = $('#t-rev');
    const rev = v.reduce((s, b) => s + (b.recenzi_airbnb || 0) + (b.recenzi_booking || 0), 0);
    const ra = v.filter(b => b.rating_airbnb && (b.recenzi_airbnb || 0) >= 5); const avgA = ra.length ? (ra.reduce((s, b) => s + b.rating_airbnb, 0) / ra.length) : null;
    const rb = v.filter(b => b.rating_booking && (b.recenzi_booking || 0) >= 5); const avgB = rb.length ? (rb.reduce((s, b) => s + b.rating_booking, 0) / rb.length) : null;
    const orv = $('#o-rev'); if (orv) orv.textContent = rev.toLocaleString('cs-CZ');
    if ($('#t-plat')) $('#t-plat').innerHTML = (avgA ? `<span class="chip air">Airbnb ${avgA.toFixed(1).replace('.', ',')}</span>` : '') + (avgB ? `<span class="chip bk">Booking.com ${avgB.toFixed(1).replace('.', ',')}</span>` : '') + (CFG.superhost ? `<span class="chip gold">${L3('Superhostitel', 'Superhost', 'Суперхост')}</span>` : '');
    const run = () => { countUp(apt, +(apt.dataset.n || 40)); countUp(revEl, rev); };
    if (REDUCED || !('IntersectionObserver' in window)) run(); else { const o = new IntersectionObserver(en => { if (en[0].isIntersecting) { run(); o.disconnect(); } }, { threshold: .3 }); o.observe($('.stats')); }
  }
  let FILTR = null, OBLAST = null;
  function renderFilters() {
    const f = $('#filters'); if (!f) return;
    const v = verejne(); const cnt = {}; v.forEach(b => { const k = oblastKey(b); cnt[k] = (cnt[k] || 0) + 1; });
    const keys = Object.keys(cnt).sort((a, c) => cnt[c] - cnt[a]);
    f.innerHTML = `<button type="button" class="${OBLAST ? '' : 'on'}" data-k="">${t('all')}<small>${v.length}</small></button>` + keys.map(k => `<button type="button" class="${OBLAST === k ? 'on' : ''}" data-k="${esc(k)}">${esc(oblastName(k))}<small>${cnt[k]}</small></button>`).join('');
    $$('button', f).forEach(x => x.onclick = () => { OBLAST = x.dataset.k || null; renderFilters(); renderGrid(FILTR); });
  }
  function card(b, f) {
    const r = b.rating_airbnb ? `<span class="chip white"><span class="star">${STAR}</span>${b.rating_airbnb.toFixed(2)} · ${b.recenzi_airbnb || 0}</span>` : '<span></span>';
    const cena = f && b._k ? `<b>${kc(b._k.celkem)}</b><small>${b._k.noci} ${t('nights')} · ${t('direct')}</small>` : b.od_kc ? `<b>${t('from')} ${kc(b.od_kc)}</b><small><s>Airbnb ${kc(airKc(b))}</s>/ ${t('night')} · ${t('direct')}</small>` : `<b style="font-size:18px">${t('closed')}</b>`;
    const fotky = (b.fotky || []).slice(0, 8); const href = `#/apartman/${b.slug}${f ? `?od=${f.od}&do=${f.do}&h=${f.h}` : ''}`;
    return `<article class="card rv"><div class="car"><div class="trk">${fotky.map((p, i) => `<a href="${href}" aria-label="${esc(b.nazev)}"><img src="${img(p, true)}" alt="" ${i ? 'loading="lazy"' : ''}></a>`).join('')}</div>
      ${fotky.length > 1 ? `<button class="nb p" type="button" aria-label="Předchozí foto"><svg class="ico"><use href="#i-left"/></svg></button><button class="nb n" type="button" aria-label="Další foto"><svg class="ico"><use href="#i-right"/></svg></button><div class="dots">${fotky.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>` : ''}
      <div class="ov">${r}<span class="chip gold">−10 % ${t('direct')}</span></div></div>
      <div class="bd"><h3><a href="${href}">${esc(b.nazev)}</a></h3><div class="meta"><span>${esc(oblastName(oblastKey(b)))}</span><span>${b.hoste} ${t('guests')}</span><span>${b.loznice} ${t('bedroom')}</span><span>${b.koupelny} ${b.koupelny > 1 ? t('baths') : t('bath')}</span></div>
      <div class="price"><div>${cena}</div></div>
      <div class="acts"><a class="btn sm" href="${href}">${t('detail')}</a><a class="btn air sm" href="${esc(b.airbnb_url)}" target="_blank" rel="noopener">Airbnb</a></div></div></article>`;
  }
  function renderGrid(f) {
    const g = $('#grid'); if (!g) return;
    let list = verejne(); const info = $('#filtr-info');
    if (OBLAST) list = list.filter(b => oblastKey(b) === OBLAST);
    if (f) {
      list = list.map(b => ({ b, k: b.bez_rezervace ? { err: 'closed' } : kalkul(b, f.od, f.do, f.h, 0) })).filter(x => x.b.hoste >= f.h && !x.k.err).map(x => Object.assign(x.b, { _k: x.k }));
      info.style.display = 'block';
      info.innerHTML = list.length ? `<b>${list.length}</b> ${t('free')} ${f.od} – ${f.do}, ${f.h} ${t('guests')}. <a href="#" id="filtr-x">${t('clear')}</a>` : `${t('none')} <a href="#" id="filtr-x">${t('clear')}</a>`;
      $('#filtr-x').onclick = e => { e.preventDefault(); FILTR = null; renderGrid(null); };
    } else info.style.display = 'none';
    g.innerHTML = list.map(b => card(b, f)).join('');
    $$('.card', g).forEach((c, i) => { c.classList.add('d' + (i % 3)); initCar(c); });
    watchRv(g);
  }
  function initCar(c) {
    const trk = $('.trk', c), dots = $$('.dots i', c); if (!trk) return;
    const w = () => trk.clientWidth || 1;
    const upd = () => { const i = Math.round(trk.scrollLeft / w()); dots.forEach((d, j) => d.classList.toggle('on', j === i)); };
    trk.addEventListener('scroll', () => requestAnimationFrame(upd), { passive: true });
    const go = d => { const i = Math.round(trk.scrollLeft / w()) + d, n = trk.children.length; trk.scrollTo({ left: ((i + n) % n) * w(), behavior: REDUCED ? 'auto' : 'smooth' }); };
    const p = $('.nb.p', c), n = $('.nb.n', c); if (p) p.onclick = e => { e.preventDefault(); go(-1); }; if (n) n.onclick = e => { e.preventDefault(); go(1); };
  }
  $('#search').onsubmit = e => { e.preventDefault(); const od = $('#s-od').value, doo = $('#s-do').value, h = +$('#s-h').value; if (!od || !doo || doo <= od) { $('#s-do').setCustomValidity(L3('Odjezd musí být po příjezdu.', 'Check-out must be after check-in.', 'Выезд должен быть позже заезда.')); $('#s-do').reportValidity(); return; } $('#s-do').setCustomValidity(''); FILTR = { od, do: doo, h }; OBLAST = null; renderFilters(); renderGrid(FILTR); $('#apartmany').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' }); };
  function dateHints() { $$('input[type=date]').forEach(i => { const w = i.closest('label, .dates > div'); if (!w) return; w.dataset.hint = L3('Vyberte datum', 'Pick a date', 'Выберите дату'); w.classList.toggle('empty', !i.value); if (!i.dataset.h) { i.dataset.h = 1; i.addEventListener('input', dateHints); i.addEventListener('change', dateHints); i.addEventListener('focus', () => w.classList.remove('empty')); i.addEventListener('blur', dateHints); } }); }
  window.BH_dateHints = dateHints;
  $('#s-od').min = today; $('#s-od').onchange = () => { $('#s-do').min = addD($('#s-od').value, 1); $('#s-do').setCustomValidity(''); };

  /* ---------- reviews ---------- */
  function revList(b) {
    const R = (window.RECENZE && window.RECENZE.listingy) || {}; const out = [];
    for (const [id, v] of Object.entries(R)) {
      if (b && lid(b) !== id) continue;
      const byt = B.byty.find(x => lid(x) === id); if (!byt || byt.skryty) continue;
      for (const r of (v[LANG] || (LANG === 'ru' ? v.en : null) || v.cs || [])) { const txt = (LANG === 'cs' ? r.text_cs : r.text_en) || r.text; out.push({ ...r, txt, lang: r.lang || '', byt: byt.nazev, slug: byt.slug }); }
    }
    return out;
  }
  function stars(n) { if (!n) return '<span></span>'; return `<span class="stars" role="img" aria-label="${n} / 5">${Array.from({ length: 5 }, (_, i) => `<svg viewBox="0 0 24 24" style="opacity:${i < n ? 1 : .25}"><use href="#i-star"/></svg>`).join('')}</span>`; }
  function who(r) { const dt = /airbnb|hosting|years?|rok/i.test(r.date || '') && !/před|ago/i.test(r.date || '') ? '' : (r.date || ''); return `<div class="who"><i>${esc((r.name || '?').trim().charAt(0).toUpperCase())}</i><div><b>${esc(r.name)}</b>${esc(dt)}${r.byt ? ' · ' + esc(r.byt) : ''}${r.lang && r.lang !== LANG ? ` · <span style="opacity:.7">${t('translated')}</span>` : ''}</div></div>`; }
  let REVTRY = false;
  function renderReviews() {
    const sec = $('#recenze'), row = $('#revrow'); if (!sec || !row) return;
    if (!window.RECENZE && !REVTRY) { REVTRY = true; fetch('data/recenze.json').then(r => r.json()).then(d => { window.RECENZE = d; renderReviews(); if (ROUTE.page === 'detail') renderDetail(ROUTE.slug, true); }).catch(() => {}); }
    let all = revList(null).filter(r => r.txt && r.txt.length >= 70 && r.txt.length <= 260 && r.rating >= 5);
    if (all.length < 3) { sec.style.display = 'none'; return; }
    // deterministicky promichat, 1 recenze na byt napred (pestrost)
    const seen = new Set(), first = [], rest = []; for (const r of all) { if (seen.has(r.slug)) rest.push(r); else { seen.add(r.slug); first.push(r); } }
    const pick = [...first, ...rest].slice(0, 14);
    row.innerHTML = pick.map(r => `<article class="rev"><div class="top"><span class="chip air">Airbnb</span>${stars(r.rating)}</div><p>${esc(r.txt)}</p>${who(r)}</article>`).join('');
    sec.style.display = 'block';
    const go = d => row.scrollBy({ left: d * (($('.rev', row) || {}).offsetWidth + 18 || 380), behavior: REDUCED ? 'auto' : 'smooth' });
    $('#rev-p').onclick = () => go(-1); $('#rev-n').onclick = () => go(1);
  }

  /* ---------- FAQ ---------- */
  const FAQ = {
    cs: [['V kolik je check-in a check-out?', 'Check-in je samoobslužný od 14:00 (u některých bytů od 16:00, vidíte to v detailu), check-out do 11:00. Dřívější příjezd nebo pozdější odjezd rádi umožníme po domluvě podle obsazenosti.'], ['Jak dostanu klíče?', 'Den před příjezdem pošleme adresu, kód ke schránce na klíče a krátkého průvodce bytem. Nemusíte se s nikým potkávat ani hlídat čas.'], ['Je přímá rezervace opravdu levnější?', 'Ano. Stejný byt, stejný termín, o 10 % nižší cena než na Airbnb nebo Booking. Platformy si účtují provizi, kterou u přímé rezervace neplatíme, a část úspory dáváme vám.'], ['Jak se platí?', 'Po potvrzení termínu pošleme zabezpečený odkaz k platbě kartou nebo údaje k bankovnímu převodu. Žádost sama o sobě nic nestrhává.'], ['Co je městský poplatek?', 'Poplatek z pobytu hl. m. Prahy 50 Kč za dospělou osobu a noc. Odvádíme ho za vás městu, v ceně ho vidíte zvlášť. Děti do 18 let jsou osvobozeny.'], ['Mohu přijet s mazlíčkem?', 'V některých bytech ano, za jednorázový poplatek uvedený v detailu. Napište nám prosím předem.'], ['Kde zaparkuji?', 'Několik bytů má vlastní parkování zdarma (je to v názvu a vybavení). Jinde poradíme s nejbližším parkovacím domem; centrum má modré zóny.'], ['Co když musím zrušit?', 'Při zrušení 14 a více dní před příjezdem vracíme celou platbu, 7–13 dní před příjezdem polovinu. Podrobnosti v rezervačních podmínkách.']],
    en: [['What time is check-in and check-out?', 'Self check-in from 2 PM (some apartments from 4 PM, shown in the detail), check-out by 11 AM. Earlier arrival or later departure on request, depending on occupancy.'], ['How do I get the keys?', 'The day before arrival we send the address, the key-box code and a short apartment guide. No meeting, no fixed time.'], ['Is booking direct really cheaper?', 'Yes. Same apartment, same dates, 10 % less than on Airbnb or Booking. Platforms charge a commission we do not pay on direct bookings, and we pass part of the saving to you.'], ['How do I pay?', 'After we confirm the dates we send a secure card payment link or bank transfer details. The request itself charges nothing.'], ['What is the city tax?', 'Prague tourist tax of 50 CZK per adult per night. We remit it to the city for you; it is shown separately in the price. Children under 18 are exempt.'], ['Can I bring a pet?', 'In some apartments yes, for a one-off fee shown in the detail. Please tell us in advance.'], ['Where do I park?', 'Several apartments have free private parking (it is in the name and amenities). Elsewhere we advise the nearest garage; the centre has blue zones.'], ['What if I have to cancel?', 'Cancellations 14+ days before arrival are refunded in full, 7–13 days before arrival 50 %. Details in the booking terms.']],
  };
  const OFAQ = {
    cs: [['Kolik mi byt vydělá?', 'Záleží na lokalitě, velikosti, vybavení a sezóně. Odhad neděláme od stolu: vycházíme z obsazenosti a cen našich bytů ve stejné čtvrti za posledních 12 měsíců. Konkrétní čísla pro váš byt pošleme do 24 hodin od vyplnění formuláře.'], ['Kdy a jak dostanu peníze?', 'Výplaty z Airbnb a Booking chodí přímo na váš účet, obvykle den po příjezdu hosta. My vám do 10. dne dalšího měsíce pošleme vyúčtování a fakturu na 15 %. Přímé rezervace z tohoto webu vyúčtujeme ve stejném přehledu.'], ['Můžu v bytě bydlet nebo ho půjčit rodině?', 'Ano, je to váš byt. Termín si zablokujete v portálu nebo zprávou, ideálně 30 dní předem. Už potvrzené rezervace hostů se dodržují.'], ['Co když host něco rozbije?', 'Škody řešíme s hostem a přes ochranu platforem (Airbnb AirCover, Booking). Byt po každém pobytu kontroluje náš úklid, takže o problému víme hned a vy dostanete informaci o každém případu.'], ['Potřebuji živnost? Jak je to s daněmi?', 'Příjem z krátkodobého pronájmu se daní jako příjem ze samostatné činnosti nebo z pronájmu podle vaší situace; živnost u pronájmu bytu obvykle není nutná, ale doporučíme vám, s kým to probrat. Podklady z portálu k přiznání stačí. Městský poplatek a evidenci hostů řešíme my.'], ['Jak rychle začneme?', 'Po prohlídce a podpisu smlouvy obvykle 2 až 3 týdny: fotky, inzeráty, schránka na klíče, textil. U zařízeného bytu to může být i rychleji.'], ['Jak je to s výpovědí?', 'Smlouva na dobu neurčitou s výpovědní dobou 2 měsíce, vždy dokončíme už potvrzené pobyty. Prvních 90 dní je zkušebních, pokud nejste spokojeni, končíme bez sankcí.'], ['Proč zrovna vy?', 'Nejsme agentura, která má byty jen v tabulce. Část bytů je našich vlastních, takže každý problém řešíme, jako by šlo o náš byt. Hosté nám dali přes 1 200 recenzí s hodnocením 4,9+ a jsme Superhostitel na Airbnb.']],
    en: [['How much will my flat earn?', 'It depends on location, size, equipment and season. We do not guess: the estimate is based on the occupancy and prices of our own flats in the same district over the last 12 months. We send specific numbers for your flat within 24 hours of your inquiry.'], ['When and how do I get paid?', 'Airbnb and Booking payouts go directly to your account, usually the day after the guest arrives. By the 10th of the next month we send a statement and an invoice for 15 %. Direct bookings from this website are settled in the same statement.'], ['Can I stay in the flat or lend it to family?', 'Yes, it is your flat. Block the dates in the portal or by message, ideally 30 days ahead. Confirmed guest bookings are honoured.'], ['What if a guest breaks something?', 'We settle damage with the guest and through platform protection (Airbnb AirCover, Booking). Our cleaners inspect the flat after every stay, so we know about any problem right away and you are informed of every case.'], ['Do I need a trade licence? What about taxes?', 'Income from short-term rental is taxed as business or rental income depending on your situation; a trade licence is usually not required for renting out a flat, but we will recommend whom to consult. The portal documents are sufficient for your tax return. We handle the city tax and the guest register.'], ['How fast can we start?', 'After the visit and signing, usually 2 to 3 weeks: photos, listings, key box, linen. A furnished flat can go faster.'], ['What about notice?', 'Open-ended agreement with a 2-month notice period; we always complete confirmed stays. The first 90 days are a trial: if you are not happy, we part without penalties.'], ['Why you?', 'We are not an agency with flats in a spreadsheet. Some of the flats are our own, so we solve every problem as if it were ours. Guests have given us over 1,200 reviews with a 4.9+ rating and we are an Airbnb Superhost.']],
  };
  FAQ.ru = RU.FAQ || FAQ.en; OFAQ.ru = RU.OFAQ || OFAQ.en;
  function renderFaq() { const f = $('#faq'); if (f) f.innerHTML = FAQ[LANG].map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join(''); const o = $('#ofaq'); if (o) o.innerHTML = OFAQ[LANG].map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join(''); }

  /* ---------- detail ---------- */
  let CALM = null, SEL = { od: null, do: null }, LB = { list: [], i: 0 };
  function renderDetail(slug, keep) {
    const b = bySlug(slug); const el = $('#detail'); if (!b) { el.innerHTML = '<p>404</p>'; return; }
    const q = new URLSearchParams((location.hash.split('?')[1] || '')); if (!keep) { SEL = { od: q.get('od'), do: q.get('do') }; CALM = null; }
    const f = b.fotky || [], am = b.vybaveni || [];
    const sub = `<div class="sub"><span>${esc(lok(b))}</span><span>·</span><span>${b.hoste} ${t('guests')}</span><span>·</span><span>${b.loznice} ${t('bedroom')}</span><span>·</span><span>${b.postele} ${b.postele > 1 ? t('beds') : t('bed1')}</span><span>·</span><span>${b.koupelny} ${b.koupelny > 1 ? t('baths') : t('bath')}</span></div>`;
    const badges = `${b.rating_airbnb ? `<a class="chip air" href="${esc(b.airbnb_url)}" target="_blank" rel="noopener" style="text-decoration:none"><span class="star" style="color:inherit">${STAR}</span>${b.rating_airbnb.toFixed(2)} · ${b.recenzi_airbnb} ${t('reviews')} Airbnb</a>` : ''}${b.rating_booking ? `<a class="chip bk" href="${esc(b.booking_url)}" target="_blank" rel="noopener" style="text-decoration:none">${b.rating_booking} / 10 · ${b.recenzi_booking} Booking.com</a>` : ''}<span class="chip gold">−10 % ${t('direct')}</span>${CFG.superhost ? `<span class="chip">${L3('Superhostitel Airbnb', 'Airbnb Superhost', 'Суперхост Airbnb')}</span>` : ''}`;
    const geo = b.geo ? { lat: Math.round(b.geo.lat * 1000) / 1000, lon: Math.round(b.geo.lon * 1000) / 1000 } : null;
    const map = geo ? `<div class="map"><iframe title="${esc(b.nazev)} – ${t('loc')}" src="https://www.google.com/maps?q=${geo.lat},${geo.lon}&z=15&hl=${LANG}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>` : '';
    const revs = revList(b).filter(r => r.txt && r.txt.length >= 40 && r.rating >= 4).slice(0, 4);
    el.innerHTML = `<div class="crumbs"><a href="#/">Byt a host</a><span>›</span><a href="#/#apartmany">${t('back')}</a><span>›</span><span>${esc(b.nazev)}</span></div>
      <div class="head"><div><h2>${esc(b.nazev)}</h2>${sub}</div><div class="badges">${badges}</div></div>
      <div class="gal"><div style="background-image:url('${esc(f[0] || '')}')" data-lb="0"></div><div style="background-image:url('${esc(f[1] || '')}')" data-lb="1"></div><div style="background-image:url('${esc(f[2] || '')}')" data-lb="2"></div><div style="background-image:url('${esc(f[3] || '')}')" data-lb="3"></div><div style="background-image:url('${esc(f[4] || '')}')" data-lb="4"></div><button class="btn ghost sm all" data-lb="0">${t('allph')} (${f.length})</button></div>
      <div class="galm">${f.map((p, i) => `<img src="${esc(p)}" alt="" data-lb="${i}" ${i ? 'loading="lazy"' : ''}>`).join('')}</div>
      <div class="cols"><div>
        <div class="facts"><span class="chip"><svg class="ico"><use href="#i-users"/></svg>${b.hoste} ${t('guests')}</span><span class="chip"><svg class="ico"><use href="#i-bed"/></svg>${b.loznice} ${t('bedroom')} · ${b.postele} ${b.postele > 1 ? t('beds') : t('bed1')}</span><span class="chip"><svg class="ico"><use href="#i-bath"/></svg>${b.koupelny} ${b.koupelny > 1 ? t('baths') : t('bath')}</span>${b.typ ? `<span class="chip">${esc(b.typ)}</span>` : ''}<span class="chip"><svg class="ico"><use href="#i-key"/></svg>${t('selfci')}</span></div>
        <h3>${t('about')}</h3><p class="body">${esc(popis(b))}</p>
        <h3>${t('amen')}</h3><ul class="amen">${am.map(a => `<li><i><svg class="ico"><use href="#i-check"/></svg></i>${esc(a)}</li>`).join('')}</ul>
        <h3>${t('loc')}</h3><p class="body">${t('locp')}</p>${map}
        <h3>${t('rules')}</h3><p class="body">${esc(t('self').replace('{ci}', b.checkin || '2:00 PM'))}${b.pet_kc ? ` ${t('pet')}: ${kc(b.pet_kc)}.` : ''}</p>
        <h3>${t('avail')}</h3><p class="body">${t('calp')}</p><div id="calwrap"></div><div class="legend"><span><i class="a"></i>${t('avail2')}</span><span><i class="b"></i>${t('booked')}</span><span><i class="c"></i>${t('yours')}</span></div>
        ${revs.length ? `<h3>${t('revh')}</h3><div style="display:grid;gap:12px">${revs.map(r => `<article class="rev" style="flex:none"><div class="top"><span class="chip air">Airbnb</span>${stars(r.rating)}</div><p>${esc(r.txt)}</p>${who({ ...r, byt: null })}</article>`).join('')}</div>` : ''}
      </div>
      <aside class="book" id="book"></aside></div>`;
    $$('[data-lb]', el).forEach(x => x.onclick = () => openLb(f, +x.dataset.lb));
    renderCal(b); renderBook(b);
  }
  function renderCal(b) {
    const w = $('#calwrap'); if (!w) return;
    if (!CALM) { const d0 = SEL.od || today; CALM = d0.slice(0, 7); }
    const [y, m] = CALM.split('-').map(Number);
    const month = (yy, mm) => { const first = new Date(yy, mm - 1, 1), pad = (first.getDay() + 6) % 7, days = new Date(yy, mm, 0).getDate(); let h = `<div class="m"><h4>${t('mon')[mm - 1]} ${yy}</h4><div class="wk">${t('wk').map(x => `<span>${x}</span>`).join('')}</div><div class="d num">`; for (let i = 0; i < pad; i++) h += '<div class="pad"></div>'; for (let d = 1; d <= days; d++) { const ds = `${yy}-${String(mm).padStart(2, '0')}-${String(d).padStart(2, '0')}`; const c = b.ceny[ds]; const off = ds < today || !c || !c[1]; const sel = ds === SEL.od || ds === SEL.do, inn = SEL.od && SEL.do && ds > SEL.od && ds < SEL.do; h += `<div class="${off ? 'off' : ''} ${sel ? 'sel' : ''} ${inn ? 'in' : ''}" data-d="${ds}" ${off ? '' : 'role="button" tabindex="0"'}>${d}${c && !off ? `<small>${Math.round(c[0] / 100) / 10}k</small>` : ''}</div>`; } return h + '</div></div>'; };
    const m2 = m === 12 ? [y + 1, 1] : [y, m + 1];
    w.innerHTML = `<div class="calnav"><button id="cal-prev" aria-label="Předchozí měsíc"><svg class="ico"><use href="#i-left"/></svg></button><span>${t('pernight')}</span><button id="cal-next" aria-label="Další měsíc"><svg class="ico"><use href="#i-right"/></svg></button></div><div class="cal">${month(y, m)}${month(m2[0], m2[1])}</div>`;
    $('#cal-prev').onclick = () => { const p = m === 1 ? [y - 1, 12] : [y, m - 1]; CALM = `${p[0]}-${String(p[1]).padStart(2, '0')}`; renderCal(b); };
    $('#cal-next').onclick = () => { CALM = `${m2[0]}-${String(m2[1]).padStart(2, '0')}`; renderCal(b); };
    const pickDay = ds => { if (!SEL.od || (SEL.od && SEL.do) || ds <= SEL.od) SEL = { od: ds, do: null }; else { const ok = nociList(SEL.od, ds).every(d => b.ceny[d] && b.ceny[d][1]); SEL = ok ? { od: SEL.od, do: ds } : { od: ds, do: null }; } renderCal(b); renderBook(b); };
    $$('.cal .d div[data-d]:not(.off)', w).forEach(x => { x.onclick = () => pickDay(x.dataset.d); x.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pickDay(x.dataset.d); } }; });
  }
  function renderBook(b) {
    const a = $('#book'); if (!a) return;
    const alt = `<div class="or">${t('or')}</div><div class="alt"><a class="btn air" href="${esc(b.airbnb_url)}" target="_blank" rel="noopener">Airbnb</a><a class="btn bk" href="${esc(b.booking_url)}" target="_blank" rel="noopener">Booking.com</a></div>`;
    if (b.bez_rezervace) { a.innerHTML = `<div class="hd"><b style="font-size:22px">${t('closed')}</b></div>${alt}`; return; }
    const dosp = +(a.dataset.dosp || 2), deti = +(a.dataset.deti || 0);
    const k = SEL.od && SEL.do ? kalkul(b, SEL.od, SEL.do, dosp, deti) : { err: 'pick' };
    const opts = (n, s) => Array.from({ length: n + 1 }, (_, i) => `<option value="${i}" ${i === s ? 'selected' : ''}>${i}</option>`).join('');
    a.innerHTML = `<div class="hd"><div><b>${b.od_kc ? t('from') + ' ' + kc(b.od_kc) : ''}</b></div><small>${b.od_kc ? `<s>Airbnb ${kc(airKc(b))}</s><br>` : ''}/ ${t('night')} · ${t('direct')} · −10 %</small></div>
      <div class="dates"><div><label for="b-od">${t('checkin')}</label><input type="date" id="b-od" min="${today}" value="${SEL.od || ''}"></div><div><label for="b-do">${t('checkout')}</label><input type="date" id="b-do" min="${SEL.od ? addD(SEL.od, 1) : today}" value="${SEL.do || ''}"></div></div>
      <div class="g"><div><label for="b-dosp">${t('adults')}</label><select id="b-dosp">${opts(b.hoste, dosp).replace('value="0"', 'value="0" disabled')}</select></div><div><label for="b-deti">${t('kids')}</label><select id="b-deti">${opts(Math.max(0, b.hoste - 1), deti)}</select></div></div>
      <div class="sum num">${k.err ? `<div style="color:var(--mut)">${k.err === 'minn' ? t('minn').replace('{n}', k.n) : t(k.err)}</div>` : `<div><span>${k.noci} ${k.noci === 1 ? t('nightsx') : t('nights')} × Ø ${kc(k.prum)}</span><span>${kc(k.ubyt)}</span></div><div><span>${t('cleaning')}</span><span>${kc(k.uklid)}</span></div><div><span>${t('tax')} <small style="color:var(--mut)">(${t('taxp')})</small></span><span>${kc(k.tax)}</span></div><div class="tot"><span>${t('total')}</span><span>${kc(k.celkem)}</span></div>`}</div>
      <form id="b-form" class="form" style="grid-template-columns:1fr;gap:10px;margin-top:14px"><div><label for="b-jmeno">${t('name')}</label><input id="b-jmeno" name="jmeno" required autocomplete="name"></div><div><label for="b-email">${t('email')}</label><input id="b-email" name="email" type="email" required autocomplete="email"></div><div><label for="b-tel">${t('phone')}</label><input id="b-tel" name="telefon" autocomplete="tel"></div><div><label for="b-zprava">${t('note')}</label><textarea id="b-zprava" name="zprava" style="min-height:70px"></textarea></div>
      <button class="btn gold xl" type="submit" ${k.err ? 'disabled' : ''} style="justify-content:center;width:100%">${t('send')}</button><div id="b-msg"></div></form>
      <div class="note">${t('bookp')}</div>${alt}`;
    dateHints();
    $('#b-od').onchange = e => { SEL = { od: e.target.value, do: SEL.do && SEL.do > e.target.value ? SEL.do : null }; CALM = SEL.od.slice(0, 7); renderCal(b); renderBook(b); };
    $('#b-do').onchange = e => { SEL.do = e.target.value; renderCal(b); renderBook(b); };
    $('#b-dosp').onchange = e => { a.dataset.dosp = e.target.value; renderBook(b); }; $('#b-deti').onchange = e => { a.dataset.deti = e.target.value; renderBook(b); };
    $('#b-form').onsubmit = async e => {
      e.preventDefault(); const fd = new FormData(e.target), btn = e.target.querySelector('button'), msg = $('#b-msg'); btn.disabled = true; btn.textContent = t('sending');
      const row = { byt_key: b.key, byt_nazev: b.nazev, od: SEL.od, do_: SEL.do, noci: k.noci, hoste: dosp + deti, dospeli: dosp, cena_noci_kc: k.ubyt, uklid_kc: k.uklid, mesto_kc: k.tax, celkem_kc: k.celkem, jmeno: fd.get('jmeno'), email: fd.get('email'), telefon: fd.get('telefon'), zprava: fd.get('zprava'), jazyk: LANG, zdroj: 'web' };
      const ok = await sb('web_rezervace', row);
      msg.innerHTML = `<div class="msg ${ok ? 'ok' : 'bad'}">${t(ok ? 'ok' : 'err')}</div>`; if (ok) e.target.reset(); btn.disabled = false; btn.textContent = t('send');
    };
  }
  window.BH = { sb: (t, r) => sb(t, r) };
  async function sb(table, row) {
    if (!CFG.sb_url) return false;
    try { const r = await fetch(CFG.sb_url + '/rest/v1/' + table, { method: 'POST', headers: { apikey: CFG.sb_key, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify(row) }); return r.status < 300; } catch (e) { return false; }
  }

  /* ---------- lightbox ---------- */
  function openLb(list, i) { LB = { list, i }; $('#lb-img').src = list[i]; $('#lb').classList.add('on'); }
  const lbGo = d => { LB.i = (LB.i + d + LB.list.length) % LB.list.length; $('#lb-img').src = LB.list[LB.i]; };
  $('#lb-x').onclick = () => $('#lb').classList.remove('on'); $('#lb-p').onclick = () => lbGo(-1); $('#lb-n').onclick = () => lbGo(1); $('#lb').onclick = e => { if (e.target.id === 'lb') $('#lb').classList.remove('on'); };
  document.addEventListener('keydown', e => { if (!$('#lb').classList.contains('on')) return; if (e.key === 'Escape') $('#lb').classList.remove('on'); if (e.key === 'ArrowLeft') lbGo(-1); if (e.key === 'ArrowRight') lbGo(1); });

  /* ---------- owners page ---------- */
  const SLUZBY = {
    cs: [['Inzeráty, které prodávají', 'Profesionální fotky, texty v pěti jazycích, správně nastavené Airbnb i Booking. Inzerát ladíme podle toho, co hosté hledají.'], ['Ceny podle poptávky, denně', 'Sezóna, den v týdnu, obsazenost okolí, délka pobytu. Ceny hlídáme každý den a držíme paritu mezi platformami.'], ['Přímé rezervace přes náš web', 'Hosté rezervují i přímo zde, bez provize platforem. Z každé takové rezervace zůstane víc vám i nám.'], ['Hosté 7 dní v týdnu', 'Zprávy a recenze v jazyce hosta, příjezdy, speciální přání i reklamace. Samoobslužný check-in přes schránku na klíče.'], ['Úklid, prádlo, drogerie', 'Vlastní úklidový tým s kontrolou po každém pobytu, výměna prádla a ručníků, doplnění drogerie a kávy. Úklid platí host.'], ['Údržba bez přirážky', 'Drobné opravy řešíme sami, větší přes ověřené řemeslníky za jejich ceny. Pravidelně kontrolujeme stav bytu a vybavení.'], ['Městský poplatek a evidence', 'Poplatek z pobytu vybíráme od hostů a odvádíme za vás. Vedeme evidenci ubytovaných a připravíme podklady pro úřady.'], ['Vyúčtování a portál', 'Měsíční vyúčtování do 10. dne s rezervacemi, úklidy a poplatky. Obsazenost a peníze vidíte kdykoli v portálu majitele.']],
    en: [['Listings that sell', 'Professional photos, texts in five languages, Airbnb and Booking set up properly. We tune the listing to what guests search for.'], ['Prices by demand, daily', 'Season, weekday, neighbourhood occupancy, length of stay. We check prices every day and keep parity across platforms.'], ['Direct bookings via our website', 'Guests also book right here, with no platform commission. More of every such booking stays with you and us.'], ['Guests 7 days a week', 'Messages and reviews in the guest\'s language, arrivals, special wishes and complaints. Self check-in via key box.'], ['Cleaning, linen, toiletries', 'Our own cleaning team with inspection after every stay, fresh linen and towels, toiletries and coffee refilled. Cleaning is paid by the guest.'], ['Maintenance at cost', 'Small repairs by us, bigger ones through vetted tradesmen at their prices. Regular checks of the flat and equipment.'], ['City tax and guest register', 'We collect the tourist tax from guests and remit it for you. We keep the guest register and prepare documents for the authorities.'], ['Statements and portal', 'Monthly statement by the 10th with bookings, cleanings and fees. Occupancy and money visible any time in the owner portal.']],
  };
  const PRAVIDLA = {
    cs: `<h3>Odměna</h3><ul><li><b>15 % z příjmu</b>, který vám z Airbnb a Booking.com přijde po odečtení jejich provizí. Z přímých rezervací přes tento web stejných 15 %.</li><li>Žádné zřizovací ani měsíční paušály. Fakturujeme jednou měsíčně na základě vyúčtování.</li><li>Úklid hradí host jako součást ceny pobytu podle našeho ceníku; majiteli se neúčtuje.</li></ul>
    <h3>Peníze a vyúčtování</h3><ul><li>Výplaty z platforem chodí na váš účet. Vyúčtování s naší fakturou posíláme do 10. dne následujícího měsíce.</li><li>Městský poplatek z pobytu (50 Kč/osoba/noc) vybíráme od hostů a odvádíme za vás městské části; podklady pro hlášení připravíme.</li><li>Portál majitele: obsazenost, rezervace, úklidy, poplatky a vyúčtování online, zabezpečeno PINem.</li></ul>
    <h3>Co zajišťuje majitel</h3><ul><li>Byt ve stavu k pronájmu, pojištění domácnosti a odpovědnosti, energie, internet a případné poplatky SVJ.</li><li>Registraci ubytovatele u městské části a souhlas s krátkodobým pronájmem tam, kde ho stanovy vyžadují. Pomůžeme s vyřízením.</li><li>Počáteční vybavení podle našeho seznamu (dvě sady prádla na lůžko, základní kuchyně, schránka na klíče). Nakupujeme za vás bez přirážky.</li></ul>
    <h3>Provoz</h3><ul><li>Drobné opravy a nákupy do 2 000 Kč řešíme bez schvalování a vyúčtujeme; vyšší výdaje vždy předem odsouhlasíme.</li><li>Vlastní pobyty: termíny si blokujete v portálu nebo zprávou, ideálně 30 dní předem; potvrzené rezervace hostů se respektují.</li><li>Škody způsobené hosty řešíme přes ochranu platforem (AirCover, Booking) a s hostem; o každém případu vás informujeme.</li></ul>
    <h3>Smlouva</h3><ul><li>Smlouva o správě na dobu neurčitou s výpovědní dobou 2 měsíce, vždy s dokončením již potvrzených pobytů.</li><li>Prvních 90 dní je zkušebních: pokud se obsazenost nebo spolupráce nelíbí, končíme bez sankcí.</li><li>Daňové přiznání z příjmu zůstává na majiteli; podklady z portálu k němu stačí.</li></ul><p style="font-size:12px;color:var(--mut)">Verze 1 · 12. 10. 2026. Konkrétní znění smlouvy obdržíte před podpisem.</p>`,
    en: `<h3>Fee</h3><ul><li><b>15 % of the income</b> you receive from Airbnb and Booking.com after their commissions. The same 15 % on direct bookings via this website.</li><li>No setup or monthly flat fees. We invoice once a month based on the statement.</li><li>Cleaning is paid by the guest as part of the stay price per our price list; the owner is not charged.</li></ul>
    <h3>Money and statements</h3><ul><li>Platform payouts go to your account. We send the statement with our invoice by the 10th of the following month.</li><li>City tax (50 CZK/person/night) is collected from guests and remitted on your behalf; we prepare the filing documents.</li><li>Owner portal: occupancy, bookings, cleanings, fees and statements online, PIN-protected.</li></ul>
    <h3>What the owner provides</h3><ul><li>A flat ready to rent, household and liability insurance, utilities, internet and any building fees.</li><li>Registration as an accommodation provider with the district and building consent where required. We help with the paperwork.</li><li>Initial equipment per our checklist (two linen sets per bed, basic kitchen, key box). We buy on your behalf at cost.</li></ul>
    <h3>Operations</h3><ul><li>Small repairs and purchases up to 2,000 CZK handled without approval and re-invoiced; larger costs always approved in advance.</li><li>Own stays: block dates in the portal or by message, ideally 30 days ahead; confirmed guest bookings are honoured.</li><li>Guest damage is handled via platform protection (AirCover, Booking) and with the guest; we inform you of every case.</li></ul>
    <h3>Contract</h3><ul><li>Open-ended management agreement with a 2-month notice period, always completing already confirmed stays.</li><li>The first 90 days are a trial: if occupancy or the cooperation does not suit you, we part without penalties.</li><li>Income tax filing stays with the owner; the portal documents are sufficient for it.</li></ul><p style="font-size:12px;color:var(--mut)">Version 1 · 12 Oct 2026. The exact contract wording is provided before signing.</p>`,
  };
  SLUZBY.ru = RU.SLUZBY || SLUZBY.en; PRAVIDLA.ru = RU.PRAVIDLA || PRAVIDLA.en;
  function renderOwnerBlocks() {
    const ICONS = ['i-spark', 'i-tag', 'i-card', 'i-chat', 'i-broom', 'i-wrench', 'i-shield', 'i-doc']; const g = $('#o-sluzby'); if (g) { g.innerHTML = SLUZBY[LANG].map(([h, p], i) => `<div class="rv d${i % 3}"><div class="ic"><svg class="ico" style="width:22px;height:22px"><use href="#${ICONS[i]}"/></svg></div><h3>${esc(h)}</h3><p>${esc(p)}</p></div>`).join(''); watchRv(g); }
    const r = $('#o-pravidla'); if (r) r.innerHTML = PRAVIDLA[LANG];
    renderOdhad();
  }
  /* odhad vydelku pro majitele (18.10.2026): dispozice dava rozpeti, POLOHA NA MAPE (zony kolem Staromestskeho namesti) a vybaveni posunuji v nem.
     Zony: S = cerveny kruh 1,3 km (srdce Prahy), A = fialovy oval 3,8 × 2,3 km (sirsi centrum), B = zlaty oval 5,8 × 3,8 km (dobra dostupnost), mimo = C. */
  const EST = { disp: '2kk', f: {}, bod: { lat: 50.0755, lon: 14.4378 }, adresa: 'náměstí Míru' };
  const EST_RNG = { '1kk': [30000, 50000], '2kk': [40000, 60000], '3kk': [50000, 70000], '4kk': [60000, 100000] };
  const EST_LVL = { cs: ['Dobré', 'Velmi dobré', 'Skvělé', 'Excelentní'], en: ['Good', 'Very good', 'Great', 'Excellent'], ru: ['Хорошо', 'Очень хорошо', 'Отлично', 'Превосходно'] };
  const EST_BYT = [['balkon', 'Balkon nebo terasa', 'Balcony or terrace', 3, 5], ['park', 'Parkování', 'Parking', 5, 7], ['klima', 'Klimatizace', 'Air conditioning', 2, 3], ['vytah', 'Výtah', 'Lift', 1, 2], ['novy', 'Po rekonstrukci, nově zařízený', 'Renovated, newly furnished', 3, 5]];
  const ESTRU = { balkon: 'Балкон или терраса', park: 'Парковка', klima: 'Кондиционер', vytah: 'Лифт', novy: 'После ремонта, новая мебель' };
  const BONUS_MAX = EST_BYT.reduce((s, x) => s + x[4], 0) * 1000;
  const STARE_MESTO = [50.08753, 14.42132], OVAL_STRED = [50.0828, 14.4265];
  const ZONY = [   // od nejlepsi; km = poloosy (vychod-zapad, sever-jih)
    { z: 'S', lvl: 3, stred: STARE_MESTO, a: 1.3, b: 1.3, barva: '#e5484d', cs: 'S · srdce Prahy', en: 'S · heart of Prague', ru: 'S · сердце Праги' },
    { z: 'A', lvl: 2, stred: OVAL_STRED, a: 3.8, b: 2.3, barva: '#8b5cf6', cs: 'A · širší centrum', en: 'A · wider centre', ru: 'A · расширенный центр' },
    { z: 'B', lvl: 1, stred: OVAL_STRED, a: 5.8, b: 3.8, barva: '#c9a227', cs: 'B · dobrá dostupnost', en: 'B · good access', ru: 'B · хорошая доступность' },
  ];
  const kmXY = (bod, stred) => [(bod.lon - stred[1]) * 111.32 * Math.cos(stred[0] * Math.PI / 180), (bod.lat - stred[0]) * 110.57];
  function estZona() { for (const z of ZONY) { const [x, y] = kmXY(EST.bod, z.stred); if ((x / z.a) ** 2 + (y / z.b) ** 2 <= 1) return z; } return { z: 'C', lvl: 0, cs: 'C · mimo centrum', en: 'C · outside the centre', ru: 'C · за центром' }; }
  const estLevel = () => estZona().lvl;
  function ovalBody(z) { const out = [], k = Math.cos(z.stred[0] * Math.PI / 180); for (let i = 0; i <= 72; i++) { const t = i / 72 * 2 * Math.PI; out.push([z.stred[0] + z.b * Math.sin(t) / 110.57, z.stred[1] + z.a * Math.cos(t) / (111.32 * k)]); } return out; }
  let LF = null, MAPA = null, MARK = null;
  function nactiLeaflet() {
    if (LF) return LF;
    LF = new Promise((ok, err) => {
      const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'; document.head.appendChild(css);
      const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'; s.onload = () => ok(window.L); s.onerror = err; document.head.appendChild(s);
    });
    return LF;
  }
  function mapaDo(el) {
    if (MAPA) { el.appendChild(MAPA.getContainer()); setTimeout(() => MAPA.invalidateSize(), 50); return; }
    const div = document.createElement('div'); div.className = 'mapa'; div.setAttribute('aria-label', 'Mapa: klepněte, kde je byt'); el.appendChild(div);
    nactiLeaflet().then(L => {
      MAPA = L.map(div, { scrollWheelZoom: false, zoomControl: true }).setView([50.083, 14.43], 12);   // vyrez se doladi po zobrazeni (vyrez())
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', { maxZoom: 16, attribution: 'Tiles © Esri — Esri, HERE, Garmin, © OpenStreetMap' }).addTo(MAPA);
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', { maxZoom: 16, pane: 'shadowPane' }).addTo(MAPA);   // popisky nad zonami
      // mapa se muze vytvorit na skryte strance -> po zobrazeni prepocitat velikost a ukazat celou zonu B
      let hnuto = false; MAPA.on('dragstart zoomstart', () => { hnuto = true; });
      const vyrez = () => { if (!div.clientWidth || !div.clientHeight) return; MAPA.invalidateSize(); if (!hnuto) MAPA.fitBounds(L.latLngBounds(ovalBody(ZONY[2])), { padding: [8, 8] }); };
      try { new ResizeObserver(() => vyrez()).observe(div); } catch (e) {} setTimeout(vyrez, 300);
      for (const z of ZONY.slice().reverse()) {
        const tvar = z.z === 'S' ? L.circle(z.stred, { radius: z.a * 1000 }) : L.polygon(ovalBody(z));
        tvar.options.interactive = false; tvar.setStyle({ color: z.barva, weight: z.z === 'B' ? 2 : 3, dashArray: z.z === 'B' ? '6 6' : null, fillColor: z.barva, fillOpacity: z.z === 'S' ? .10 : .05 }).addTo(MAPA);
      }
      L.marker(STARE_MESTO, { interactive: false, icon: L.divIcon({ className: 'est-sm', html: '<span></span>', iconSize: [8, 8], iconAnchor: [4, 4] }) }).addTo(MAPA);
      const ikona = L.divIcon({ className: 'est-pin', html: '<span></span>', iconSize: [18, 18], iconAnchor: [9, 9] });
      MARK = L.marker([EST.bod.lat, EST.bod.lon], { draggable: true, icon: ikona, keyboard: true, title: 'Váš byt' }).addTo(MAPA);
      const nastav = ll => { EST.bod = { lat: ll.lat, lon: ll.lng }; EST.adresa = ''; MARK.setLatLng(ll); spocitejOdhad(); };
      MAPA.on('click', e => nastav(e.latlng)); MARK.on('dragend', () => nastav(MARK.getLatLng()));
    }).catch(() => { div.innerHTML = '<p style="padding:14px;font-size:13px">Mapu se nepodařilo načíst.</p>'; });
  }
  /* naseptavac adres: Photon (komoot, OpenStreetMap) — urceny pro psani za behu; jen Praha */
  let NAV = [];
  async function navrhy(q) {
    try {
      const r = await (await fetch('https://photon.komoot.io/api/?' + new URLSearchParams(Object.assign({ q, limit: 8, bbox: '14.22,49.94,14.71,50.18' }, LANG === 'en' ? { lang: 'en' } : {})))).json();
      NAV = (r.features || []).map(f => { const p = f.properties; const ul = [p.street || p.name, p.housenumber].filter(Boolean).join(' '); return { t: ul || p.name, d: [p.district || p.locality, p.city || 'Praha'].filter(Boolean).join(', '), lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0] }; }).filter(x => x.t).filter((x, i, a) => a.findIndex(y => y.t === x.t && y.d === x.d) === i).slice(0, 6);
      const ul = $('#est-nav'), inp = $('#est-adr'); if (!ul) return;
      ul.innerHTML = NAV.map((x, i) => `<li role="option" data-i="${i}"><b>${esc(x.t)}</b><small>${esc(x.d)}</small></li>`).join('');
      ul.hidden = !NAV.length; inp.setAttribute('aria-expanded', String(!!NAV.length));
      [...ul.children].forEach(li => li.onmousedown = e => { e.preventDefault(); vyberNavrh(NAV[+li.dataset.i]); });
    } catch (e) { }
  }
  function vyberNavrh(x) {
    EST.bod = { lat: x.lat, lon: x.lon }; EST.adresa = x.t; const inp = $('#est-adr'); if (inp) inp.value = x.t; const ul = $('#est-nav'); if (ul) ul.hidden = true;
    if (MARK) { MARK.setLatLng([x.lat, x.lon]); MAPA.setView([x.lat, x.lon], 14); } spocitejOdhad();
  }
  async function hledejAdresu(q) {
    if (!q.trim()) return; const m = $('#est-zinfo'); if (m) m.textContent = L3('Hledám…', 'Searching…', 'Ищу…');
    try {
      const r = await (await fetch('https://nominatim.openstreetmap.org/search?' + new URLSearchParams({ format: 'json', q: q + ', Praha', viewbox: '14.22,50.18,14.71,49.94', bounded: 1, limit: 1, 'accept-language': LANG }))).json();
      if (!r[0]) { if (m) m.textContent = L3('Adresu jsem nenašel — klepněte do mapy.', 'Address not found — tap the map instead.', 'Адрес не найден — нажмите на карту.'); return; }
      EST.bod = { lat: +r[0].lat, lon: +r[0].lon }; EST.adresa = q;
      if (MARK) { MARK.setLatLng([EST.bod.lat, EST.bod.lon]); MAPA.setView([EST.bod.lat, EST.bod.lon], 13); }
      spocitejOdhad();
    } catch (e) { if (m) m.textContent = L3('Hledání selhalo — klepněte do mapy.', 'Search failed — tap the map.', 'Поиск не удался — нажмите на карту.'); }
  }
  function renderOdhad() {
    const box = $('#est'); if (!box) return; const en = LANG === 'en';
    const chk = (k, cs, enT, full, lo, hi) => `<label${full ? ' class="full"' : ''}><input type="checkbox" data-f="${k}"${EST.f[k] ? ' checked' : ''}><span>${esc(L3(cs, enT, ESTRU[k] || enT))} <small class="bon">+${lo}–${hi} ${L3('tis.', 'k', 'тыс.')}</small></span></label>`;
    if (MAPA) MAPA.getContainer().remove();   // mapa se pri prekresleni neniči, jen se prenese
    box.innerHTML = `<span class="lab">${L3('Dispozice', 'Layout', 'Планировка')}</span>
      <div class="seg" id="est-disp">${Object.keys(EST_RNG).map(k => `<button type="button" data-v="${k}" class="${EST.disp === k ? 'on' : ''}" aria-pressed="${EST.disp === k}">${k[0]}+kk</button>`).join('')}</div>
      <span class="lab">${L3('Kde je byt? Klepněte do mapy nebo vyhledejte', 'Where is the flat? Tap the map or search', 'Где квартира? Нажмите на карту или найдите адрес')}</span>
      <form class="hledej" id="est-hledej"><div class="ac"><input id="est-adr" placeholder="${L3('začněte psát, např. Vinohradská 12', 'e.g. Vinohradská 12', 'например, Vinohradská 12')}" value="${esc(EST.adresa)}" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="est-nav"><ul id="est-nav" role="listbox" hidden></ul></div><button type="submit">${L3('Najít', 'Find', 'Найти')}</button></form>
      <div id="est-mapa"></div>
      <div class="zony">${ZONY.map(z => `<span><i style="border-color:${z.barva};background:${z.barva}22"></i>${esc(L3(z.cs, z.en, z.ru))}</span>`).join('')}<span><i style="border-color:#9aa5a0"></i>${L3('C · mimo centrum', 'C · outside', 'C · за центром')}</span></div>
      <div class="zinfo" id="est-zinfo"></div>
      <span class="lab">${L3('Byt má', 'The flat has', 'В квартире есть')}</span>
      <div class="checks">${EST_BYT.map(([k, c, e, lo, hi], i) => chk(k, c, e, i === 4, lo, hi)).join('')}</div>
      <div class="score"><span>${L3('Skóre lokality pro pronájem', 'Rental location score', 'Оценка локации для аренды')} <b id="est-lvl"></b></span><span class="meter" id="est-meter"><i></i><i></i><i></i><i></i></span></div>
      <div class="row"><div><span class="lab" style="margin:0">${L3('Odhad příjmu měsíčně', 'Estimated income / month', 'Ожидаемый доход в месяц')}</span><output id="est-gross" class="num"></output></div><div><span class="lab" style="margin:0">${L3('Zůstane vám po 15 %', 'You keep after 15 %', 'Вам остаётся после 15 %')}</span><output id="est-net" class="num" style="color:var(--ok)"></output></div></div>
      <div class="bar"><i id="est-bar"></i></div><div class="barl"><span id="est-min"></span><span id="est-rl"></span><span id="est-max"></span></div>
      <p class="cmp" id="calc-cmp"></p>`;
    mapaDo($('#est-mapa'));
    $$('#est-disp button').forEach(b => b.onclick = () => { EST.disp = b.dataset.v; renderOdhad(); });
    $('#est-hledej').onsubmit = e => { e.preventDefault(); const prvni = NAV[0]; if (prvni && !$('#est-nav').hidden) vyberNavrh(prvni); else hledejAdresu($('#est-adr').value); };
    const inp = $('#est-adr'), ul = $('#est-nav'); let tmr = null, akt = -1;
    const zavri = () => { ul.hidden = true; inp.setAttribute('aria-expanded', 'false'); akt = -1; };
    inp.oninput = () => { clearTimeout(tmr); const q = inp.value.trim(); if (q.length < 3) { zavri(); return; } tmr = setTimeout(() => navrhy(q), 280); };
    inp.onkeydown = e => { if (ul.hidden) return; const li = [...ul.children]; if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); akt = (akt + (e.key === 'ArrowDown' ? 1 : -1) + li.length) % li.length; li.forEach((x, i) => x.setAttribute('aria-selected', i === akt)); } else if (e.key === 'Enter' && akt >= 0) { e.preventDefault(); vyberNavrh(NAV[akt]); } else if (e.key === 'Escape') zavri(); };
    inp.onblur = () => setTimeout(zavri, 180);
    $$('#est input[data-f]').forEach(c => c.onchange = () => { EST.f[c.dataset.f] = c.checked; spocitejOdhad(); });
    spocitejOdhad();
  }
  function spocitejOdhad() {
    const en = LANG === 'en', [mn, mx] = EST_RNG[EST.disp], span = mx - mn, z = estZona(), lvl = z.lvl;
    // pasmo v ramci dispozice podle zony (S nahore) + bonusy za vybaveni (scitaji se), zaokrouhleno na tisice
    const PASMO = [[0.05, 0.45], [0.3, 0.7], [0.5, 0.9], [0.7, 1.05]][lvl];
    const bLo = EST_BYT.filter(x => EST.f[x[0]]).reduce((s, x) => s + x[3], 0) * 1000, bHi = EST_BYT.filter(x => EST.f[x[0]]).reduce((s, x) => s + x[4], 0) * 1000;
    const r1000 = x => Math.round(x / 1000) * 1000;
    const lo = r1000(mn + span * PASMO[0] + bLo), hi = r1000(mn + span * PASMO[1] + bHi);
    const tis = x => (x / 1000).toLocaleString('cs-CZ') + L3(' tis.', 'k', ' тыс.');
    const [dx, dy] = kmXY(EST.bod, STARE_MESTO), km = Math.hypot(dx, dy);
    $('#est-lvl').textContent = EST_LVL[LANG][lvl];
    $$('#est-meter i').forEach((i, k) => i.classList.toggle('on', k <= lvl));
    const zi = $('#est-zinfo'); if (zi) zi.innerHTML = (L3('Zóna ', 'Zone ', 'Зона ')) + `<b>${esc(L3(z.cs, z.en, z.ru))}</b> · ${km.toLocaleString('cs-CZ', { maximumFractionDigits: 1 })} km ${L3('od Staroměstského náměstí', 'from Old Town Square', 'от Староместской площади')}${EST.adresa ? ' · ' + esc(EST.adresa) : ''}`;
    $('#est-gross').textContent = `${tis(lo)} – ${tis(hi)}`;
    $('#est-net').textContent = `${tis(r1000(lo * .85))} – ${tis(r1000(hi * .85))}`;
    const top = mx + BONUS_MAX, sp2 = top - mn, bar = $('#est-bar'); bar.style.left = ((lo - mn) / sp2 * 100) + '%'; bar.style.width = Math.max(4, (hi - lo) / sp2 * 100) + '%';
    $('#est-min').textContent = kc(mn); $('#est-max').textContent = kc(top); $('#est-rl').textContent = `${EST.disp[0]}+kk · ${L3('zóna', 'zone', 'зона')} ${z.z}`;
    const mid = (lo + hi) / 2, c = $('#calc-cmp');
    if (c) c.innerHTML = L3(`U správce s 20 % + DPH by vám zůstalo ${kc(mid * .758)}, tedy <b>o ${kc(mid * .092)} měsíčně méně</b>. Za rok ${kc(mid * .092 * 12)}.`, `With a manager charging 20 % + VAT you would keep ${kc(mid * .758)}, that is <b>${kc(mid * .092)} less per month</b>. ${kc(mid * .092 * 12)} a year.`, `При управляющем за 20 % + НДС вам осталось бы ${kc(mid * .758)}, то есть <b>на ${kc(mid * .092)} меньше в месяц</b>. ${kc(mid * .092 * 12)} в год.`);
  }
  function renderPortal() {
    const g = $('#portal-grid'); if (!g) return; const P = CFG.portaly || {};
    const names = { korunni: 'Pražský dům · Korunní, Mezibránská', harfa: 'Harfa O2', havelska: 'Havel Rooftop', florenc: 'Florenc I + II', vlastislavova: 'Vlastislavova' };
    g.innerHTML = Object.entries(P).map(([k, u]) => `<div class="portal-card"><h3>${esc(names[k] || k)}</h3><p style="color:var(--ink-2);font-size:14px">${L3('Vyúčtování, obsazenost, úklidy, poplatek.', 'Statements, occupancy, cleanings, tax.', 'Отчёты, загрузка, уборки, сбор.')}</p><a class="btn sm" href="${u}" target="_blank" rel="noopener">${t('pin')}</a></div>`).join('');
  }
  const PODM = {
    cs: `<h2>Rezervační podmínky</h2><p class="lead">Přímá rezervace u Byt a host (B&H).</p>
    <h3>1. Žádost a potvrzení</h3><ul><li>Odesláním formuláře vzniká nezávazná žádost. Rezervace je potvrzena až naší zprávou s potvrzením termínu a platebními údaji.</li><li>Ceny jsou uvedeny v Kč včetně DPH, za celý apartmán a noc, pro uvedený počet osob. Úklid a městský poplatek jsou vyčísleny zvlášť ve shrnutí.</li></ul>
    <h3>2. Platba</h3><ul><li>Celou částku hradíte do 48 hodin od potvrzení kartou přes zabezpečený platební odkaz nebo bankovním převodem. Neuhrazená rezervace se po této lhůtě uvolní.</li><li>Nevybíráme kauci; škody řešíme individuálně podle skutečných nákladů.</li></ul>
    <h3>3. Zrušení</h3><ul><li>14 a více dní před příjezdem: vracíme 100 %.</li><li>7 až 13 dní před příjezdem: vracíme 50 %.</li><li>Méně než 7 dní před příjezdem nebo nedostavení: bez náhrady. Změnu termínu umožníme podle dostupnosti.</li></ul>
    <h3>4. Pobyt</h3><ul><li>Příjezd od 14:00 (u vybraných bytů od 16:00), odjezd do 11:00. Samoobslužné předání klíčů přes schránku; pokyny posíláme den před příjezdem.</li><li>Maximální počet osob je uveden u každého bytu. Byty jsou nekuřácké, večírky nejsou povoleny. Domácí zvířata jen po dohodě a za uvedený poplatek.</li><li>Městský poplatek z pobytu hl. m. Prahy 50 Kč za osobu starší 18 let a noc vybíráme jménem obce.</li></ul>
    <h3>5. Osobní údaje</h3><ul><li>Údaje z formulářů používáme výhradně k vyřízení rezervace nebo poptávky a k zákonné evidenci ubytovaných. Neposíláme newslettery, nepředáváme třetím stranám mimo platební bránu a zákonné povinnosti.</li></ul>
    <p style="font-size:12px;color:var(--mut)">Provozovatel: Byt a host (B&H), Praha. Platí od 12. 10. 2026.</p>`,
    en: `<h2>Booking terms</h2><p class="lead">Direct booking with Byt a host (B&H).</p>
    <h3>1. Request and confirmation</h3><ul><li>Sending the form creates a non-binding request. The booking is confirmed only by our message confirming the dates and payment details.</li><li>Prices are in CZK incl. VAT, per apartment and night, for the stated number of guests. Cleaning and city tax are itemised separately in the summary.</li></ul>
    <h3>2. Payment</h3><ul><li>The full amount is due within 48 hours of confirmation by card via a secure payment link or by bank transfer. Unpaid bookings are released after this period.</li><li>We do not take a deposit; damage is settled individually at actual cost.</li></ul>
    <h3>3. Cancellation</h3><ul><li>14 or more days before arrival: 100 % refund.</li><li>7 to 13 days before arrival: 50 % refund.</li><li>Less than 7 days before arrival or no-show: no refund. Date changes are possible subject to availability.</li></ul>
    <h3>4. The stay</h3><ul><li>Check-in from 2 PM (selected apartments from 4 PM), check-out by 11 AM. Self-service key handover via key box; instructions are sent the day before arrival.</li><li>Maximum occupancy is stated for each apartment. Apartments are non-smoking, parties are not allowed. Pets only by agreement and for the stated fee.</li><li>Prague city tax of 50 CZK per person over 18 per night is collected on behalf of the municipality.</li></ul>
    <h3>5. Personal data</h3><ul><li>Form data is used solely to process your booking or inquiry and for the legally required guest register. No newsletters, no sharing with third parties beyond the payment provider and legal obligations.</li></ul>
    <p style="font-size:12px;color:var(--mut)">Operator: Byt a host (B&H), Prague. Valid from 12 Oct 2026.</p>`,
  };
  PODM.ru = PODM.en;
  function renderTerms() { const p = $('#podminky'); if (p) p.innerHTML = PODM[LANG]; }
  function bindForm(id, table, map) {
    const f = $(id); if (!f) return;
    f.onsubmit = async e => { e.preventDefault(); const fd = new FormData(f), btn = f.querySelector('button'), m = $(id + '-msg'); btn.disabled = true; const ok = await sb(table, map(fd)); m.innerHTML = `<div class="msg ${ok ? 'ok' : 'bad'}">${ok ? t(id === '#f-majitel' ? 'sent2' : 'sent') : t('err')}</div>`; if (ok) f.reset(); btn.disabled = false; };
  }
  bindForm('#f-kontakt', 'web_poptavka', fd => ({ jmeno: fd.get('jmeno'), email: fd.get('email'), telefon: fd.get('telefon'), zprava: '[' + fd.get('tema') + '] ' + fd.get('zprava'), jazyk: LANG, stav_bytu: 'kontakt' }));
  bindForm('#f-majitel', 'web_poptavka', fd => ({ jmeno: fd.get('jmeno'), email: fd.get('email') || '', telefon: fd.get('telefon'), adresa: fd.get('adresa') || '', dispozice: fd.get('dispozice') || '', stav_bytu: fd.get('stav_bytu') || 'zavolat', zprava: fd.get('zprava') || 'Prosím o zavolání (rychlý formulář).', jazyk: LANG }));

  /* ---------- portal majitele: login (cislo klienta + heslo) -> desifrovani PIN stranky VELINu primo v prohlizeci ---------- */
  let SESSION = null;
  async function unlockBlob(gate, pwd) {
    const m = gate.match(/const BLOB=(\{[\s\S]*?\});/); if (!m) throw new Error('blob');
    const BLOB = JSON.parse(m[1]); const dec = x => Uint8Array.from(atob(x), ch => ch.charCodeAt(0));
    const km = await crypto.subtle.importKey('raw', new TextEncoder().encode(pwd), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: dec(BLOB.s), iterations: BLOB.it, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: dec(BLOB.iv) }, key, dec(BLOB.ct));
    return new TextDecoder().decode(pt);
  }

  /* ---------- UKAZKA portalu majitele (18.10.2026): smysleny apartman a hoste, zadna realna data ---------- */
  function demoData() {
    const dnes = new Date(), p2 = n => String(n).padStart(2, '0'), iso = d => d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()), mes = d => iso(d).slice(0, 7);   // mistni datum (toISOString posouval o den)
    const JM = ['Anna', 'Lukas', 'Sofia', 'James', 'Marta', 'Oliver', 'Elena', 'Tomas', 'Clara', 'Noah', 'Lea', 'Mateo', 'Ines', 'Jonas', 'Emma', 'Hugo'];
    let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const sezona = m => [0.55, 0.6, 0.75, 0.85, 0.9, 0.92, 0.95, 0.95, 0.9, 0.85, 0.7, 0.8][m];
    const start = new Date(dnes.getFullYear(), dnes.getMonth() - 12, 1), konec = new Date(dnes.getFullYear(), dnes.getMonth() + 3, 0);
    const rez = []; let d = new Date(start), i = 0;
    while (d < konec) {
      const n = 2 + Math.floor(rnd() * 5), od = new Date(d), doo = new Date(d); doo.setDate(doo.getDate() + n);
      const plat = rnd() < 0.55 ? 'booking' : 'airbnb', cena = Math.round((1900 + rnd() * 900) * (1 + (sezona(od.getMonth()) - 0.8)) / 10) * 10;
      rez.push({ plat, kod: plat === 'airbnb' ? 'HM' + Math.floor(rnd() * 1e8).toString(36).toUpperCase() : String(5e9 + Math.floor(rnd() * 1e9)), host: JM[i++ % JM.length], hoste: 1 + Math.floor(rnd() * 3), od: iso(od), do: iso(doo), czk: plat === 'airbnb' ? cena * n : null, _noc: cena });
      d = new Date(doo); if (rnd() > sezona(d.getMonth())) d.setDate(d.getDate() + 1 + Math.floor(rnd() * 3));
    }
    const radky = [];
    for (let k = 0; k < 12; k++) {
      const m0 = new Date(start.getFullYear(), start.getMonth() + k, 1), m = mes(m0), dni = new Date(m0.getFullYear(), m0.getMonth() + 1, 0).getDate();
      const bk = new Set(), ab = new Set(), uk = []; let obrB = 0, obrA = 0, ks = 0;
      for (const r of rez) { for (let x = new Date(r.od); x < new Date(r.do); x.setDate(x.getDate() + 1)) if (mes(x) === m) { (r.plat === 'booking' ? bk : ab).add(x.getDate()); if (r.plat === 'booking') obrB += r._noc * 0.85; else obrA += r._noc * 0.845; }
        if (r.do.slice(0, 7) === m) { ks++; uk.push(+r.do.slice(8, 10)); } }
      const obrat = Math.round(obrB + obrA), provize = Math.round(obrat * 0.15), uklid = ks * 500, prani = ks * 200, noci = bk.size + ab.size;
      radky.push({ mes: m, bk: Math.round(obrB), ab: Math.round(obrA), obrat, sazba: 15, provize, ks, uklid, prani, occ: Math.round(noci / dni * 100), occ_noci: noci, occ_dni: dni, bk_dny: [...bk].sort((a, b) => a - b), ab_dny: [...ab].sort((a, b) => a - b), uklid_dny: uk, extra: [], vyplata: obrat - provize - uklid - prani, bezici: false });
    }
    return { jmeno: L3('Ukázkový majitel', 'Sample owner', 'Пример владельца'), klic: 'ukazka', gen: dnes.toLocaleDateString('cs-CZ'), dnes: iso(dnes), sazby: { uklid: 500, prani: 200 },
      spravce: { nazev: 'Byt a host' }, odberatel: {}, uhrazeno_do: '', naklady_prefill: [], zprava: null,
      byty: [{ key: 'ukazka', nazev: L3('Ukázkový apartmán Vinohrady', 'Sample apartment Vinohrady', 'Пример: апартаменты Винограды'), radky, odkazy: [], img: null, uklidy: [], timeline: [], bench: null, rezervace: rez.map(({ _noc, ...r }) => r) }] };
  }
  function otevriUkazku() {
    if (!window.BH_PORTAL) return; SESSION = null;
    $('#portal-who').textContent = L3('Ukázka · smyšlená data', 'Demo · sample data', 'Демо · примерные данные');
    $('#portal-frame').style.display = 'none'; $('#portal-view').style.display = ''; BH_PORTAL.render(demoData());
    $('#page-portalapp').classList.add('on'); document.body.style.overflow = 'hidden';
  }
  async function login(num, pwd, auto) {
    const err = $('#l-err'); const u = (CFG.ucty || {})[String(num || '').trim()];
    if (!(window.crypto && crypto.subtle)) { if (err) err.innerHTML = L3('Přihlášení funguje jen přes zabezpečené spojení. Otevřete <a href="https://bytahost.cz/#/login">https://bytahost.cz</a>.', 'Sign-in works only over a secure connection. Open <a href="https://bytahost.cz/#/login">https://bytahost.cz</a>.', 'Вход работает только через защищённое соединение. Откройте <a href="https://bytahost.cz/#/login">https://bytahost.cz</a>.'); return false; }
    if (!u || !(CFG.portaly || {})[u.key]) { if (!auto && err) err.textContent = t('lbad'); return false; }
    let gate;
    try { const r = await fetch(CFG.portaly[u.key], { cache: 'no-store' }); if (!r.ok) throw new Error('http'); gate = await r.text(); } catch (e) { if (!auto && err) err.textContent = t('lnet'); return false; }
    try {
      const html = await unlockBlob(gate, pwd);
      SESSION = { num: String(num).trim(), key: u.key };
      if (!auto) { const rem = $('#l-rem'); if (rem && rem.checked) { try { localStorage.setItem('bh_portal', JSON.stringify({ num: SESSION.num, pwd })); } catch (e) {} } }
      const D = window.BH_PORTAL && BH_PORTAL.extractData(html); $('#portal-who').textContent = (D && D.jmeno) || '';
      if (D) { $('#portal-frame').style.display = 'none'; $('#portal-view').style.display = ''; BH_PORTAL.render(D); } else { $('#portal-view').style.display = 'none'; $('#portal-frame').style.display = ''; $('#portal-frame').srcdoc = html; }
      $('#page-portalapp').classList.add('on'); document.body.style.overflow = 'hidden';
      if (err) err.textContent = ''; if (location.hash !== '#/portal') location.hash = '#/portal';
      return true;
    } catch (e) { if (auto) { try { localStorage.removeItem('bh_portal'); } catch (x) {} } else if (err) err.textContent = t('lbad'); return false; }
  }
  function logout() { SESSION = null; try { localStorage.removeItem('bh_portal'); } catch (e) {} $('#portal-frame').srcdoc = ''; $('#portal-view').innerHTML = ''; $('#page-portalapp').classList.remove('on'); document.body.style.overflow = ''; $('#l-pwd').value = ''; location.hash = '#/login'; }
  $('#f-login').onsubmit = async e => { e.preventDefault(); const btn = $('#l-go'); btn.disabled = true; btn.textContent = t('lwait'); await login($('#l-num').value, $('#l-pwd').value, false); btn.disabled = false; btn.textContent = t('lgo'); };
  $('#portal-out').onclick = logout;

  /* ---------- router + header + video ---------- */
  let ROUTE = { page: 'home' };
  function closeNav() { $('#nav').classList.remove('open'); $('#burger').setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
  function route() {
    const h = (location.hash || '#/').slice(1); const [pathQ, anchor] = h.split('#'); const path = pathQ.split('?')[0];
    const pages = { '/': 'home', '/majitele': 'majitele', '/login': 'login', '/portal': 'portal', '/podminky': 'podminky', '/ukazka': 'ukazka' };
    let page = pages[path] || (path.startsWith('/apartman/') ? 'detail' : 'home');
    if (page === 'ukazka') { otevriUkazku(); return; }
    const wantPortal = page === 'portal'; if (wantPortal) page = 'login';
    ROUTE = { page, slug: path.split('/')[2] };
    $$('.page:not(#page-portalapp)').forEach(p => p.classList.toggle('on', p.id === 'page-' + page));
    if (wantPortal) { if (SESSION) { $('#page-portalapp').classList.add('on'); document.body.style.overflow = 'hidden'; } else { let st = null; try { st = JSON.parse(localStorage.getItem('bh_portal') || 'null'); } catch (e) {} if (st && st.num) { $('#l-num').value = st.num; login(st.num, st.pwd, true); } } }
    else { $('#page-portalapp').classList.remove('on'); document.body.style.overflow = ''; }
    $$('.nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + h));
    closeNav();
    if (page === 'detail') renderDetail(ROUTE.slug);
    if (anchor) setTimeout(() => { const el = document.getElementById(anchor); if (el) el.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' }); }, 60); else window.scrollTo({ top: 0 });
    hdr(); watchRv();
  }
  function hdr() { $('#hdr').classList.toggle('solid', ROUTE.page !== 'home' || window.scrollY > 40); }
  window.addEventListener('hashchange', route); window.addEventListener('scroll', hdr, { passive: true });
  $('#burger').onclick = () => { const o = $('#nav').classList.toggle('open'); $('#burger').setAttribute('aria-expanded', String(o)); document.body.style.overflow = o ? 'hidden' : ''; };
  $('#navx').onclick = closeNav; $$('.nav a').forEach(a => a.addEventListener('click', closeNav));
  $$('.lang button').forEach(b => b.onclick = () => { LANG = b.dataset.lang; applyLang(); dateHints(); });
  const v = $('#hv'), vc = $('#vidctl');
  if (REDUCED) { v.pause(); vc.style.display = 'none'; }
  vc.onclick = () => { if (v.paused) { v.play().catch(() => {}); vc.textContent = LANG === 'en' ? EN['hero.pause'] : 'Pozastavit video'; } else { v.pause(); vc.textContent = LANG === 'en' ? EN['hero.play'] : 'Přehrát video'; } };
  $('#rok').textContent = new Date().getFullYear();

  /* ---------- init ---------- */
  function init() { trust(); applyLang(); route(); watchRv(); dateHints(); }
  if (window.BYTY && window.BYTY.byty && window.BYTY.byty.length) init();
  else fetch('data/byty.json').then(r => r.json()).then(d => { window.BYTY = d; B = d; init(); }).catch(() => init());
})();
