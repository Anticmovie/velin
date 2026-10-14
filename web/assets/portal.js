/* Portál majitele v1 (14.10.2026) — vlastní UI v designu webu nad daty VELÍNu (dešifrovaná stránka majitel-<key>.html obsahuje `const D = {...}`). */
(function () {
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const kc = n => (n == null || isNaN(n) ? '—' : Math.round(n).toLocaleString('cs-CZ').replace(/ /g, ' ') + ' Kč');
  const MON = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];
  const mlabel = m => MON[+m.slice(5, 7) - 1] + ' ' + m.slice(0, 4), mshort = m => MON[+m.slice(5, 7) - 1].slice(0, 3) + ' ' + m.slice(2, 4);
  const WD = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];

  function extractData(html) {
    const i = html.indexOf('const D = '); if (i < 0) return null;
    let d = 0, j = i + 10, inS = false, e = false;
    for (; j < html.length; j++) { const c = html[j]; if (inS) { if (e) e = false; else if (c === '\\') e = true; else if (c === '"') inS = false; continue; } if (c === '"') inS = true; else if (c === '{') d++; else if (c === '}') { d--; if (d === 0) { j++; break; } } }
    try { return JSON.parse(html.slice(i + 10, j)); } catch (x) { return null; }
  }

  const ST = { byt: 'all', obd: '12', rm: null, rstav: 'all' };
  const fmtD = d => d ? d.slice(8, 10).replace(/^0/, '') + '.' + d.slice(5, 7).replace(/^0/, '') + '.' : '';
  const addM = (m, n) => { const y = +m.slice(0, 4), mm = +m.slice(5, 7) - 1 + n; return new Date(y, mm, 1).getFullYear() + '-' + String(new Date(y, mm, 1).getMonth() + 1).padStart(2, '0'); };
  function stavRez(r, dnes) { if (r.plat === 'owner') return r.stav === 'potvrzeno' ? 'potvrzeno' : (r.stav === 'zamitnuto' || r.stav === 'kolize') ? 'zrušeno' : 'čeká'; if (r.do <= dnes) return 'ukončeno'; if (r.od <= dnes) return 'probíhá'; return 'potvrzeno'; }
  function lokalniBlokace(D) { try { return JSON.parse(localStorage.getItem('bh_blok_' + D.klic) || '[]'); } catch (e) { return []; } }
  function rezervaceMesice(D, byty, mes) {
    const start = mes + '-01', end = addM(mes, 1) + '-01'; const out = [];
    const lok = lokalniBlokace(D);
    byty.forEach(b => {
      const list = (b.rezervace || []).slice();
      lok.filter(x => x.byt === b.key && !list.some(y => y.plat === 'owner' && y.od === x.od && y.do === x.do)).forEach(x => list.push({ plat: 'owner', kod: 'žádost', host: D.jmeno, hoste: null, od: x.od, do: x.do, czk: 0, stav: 'nova', pozn: x.pozn }));
      list.forEach(r => { if (r.od < end && r.do > start) out.push({ ...r, bytNazev: b.nazev, bytKey: b.key }); });
    });
    return out.sort((a, b) => a.od.localeCompare(b.od));
  }
  function rezSekce(D, byty, cur) {
    const dnes = D.dnes || ''; const mes = ST.rm || (dnes ? dnes.slice(0, 7) : cur); let rows = rezervaceMesice(D, byty, mes).map(r => ({ ...r, st: stavRez(r, dnes) }));
    const cnt = rows.length; if (ST.rstav !== 'all') rows = rows.filter(r => (ST.rstav === 'owner' ? r.plat === 'owner' : r.st === ST.rstav));
    const badge = r => r.plat === 'airbnb' ? '<i class="pa-badge air">Airbnb</i>' : r.plat === 'booking' ? '<i class="pa-badge bk">Booking</i>' : '<i class="pa-badge own">Majitel</i>';
    const stav = st => `<i class="pa-stav ${st === 'potvrzeno' ? 'ok' : st === 'probíhá' ? 'run' : st === 'čeká' ? 'wait' : st === 'zrušeno' ? 'off' : 'done'}">${st}</i>`;
    const sum = rows.reduce((t, r) => t + (r.czk || 0), 0); const noci = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);
    return `<section class="pa-card" id="pa-rez"><div class="pa-cardhead"><h3>Rezervace</h3><div class="pa-rezctl"><div class="pa-seg"><button type="button" id="pa-rm-prev" aria-label="Předchozí měsíc">‹</button><span class="pa-rm">${esc(mlabel(mes))} (${cnt})</span><button type="button" id="pa-rm-next" aria-label="Další měsíc">›</button></div><select id="pa-rstav"><option value="all" ${ST.rstav === 'all' ? 'selected' : ''}>Všechny stavy</option><option value="potvrzeno" ${ST.rstav === 'potvrzeno' ? 'selected' : ''}>Potvrzeno</option><option value="probíhá" ${ST.rstav === 'probíhá' ? 'selected' : ''}>Probíhá</option><option value="ukončeno" ${ST.rstav === 'ukončeno' ? 'selected' : ''}>Ukončeno</option><option value="owner" ${ST.rstav === 'owner' ? 'selected' : ''}>Moje pobyty</option></select><button type="button" class="btn gold sm" id="pa-rezbtn">+ Rezervovat byt</button></div></div>
      ${rows.length ? `<div class="pa-tablewrap"><table class="pa-table pa-rez"><thead><tr><th>#</th><th>Byt</th><th>Termín</th><th>Host</th><th>Stav</th><th>Částka</th></tr></thead><tbody>
      ${rows.map(r => `<tr class="${r.st === 'ukončeno' ? 'past' : ''}"><td data-l="#">${esc(r.kod || '')}</td><td data-l="Byt">${esc(r.bytNazev)}</td><td data-l="Termín"><b>${fmtD(r.od)} – ${fmtD(r.do)}</b> <small>${noci(r.od, r.do)} ${noci(r.od, r.do) === 1 ? 'noc' : noci(r.od, r.do) < 5 ? 'noci' : 'nocí'}</small></td><td data-l="Host">${badge(r)} ${esc(r.host || (r.plat === 'airbnb' ? 'Host Airbnb' : ''))}${r.hoste ? ' <small>+ ' + r.hoste + '</small>' : ''}${r.pozn ? ' <small>· ' + esc(r.pozn) + '</small>' : ''}</td><td data-l="Stav">${stav(r.st)}</td><td data-l="Částka">${r.plat === 'airbnb' ? kc(r.czk) : r.plat === 'booking' ? '<small>ve vyúčtování</small>' : '0 Kč'}</td></tr>`).join('')}
      ${sum ? `<tr class="tot"><td colspan="5">Airbnb celkem za zobrazené</td><td>${kc(sum)}</td></tr>` : ''}</tbody></table></div><p class="pa-note">Částky Airbnb = výplata za pobyt po poplatcích. Booking se vyúčtovává měsíčně (viz tabulka níže). Přehled je informativní a nenahrazuje vyúčtování.</p>` : '<p class="pa-note">V tomto měsíci nejsou žádné rezervace.</p>'}</section>`;
  }
  function mesice(D) { const s = new Set(); D.byty.forEach(b => b.radky.forEach(r => s.add(r.mes))); return [...s].sort(); }
  function filtr(D) {
    const all = mesice(D); const y = (D.dnes || '').slice(0, 4);
    let ms = all; if (ST.obd === '12') ms = all.slice(-12); else if (ST.obd === 'rok') ms = all.filter(m => m.startsWith(y)); else if (ST.obd === 'minuly') ms = all.filter(m => m.startsWith(String(+y - 1))); else if (/^\d{4}-\d{2}$/.test(ST.obd)) ms = [ST.obd];
    const byty = ST.byt === 'all' ? D.byty : D.byty.filter(b => b.key === ST.byt);
    return { ms, byty };
  }
  function agg(byty, ms) {
    const rows = {}; ms.forEach(m => rows[m] = { mes: m, bk: 0, ab: 0, obrat: 0, provize: 0, uklid: 0, prani: 0, extra: 0, vyplata: 0, occ_noci: 0, occ_dni: 0, ks: 0, bezici: false, est: false, items: [] });
    byty.forEach(b => b.radky.forEach(r => { const x = rows[r.mes]; if (!x) return; x.bk += r.bk || 0; x.ab += r.ab || 0; x.obrat += r.obrat || 0; x.provize += r.provize || 0; x.uklid += r.uklid || 0; x.prani += r.prani || 0; x.vyplata += r.vyplata || 0; x.occ_noci += r.occ_noci || 0; x.occ_dni += r.occ_dni || 0; x.ks += r.ks || 0; x.extra += -(r.extra || []).reduce((s, e) => s + (e.castka || 0), 0); x.bezici = x.bezici || !!r.bezici; x.est = x.est || !!r.est; x.items.push({ byt: b.nazev, r }); }));
    const list = ms.map(m => rows[m]); const tot = list.reduce((t, x) => { for (const k of ['bk', 'ab', 'obrat', 'provize', 'uklid', 'prani', 'extra', 'vyplata', 'occ_noci', 'occ_dni', 'ks']) t[k] += x[k]; return t; }, { bk: 0, ab: 0, obrat: 0, provize: 0, uklid: 0, prani: 0, extra: 0, vyplata: 0, occ_noci: 0, occ_dni: 0, ks: 0 });
    tot.occ = tot.occ_dni ? Math.round(tot.occ_noci / tot.occ_dni * 100) : 0; return { list, tot };
  }
  function bars(list, key, key2, color, color2) {
    const max = Math.max(1, ...list.map(x => Math.max(x[key] || 0, key2 ? x[key2] || 0 : 0))); const w = 100 / list.length;
    return `<svg class="pa-chart" viewBox="0 0 100 46" preserveAspectRatio="none">${list.map((x, i) => { const h = (x[key] || 0) / max * 36, h2 = key2 ? (x[key2] || 0) / max * 36 : 0; return `<rect x="${(i * w + w * .12).toFixed(2)}" y="${(38 - h).toFixed(2)}" width="${(w * .76).toFixed(2)}" height="${h.toFixed(2)}" rx=".6" fill="${color}" opacity="${x.bezici ? .5 : 1}"/>${key2 ? `<rect x="${(i * w + w * .12).toFixed(2)}" y="${(38 - h2).toFixed(2)}" width="${(w * .76).toFixed(2)}" height="${h2.toFixed(2)}" rx=".6" fill="${color2}"/>` : ''}`; }).join('')}</svg><div class="pa-axis">${list.map(x => `<span>${esc(mshort(x.mes))}</span>`).join('')}</div>`;
  }
  function occLine(b) {
    const t = (b.bench && b.bench.trend) || []; if (!t.length) return '';
    const pts = (k, c) => `<polyline fill="none" stroke="${c}" stroke-width="1.6" stroke-linejoin="round" points="${t.map((x, i) => `${(i / (t.length - 1) * 100).toFixed(1)},${(40 - (x[k] || 0) * .38).toFixed(1)}`).join(' ')}"/>`;
    return `<svg class="pa-chart" viewBox="0 0 100 46" preserveAspectRatio="none">${pts('port', '#C9D3CC')}${pts('occ', '#142D26')}</svg><div class="pa-axis">${t.map(x => `<span>${esc(mshort(x.mes))}</span>`).join('')}</div><div class="pa-legend"><i style="background:#142D26"></i>váš byt <i style="background:#C9D3CC"></i>průměr portfolia</div>`;
  }
  function calendar(items, mes) {
    const y = +mes.slice(0, 4), m = +mes.slice(5, 7); const dni = new Date(y, m, 0).getDate(), pad = (new Date(y, m - 1, 1).getDay() + 6) % 7;
    const bk = new Set(), ab = new Set(), uk = new Set(); items.forEach(({ r }) => { (r.bk_dny || []).forEach(d => bk.add(d)); (r.ab_dny || []).forEach(d => ab.add(d)); (r.uklid_dny || []).forEach(d => uk.add(d)); });
    let h = `<div class="pa-cal"><div class="wk">${WD.map(x => `<span>${x}</span>`).join('')}</div><div class="d">`; for (let i = 0; i < pad; i++) h += '<i></i>';
    for (let d = 1; d <= dni; d++) h += `<b class="${bk.has(d) ? 'bk' : ab.has(d) ? 'ab' : ''}${uk.has(d) ? ' uk' : ''}" title="${bk.has(d) ? 'Booking' : ab.has(d) ? 'Airbnb' : 'volno'}${uk.has(d) ? ' · úklid' : ''}">${d}</b>`;
    return h + `</div><div class="pa-legend"><i class="lgb"></i>Booking <i class="lga"></i>Airbnb <i class="lgu"></i>úklid (odjezd)</div></div>`;
  }
  function render(D) {
    const root = $('#portal-view'); if (!root) return; const { ms, byty } = filtr(D); const { list, tot } = agg(byty, ms); const all = mesice(D);
    let cur = D.dnes ? D.dnes.slice(0, 7) : all[all.length - 1]; if (!all.includes(cur)) cur = all[all.length - 1]; if (ST.cal && !all.includes(ST.cal)) ST.cal = null; const last = list[list.length - 1];
    const bench = byty.length === 1 ? byty[0].bench : null;
    const nak = (D.naklady_prefill || []).filter(n => ms.includes(n.mes) && (ST.byt === 'all' || n.byt === ST.byt));
    const nakTot = nak.reduce((s, n) => s + (n.castka || 0), 0);
    root.innerHTML = `
    <div class="pa-head"><div><div class="pa-kick">${esc(D.spravce && D.spravce.nazev || 'Byt a host')} · data k ${esc(D.gen || D.dnes || '')}</div><h2>${esc(D.jmeno)}</h2></div>
      <div class="pa-filters"><div class="pa-seg" id="pa-byt"><button class="${ST.byt === 'all' ? 'on' : ''}" data-v="all">Všechny byty</button>${D.byty.map(b => `<button class="${ST.byt === b.key ? 'on' : ''}" data-v="${esc(b.key)}">${esc(b.nazev)}</button>`).join('')}</div>
      <div class="pa-seg" id="pa-obd"><button class="${ST.obd === '12' ? 'on' : ''}" data-v="12">12 měsíců</button><button class="${ST.obd === 'rok' ? 'on' : ''}" data-v="rok">Letos</button><button class="${ST.obd === 'minuly' ? 'on' : ''}" data-v="minuly">Minulý rok</button><button class="${ST.obd === 'vse' ? 'on' : ''}" data-v="vse">Vše</button><select id="pa-mes"><option value="">Měsíc…</option>${all.slice().reverse().map(m => `<option value="${m}" ${ST.obd === m ? 'selected' : ''}>${esc(mlabel(m))}</option>`).join('')}</select></div></div></div>
    <div class="pa-kpi">
      <div><span>Obrat za pobyty</span><b>${kc(tot.obrat)}</b><small>Booking ${kc(tot.bk)} · Airbnb ${kc(tot.ab)}</small></div>
      <div class="hi"><span>Vaše výplata</span><b>${kc(tot.vyplata)}</b><small>po provizi, úklidu a prádle${tot.extra ? ' · mimořádné ' + (tot.extra > 0 ? '+' : '') + kc(tot.extra) : ''}</small></div>
      <div><span>Naše odměna</span><b>${kc(tot.provize)}</b><small>${tot.obrat ? Math.round(tot.provize / tot.obrat * 100) : 0} % z obratu · úklid a prádlo ${kc(tot.uklid + tot.prani)}</small></div>
      <div><span>Obsazenost</span><b>${tot.occ} %</b><small>${tot.occ_noci} nocí z ${tot.occ_dni}${bench ? ' · portfolio ' + bench.port_occ + ' % · ADR ' + kc(bench.adr) : ''}</small></div>
    </div>
    <div class="pa-grid2">
      <section class="pa-card"><h3>Obrat a výplata po měsících</h3>${bars(list, 'obrat', 'vyplata', '#C9D3CC', '#142D26')}<div class="pa-legend"><i style="background:#C9D3CC"></i>obrat <i style="background:#142D26"></i>výplata</div></section>
      <section class="pa-card"><h3>Obsazenost${bench ? ' vs. portfolio' : ' po měsících'}</h3>${bench ? occLine(byty[0]) : bars(list.map(x => ({ ...x, occ: x.occ_dni ? x.occ_noci / x.occ_dni * 100 : 0 })), 'occ', null, '#142D26')}${bench && bench.dopo ? `<p class="pa-note">${esc(bench.dopo)}</p>` : ''}</section>
    </div>
    ${rezSekce(D, byty, cur)}
    <section class="pa-card"><div class="pa-cardhead"><h3>Kalendář obsazenosti</h3><select id="pa-calmes">${all.slice().reverse().map(m => `<option value="${m}" ${(ST.cal || cur) === m ? 'selected' : ''}>${esc(mlabel(m))}</option>`).join('')}</select></div>${calendar((list.find(x => x.mes === (ST.cal || cur)) || { items: [] }).items, ST.cal || cur)}</section>
    <section class="pa-card"><h3>Měsíční vyúčtování</h3><div class="pa-tablewrap"><table class="pa-table"><thead><tr><th>Měsíc</th><th>Booking</th><th>Airbnb</th><th>Obrat</th><th>Obsazenost</th><th>Odměna</th><th>Úklid + prádlo</th><th>Mimořádné (+ příjem / − náklad)</th><th>Výplata</th></tr></thead><tbody>
      ${list.slice().reverse().map(x => `<tr class="${x.bezici ? 'run' : ''}"><td>${esc(mlabel(x.mes))}${x.bezici ? ' <em>běží</em>' : ''}${x.est ? ' <em>odhad</em>' : ''}</td><td>${kc(x.bk)}</td><td>${kc(x.ab)}</td><td><b>${kc(x.obrat)}</b></td><td>${x.occ_dni ? Math.round(x.occ_noci / x.occ_dni * 100) : 0} %</td><td>${kc(x.provize)}</td><td>${kc(x.uklid + x.prani)}${x.ks ? ' <small>(' + x.ks + '×)</small>' : ''}</td><td>${x.extra ? (x.extra > 0 ? '+' : '') + kc(x.extra) : '—'}</td><td><b>${kc(x.vyplata)}</b></td></tr>`).join('')}
      <tr class="tot"><td>Celkem</td><td>${kc(tot.bk)}</td><td>${kc(tot.ab)}</td><td><b>${kc(tot.obrat)}</b></td><td>${tot.occ} %</td><td>${kc(tot.provize)}</td><td>${kc(tot.uklid + tot.prani)}</td><td>${tot.extra ? (tot.extra > 0 ? '+' : '') + kc(tot.extra) : '—'}</td><td><b>${kc(tot.vyplata)}</b></td></tr></tbody></table></div>
      <p class="pa-note">Výplaty z Airbnb a Booking vám chodí přímo na účet; odměnu, úklid a prádlo fakturujeme měsíčně.${D.uhrazeno_do ? ' Uhrazeno do: <b>' + esc(D.uhrazeno_do) + '</b>.' : ''}</p></section>
    <div class="pa-grid2">
      <section class="pa-card"><h3>Vaše vlastní náklady <small>(informativně, platíte přímo vy)</small></h3>${nak.length ? `<div class="pa-tablewrap"><table class="pa-table"><thead><tr><th>Měsíc</th><th>Položka</th><th>Byt</th><th>Částka</th></tr></thead><tbody>${nak.slice().sort((a, b) => b.mes.localeCompare(a.mes)).slice(0, 60).map(n => `<tr><td>${esc(mshort(n.mes))}</td><td>${esc(n.kat)}${n.pozn ? ' <small>' + esc(n.pozn) + '</small>' : ''}</td><td>${esc(n.byt || '')}</td><td>${kc(n.castka)}</td></tr>`).join('')}<tr class="tot"><td colspan="3">Celkem za období</td><td>${kc(nakTot)}</td></tr></tbody></table></div>` : '<p class="pa-note">Zatím žádné evidované náklady.</p>'}</section>
      <section class="pa-card" id="pa-blokcard"><h3>Rezervovat byt pro sebe</h3><p class="pa-note">Zadejte termín, kdy chcete byt pro sebe nebo rodinu. Zablokujeme ho v kalendářích Airbnb i Booking a potvrdíme do 24 hodin (už potvrzené rezervace hostů se dodržují). Žádost hned uvidíte v seznamu rezervací jako „čeká“.</p>
        <form id="pa-blok" class="form" style="grid-template-columns:1fr 1fr"><div><label for="pb-byt">Byt</label><select id="pb-byt">${D.byty.map(b => `<option value="${esc(b.key)}">${esc(b.nazev)}</option>`).join('')}</select></div><div><label for="pb-od">Od</label><input type="date" id="pb-od" required></div><div><label for="pb-do">Do</label><input type="date" id="pb-do" required></div><div><label for="pb-pozn">Poznámka</label><input id="pb-pozn" placeholder="např. rodina, 2 osoby"></div><div class="full"><button class="btn gold" type="submit">Poslat žádost o blokaci</button><div id="pb-msg"></div></div></form>
        ${(D.zprava && (D.zprava.text || typeof D.zprava === 'string')) ? `<h3 style="margin-top:22px">Zpráva od správce</h3><p>${esc(D.zprava.text || D.zprava)}</p>` : ''}
        ${byty.some(b => (b.odkazy || []).length) ? `<h3 style="margin-top:22px">Odkazy</h3><div class="pa-links">${byty.flatMap(b => (b.odkazy || []).map(o => `<a class="chip" href="${esc(o.u)}" target="_blank" rel="noopener">${esc(o.t)}</a>`)).join('')}</div>` : ''}
      </section>
    </div>`;
    $$('#pa-byt button').forEach(b => b.onclick = () => { ST.byt = b.dataset.v; render(D); });
    $$('#pa-obd button').forEach(b => b.onclick = () => { ST.obd = b.dataset.v; render(D); });
    $('#pa-mes').onchange = e => { if (e.target.value) { ST.obd = e.target.value; ST.cal = e.target.value; render(D); } };
    $('#pa-calmes').onchange = e => { ST.cal = e.target.value; render(D); };
    const rm0 = () => ST.rm || ((D.dnes || '').slice(0, 7) || cur); $('#pa-rm-prev').onclick = () => { ST.rm = addM(rm0(), -1); render(D); }; $('#pa-rm-next').onclick = () => { ST.rm = addM(rm0(), 1); render(D); }; $('#pa-rstav').onchange = e => { ST.rstav = e.target.value; render(D); };
    $('#pa-rezbtn').onclick = () => { const f = $('#pa-blok'); f.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => $('#pb-od').focus(), 400); };
    $('#pa-blok').onsubmit = async e => { e.preventDefault(); const msg = $('#pb-msg'); const od = $('#pb-od').value, doo = $('#pb-do').value; if (!od || !doo || doo <= od) { msg.innerHTML = '<div class="msg bad">Zadejte termín Od a Do.</div>'; return; } const ok = window.BH && window.BH.sb ? await window.BH.sb('web_blokace', { klient: D.klic, byt_key: $('#pb-byt').value, od, do_: doo, pozn: $('#pb-pozn').value, jmeno: D.jmeno }) : false; msg.innerHTML = `<div class="msg ${ok ? 'ok' : 'bad'}">${ok ? 'Žádost odeslána, potvrdíme do 24 hodin.' : 'Odeslání se nepodařilo, zavolejte nám prosím.'}</div>`; if (ok) { try { const l = lokalniBlokace(D); l.push({ byt: $('#pb-byt').value, od, do: doo, pozn: $('#pb-pozn').value, t: Date.now() }); localStorage.setItem('bh_blok_' + D.klic, JSON.stringify(l.slice(-20))); } catch (x) {} ST.rm = od.slice(0, 7); ST.rstav = 'all'; e.target.reset(); render(D); $('#pa-rez').scrollIntoView({ behavior: 'smooth', block: 'start' }); } };
  }
  window.BH_PORTAL = { extractData, render };
})();
