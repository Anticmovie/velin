/* Portál majitele v2 (15.10.2026) — vlastní UI v designu webu nad daty VELÍNu (dešifrovaná stránka majitel-<key>.html obsahuje `const D = {...}`).
   v2: mini menu, období od–do (měsíce), čistý/hrubý přepínač, grafy s přesnou částkou po najetí, kalendář s pruhy pobytů (půlden příjezd/odjezd + jméno),
       vyúčtování jako ve VELÍNu (sloupce po bytech, vypínatelné mínusy, PDF faktura za měsíc), bublina „Moje náklady“ (pravidelné / jednorázové). */
(function () {
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nf = n => Math.round(n || 0).toLocaleString('cs-CZ').replace(/\s/g, ' ');
  const kc = n => (n == null || isNaN(n) ? '—' : nf(n) + ' Kč');
  const MON = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];
  const MON6 = ['lednu', 'únoru', 'březnu', 'dubnu', 'květnu', 'červnu', 'červenci', 'srpnu', 'září', 'říjnu', 'listopadu', 'prosinci'];
  const mlabel = m => MON[+m.slice(5, 7) - 1] + ' ' + m.slice(0, 4), mshort = m => MON[+m.slice(5, 7) - 1].slice(0, 3) + ' ' + m.slice(2, 4);
  const WD = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
  const fmtD = d => d ? d.slice(8, 10).replace(/^0/, '') + '.' + d.slice(5, 7).replace(/^0/, '') + '.' : '';
  const addM = (m, n) => { const dt = new Date(+m.slice(0, 4), +m.slice(5, 7) - 1 + n, 1); return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0'); };
  const noci = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5), nocTxt = n => n + ' ' + (n === 1 ? 'noc' : n < 5 ? 'noci' : 'nocí');

  function extractData(html) {
    const i = html.indexOf('const D = '); if (i < 0) return null;
    let d = 0, j = i + 10, inS = false, e = false;
    for (; j < html.length; j++) { const c = html[j]; if (inS) { if (e) e = false; else if (c === '\\') e = true; else if (c === '"') inS = false; continue; } if (c === '"') inS = true; else if (c === '{') d++; else if (c === '}') { d--; if (d === 0) { j++; break; } } }
    try { return JSON.parse(html.slice(i + 10, j)); } catch (x) { return null; }
  }

  const ST = { byt: 'all', obd: 'rok', od: null, do: null, cisty: true, rm: null, rstav: 'all', cal: null, calByt: null, open: {}, cols: { prov: true, prub: true, najem: true, uklidy: true, ostat: true, moje: true }, nk: { typ: 'mesicne', kat: 'Elektřina' } };

  /* ---------- localStorage (každý přístup chráněný) ---------- */
  const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
  const lokalniBlokace = D => lsGet('bh_blok_' + D.klic, []);
  const mojeNaklady = D => lsGet('bh_naklady_' + D.klic, []);

  /* ---------- rezervace ---------- */
  function stavRez(r, dnes) { if (r.plat === 'owner') return r.stav === 'potvrzeno' ? 'potvrzeno' : (r.stav === 'zamitnuto' || r.stav === 'kolize') ? 'zrušeno' : 'čeká'; if (r.do <= dnes) return 'ukončeno'; if (r.od <= dnes) return 'probíhá'; return 'potvrzeno'; }
  function rezBytu(D, b) {
    const list = (b.rezervace || []).slice();
    lokalniBlokace(D).filter(x => x.byt === b.key && !list.some(y => y.plat === 'owner' && y.od === x.od && y.do === x.do)).forEach(x => list.push({ plat: 'owner', kod: 'žádost', host: D.jmeno, hoste: null, od: x.od, do: x.do, czk: 0, stav: 'nova', pozn: x.pozn }));
    return list;
  }
  function rezervaceMesice(D, byty, mes) {
    const start = mes + '-01', end = addM(mes, 1) + '-01'; const out = [];
    byty.forEach(b => rezBytu(D, b).forEach(r => { if (r.od < end && r.do > start) out.push({ ...r, bytNazev: b.nazev, bytKey: b.key }); }));
    return out.sort((a, b) => a.od.localeCompare(b.od));
  }
  function rezSekce(D, byty, cur) {
    const dnes = D.dnes || ''; const mes = ST.rm || (dnes ? dnes.slice(0, 7) : cur); let rows = rezervaceMesice(D, byty, mes).map(r => ({ ...r, st: stavRez(r, dnes) }));
    const cnt = rows.length; if (ST.rstav !== 'all') rows = rows.filter(r => (ST.rstav === 'owner' ? r.plat === 'owner' : r.st === ST.rstav));
    const badge = r => r.plat === 'airbnb' ? '<i class="pa-badge air">Airbnb</i>' : r.plat === 'booking' ? '<i class="pa-badge bk">Booking</i>' : '<i class="pa-badge own">Majitel</i>';
    const stav = st => `<i class="pa-stav ${st === 'potvrzeno' ? 'ok' : st === 'probíhá' ? 'run' : st === 'čeká' ? 'wait' : st === 'zrušeno' ? 'off' : 'done'}">${st}</i>`;
    const sum = rows.reduce((t, r) => t + (r.czk || 0), 0);
    return `<section class="pa-card pa-anchor" id="pa-rez"><div class="pa-cardhead"><h3>Rezervace</h3><div class="pa-rezctl"><div class="pa-seg"><button type="button" id="pa-rm-prev" aria-label="Předchozí měsíc">‹</button><span class="pa-rm">${esc(mlabel(mes))} (${cnt})</span><button type="button" id="pa-rm-next" aria-label="Další měsíc">›</button></div><select id="pa-rstav" aria-label="Stav rezervace"><option value="all" ${ST.rstav === 'all' ? 'selected' : ''}>Všechny stavy</option><option value="potvrzeno" ${ST.rstav === 'potvrzeno' ? 'selected' : ''}>Potvrzeno</option><option value="probíhá" ${ST.rstav === 'probíhá' ? 'selected' : ''}>Probíhá</option><option value="ukončeno" ${ST.rstav === 'ukončeno' ? 'selected' : ''}>Ukončeno</option><option value="owner" ${ST.rstav === 'owner' ? 'selected' : ''}>Moje pobyty</option></select><button type="button" class="btn gold sm" id="pa-rezbtn">+ Rezervovat byt</button></div></div>
      ${rows.length ? `<div class="pa-tablewrap"><table class="pa-table pa-rez"><thead><tr><th>#</th><th>Byt</th><th>Termín</th><th>Host</th><th>Stav</th><th>Částka</th></tr></thead><tbody>
      ${rows.map(r => `<tr class="${r.st === 'ukončeno' ? 'past' : ''}"><td data-l="#">${esc(r.kod || '')}</td><td data-l="Byt">${esc(r.bytNazev)}</td><td data-l="Termín"><b>${fmtD(r.od)} – ${fmtD(r.do)}</b> <small>${nocTxt(noci(r.od, r.do))}</small></td><td data-l="Host">${badge(r)} ${esc(r.host || (r.plat === 'airbnb' ? 'Host Airbnb' : ''))}${r.hoste ? ' <small>+ ' + r.hoste + '</small>' : ''}${r.pozn ? ' <small>· ' + esc(r.pozn) + '</small>' : ''}</td><td data-l="Stav">${stav(r.st)}</td><td data-l="Částka">${r.plat === 'airbnb' ? kc(r.czk) : r.plat === 'booking' ? '<small>ve vyúčtování</small>' : '0 Kč'}</td></tr>`).join('')}
      ${sum ? `<tr class="tot"><td colspan="5">Airbnb celkem za zobrazené</td><td>${kc(sum)}</td></tr>` : ''}</tbody></table></div><p class="pa-note">Částky Airbnb = výplata za pobyt po poplatcích. Booking se vyúčtovává měsíčně (viz vyúčtování níže). Přehled je informativní a nenahrazuje vyúčtování.</p>` : '<p class="pa-note">V tomto měsíci nejsou žádné rezervace.</p>'}</section>`;
  }

  /* ---------- období a výběr bytů ---------- */
  function mesice(D) { const s = new Set(); D.byty.forEach(b => b.radky.forEach(r => s.add(r.mes))); return [...s].sort(); }
  function nastavObdobi(D, obd) {
    const all = mesice(D); const y = (D.dnes || all[all.length - 1] || '').slice(0, 4); ST.obd = obd;
    let ms = all;
    if (obd === '12') ms = all.slice(-12); else if (obd === 'rok') ms = all.filter(m => m.startsWith(y)); else if (obd === 'minuly') ms = all.filter(m => m.startsWith(String(+y - 1)));
    if (!ms.length) ms = all.slice(-12);
    ST.od = ms[0]; ST.do = ms[ms.length - 1];
  }
  const vybraneByty = D => ST.byt === 'all' ? D.byty : D.byty.filter(b => b.key === ST.byt);
  const vseByty = D => ST.byt === 'all' || D.byty.length === 1;

  /* ---------- náklady majitele: evidence (předvyplněné) + vlastní záznamy ---------- */
  const jeNajem = k => /hypot|nájem|najem/i.test(k || ''), jeUklid = k => /úklid|uklid/i.test(k || '');
  function evidenceMes(D, mes, filtr) {
    const sel = new Set(vybraneByty(D).map(b => b.key));
    return (D.naklady_prefill || []).filter(z => z.mes === mes && filtr(z.kat) && (z.byt ? sel.has(z.byt) : vseByty(D)));
  }
  function mojeMes(D, mes) {
    const sel = new Set(vybraneByty(D).map(b => b.key));
    return mojeNaklady(D).filter(z => (z.typ === 'mesicne' ? z.mes <= mes && (!z.do || mes <= z.do) : z.mes === mes) && (z.byt ? sel.has(z.byt) : vseByty(D)));
  }
  const suma = a => a.reduce((s, z) => s + (+z.castka || 0), 0);

  /* ---------- měsíční řádky (stejná logika jako VELÍN) ---------- */
  function radkyObdobi(D) {
    const byty = vybraneByty(D); const ms = mesice(D).filter(m => m >= ST.od && m <= ST.do);
    const out = [];
    ms.forEach(mes => {
      const x = { mes, byt: {}, bk: 0, ab: 0, obrat: 0, provize: 0, sazby: new Set(), uklPra: 0, extra: 0, extraItems: [], vyplata: 0, occN: 0, occD: 0, bezici: false, est: false, ks: 0, ma: false };
      byty.forEach(b => { const r = b.radky.find(z => z.mes === mes); if (!r) return; x.ma = true;
        const ex = (r.extra || []).reduce((s, e) => s + (e.castka || 0), 0);
        x.byt[b.key] = r.obrat; x.bk += r.bk || 0; x.ab += r.ab || 0; x.obrat += r.obrat || 0; x.provize += r.provize || 0; if (r.sazba != null) x.sazby.add(r.sazba);
        x.uklPra += (r.uklid || 0) + (r.prani || 0); x.ks += r.ks || 0; x.extra += ex; (r.extra || []).forEach(e => x.extraItems.push({ ...e, byt: b.nazev }));
        x.vyplata += r.vyplata || 0; x.occN += r.occ_noci || 0; x.occD += r.occ_dni || 0; x.bezici = x.bezici || !!r.bezici; x.est = x.est || !!r.est; });
      if (!x.ma) return;
      x.najem = suma(evidenceMes(D, mes, jeNajem)); x.uklidy = suma(evidenceMes(D, mes, jeUklid)); x.ostatItems = evidenceMes(D, mes, k => !jeNajem(k) && !jeUklid(k)); x.ostat = suma(x.ostatItems);
      x.mojeItems = mojeMes(D, mes); x.moje = suma(x.mojeItems);
      x.prub = x.uklPra + x.extra;
      const C = ST.cols; x.zbude = x.obrat - (C.prov ? x.provize : 0) - (C.prub ? x.prub : 0) - (C.najem ? x.najem : 0) - (C.uklidy ? x.uklidy : 0) - (C.ostat ? x.ostat : 0) - (C.moje ? x.moje : 0);
      x.occ = x.occD ? Math.round(x.occN / x.occD * 100) : null;
      out.push(x);
    });
    return out;
  }

  /* ---------- grafy: sloupce s přesnou částkou po najetí / klepnutí ---------- */
  function barChart(items, max, dvojity) {
    const step = items.length > 14 ? Math.ceil(items.length / 12) : 1; const n = items.length;
    return `<div class="pa-bars">${items.map((x, i) => `<div class="pa-bc${i < 2 ? ' l' : i > n - 3 ? ' r' : ''}" tabindex="0" aria-label="${esc(x.aria)}"><div class="pa-bs">${dvojity ? `<i class="a" style="height:${Math.max(0, x.a / max * 100).toFixed(1)}%"></i>` : ''}<i class="b${x.dim ? ' dim' : ''}" style="height:${Math.max(0, x.b / max * 100).toFixed(1)}%"></i></div><span class="pa-bl">${i % step ? '' : esc(x.lab)}</span><div class="pa-tip">${x.tip}</div></div>`).join('')}</div>`;
  }
  function grafy(list) {
    if (!list.length) return '';
    const max1 = Math.max(1, ...list.map(x => Math.max(x.obrat, x.vyplata)));
    const g1 = barChart(list.map(x => ({ lab: mshort(x.mes), a: x.obrat, b: x.vyplata, dim: x.bezici, aria: `${mlabel(x.mes)}: obrat ${kc(x.obrat)}, výplata ${kc(x.vyplata)}`,
      tip: `<b>${esc(mlabel(x.mes))}${x.bezici ? ' · běží' : ''}</b><span><i class="a"></i>Obrat <em>${kc(x.obrat)}</em></span><span><i class="b"></i>Výplata <em>${kc(x.vyplata)}</em></span><span class="zb">Zbude po všem <em>${kc(x.zbude)}</em></span>` })), max1, true);
    const g2 = barChart(list.map(x => ({ lab: mshort(x.mes), a: 0, b: x.occ || 0, dim: x.bezici, aria: `${mlabel(x.mes)}: obsazenost ${x.occ == null ? '—' : x.occ + ' %'}`,
      tip: `<b>${esc(mlabel(x.mes))}</b><span><i class="b"></i>Obsazenost <em>${x.occ == null ? '—' : x.occ + ' %'}</em></span><span>${x.occN} z ${x.occD} nocí</span>` })), 100, false);
    return `<div class="pa-grid2 pa-anchor" id="pa-grafy">
      <section class="pa-card"><h3>Obrat a výplata po měsících</h3>${g1}<div class="pa-legend"><i style="background:#C9D3CC"></i>obrat <i style="background:var(--green)"></i>výplata <span class="pa-hint">najeďte na sloupec pro přesnou částku</span></div></section>
      <section class="pa-card"><h3>Obsazenost po měsících</h3>${g2}<div class="pa-legend"><i style="background:var(--green)"></i>obsazenost v % nocí</div></section></div>`;
  }

  /* ---------- kalendář: pruh od poloviny dne příjezdu do poloviny dne odjezdu ---------- */
  function kalendar(D, cur) {
    const mes = ST.cal || (D.dnes || '').slice(0, 7) || cur; const b = D.byty.find(x => x.key === ST.calByt) || D.byty[0];
    const y = +mes.slice(0, 4), m = +mes.slice(5, 7), dni = new Date(y, m, 0).getDate(), pad = (new Date(y, m - 1, 1).getDay() + 6) % 7;
    const start = mes + '-01', konec = addM(mes, 1) + '-01', dnes = D.dnes || '';
    const pos = d => { const k = pad + d - 1; return { r: Math.floor(k / 7), c: k % 7 }; };
    const radku = Math.ceil((pad + dni) / 7); const segs = Array.from({ length: radku }, () => []);
    rezBytu(D, b).filter(r => r.od < konec && r.do > start && !(r.plat === 'owner' && (r.stav === 'zamitnuto' || r.stav === 'kolize'))).forEach(r => {
      const odIn = r.od >= start, doIn = r.do < konec;
      const sD = odIn ? +r.od.slice(8, 10) : 1, eD = doIn ? +r.do.slice(8, 10) : dni;
      const tip = `${r.plat === 'airbnb' ? 'Airbnb' : r.plat === 'booking' ? 'Booking' : 'Majitel'} · ${r.host || 'Host'}${r.hoste ? ' +' + r.hoste : ''} · ${fmtD(r.od)}–${fmtD(r.do)} (${nocTxt(noci(r.od, r.do))})`;
      for (let row = pos(sD).r; row <= pos(eD).r; row++) {
        const fD = Math.max(sD, row * 7 - pad + 1), lD = Math.min(eD, row * 7 - pad + 7);
        const zac = fD === sD && odIn, kon = lD === eD && doIn;
        const L = pos(fD).c + (zac ? .5 : 0), R = pos(lD).c + (kon ? .5 : 1);
        if (R <= L) continue;
        segs[row].push(`<span class="pa-kb ${r.plat === 'airbnb' ? 'ab' : r.plat === 'booking' ? 'bk' : 'ow'}${zac ? '' : ' cl'}${kon ? '' : ' cr'}" style="left:calc(${(L / 7 * 100).toFixed(3)}% + 2px);width:calc(${((R - L) / 7 * 100).toFixed(3)}% - 4px)" title="${esc(tip)}">${esc(r.host || (r.plat === 'airbnb' ? 'Host Airbnb' : ''))}</span>`);
      }
    });
    const uk = new Set(); ((b.radky.find(r => r.mes === mes) || {}).uklid_dny || []).forEach(d => uk.add(d));
    let h = '';
    for (let row = 0; row < radku; row++) {
      let cells = '';
      for (let c = 0; c < 7; c++) { const d = row * 7 + c - pad + 1; const iso = mes + '-' + String(d).padStart(2, '0');
        cells += d < 1 || d > dni ? '<div class="x"></div>' : `<div class="${iso === dnes ? 'td' : ''}"><span>${d}</span></div>`; }
      h += `<div class="pa-kr">${cells}${segs[row].join('')}</div>`;
    }
    const bytSel = D.byty.length > 1 ? `<div class="pa-seg pa-calbyt" id="pa-calbyt">${D.byty.map(x => `<button type="button" class="${x.key === b.key ? 'on' : ''}" data-v="${esc(x.key)}">${esc(x.nazev)}</button>`).join('')}</div>` : '';
    return `<section class="pa-card pa-anchor" id="pa-kal"><div class="pa-cardhead"><h3>Kalendář obsazenosti</h3><div class="pa-rezctl"><div class="pa-seg"><button type="button" id="pa-cal-prev" aria-label="Předchozí měsíc">‹</button><span class="pa-rm">${esc(mlabel(mes))}</span><button type="button" id="pa-cal-next" aria-label="Další měsíc">›</button></div></div></div>${bytSel}
      <div class="pa-kal"><div class="wk">${WD.map(x => `<span>${x}</span>`).join('')}</div>${h}</div>
      <div class="pa-legend"><i class="lgb"></i>Booking <i class="lga"></i>Airbnb <i style="background:#1F7A4D"></i>vaše blokace <span class="pa-hint">pruh začíná v polovině dne příjezdu a končí v polovině dne odjezdu</span></div></section>`;
  }

  /* ---------- měsíční vyúčtování ---------- */
  function vyuctovani(D, list) {
    const byty = vybraneByty(D), vice = byty.length > 1, C = ST.cols;
    const ma = { prub: list.some(x => x.prub), najem: list.some(x => x.najem), uklidy: list.some(x => x.uklidy), ostat: list.some(x => x.ostat), moje: list.some(x => x.moje) };
    const COLS = [['prov', 'Provize', 'naše odměna', true], ['prub', 'Úklid, prádlo', 'a mimořádné', ma.prub], ['najem', 'Nájem', 'dle smlouvy', ma.najem], ['uklidy', 'Úklidy', 'vlastní uklízečka', ma.uklidy], ['ostat', 'Ostatní', 'poplatek, DPH, vybavení', ma.ostat], ['moje', 'Moje náklady', 'energie, opravy…', ma.moje]].filter(c => c[3]);
    const val = (x, k) => k === 'prov' ? x.provize : x[k];
    const neg = v => v ? (v > 0 ? '−' + nf(v) : '+' + nf(-v)) : '—';
    const tot = { obrat: 0, zbude: 0, byt: {} }; COLS.forEach(c => tot[c[0]] = 0); byty.forEach(b => tot.byt[b.key] = 0);
    const ncol = 1 + (vice ? byty.length : 0) + 1 + COLS.filter(c => C[c[0]]).length + 2;
    const uhr = D.uhrazeno_do; let cut = false;
    const rows = list.slice().reverse().map(x => {
      tot.obrat += x.obrat; tot.zbude += x.zbude; COLS.forEach(c => tot[c[0]] += val(x, c[0]) || 0); byty.forEach(b => tot.byt[b.key] += x.byt[b.key] || 0);
      const sz = [...x.sazby]; const open = !!ST.open[x.mes];
      const det = `<tr class="pa-det"${open ? '' : ' hidden'}><td colspan="${ncol}"><div class="pa-detin">
        ${byty.filter(b => x.byt[b.key] != null).map(b => { const r = b.radky.find(z => z.mes === x.mes); return `<div><b>${esc(b.nazev)}</b><span>Airbnb ${kc(r.ab)} · Booking ${kc(r.bk)}${r.prime ? ' · přímé ' + kc(r.prime) : ''}</span></div>`; }).join('')}
        ${x.extraItems.map(e => `<div><b>${e.castka < 0 ? 'Příjem navíc' : 'Mimořádný náklad'}</b><span>${esc(e.popis || '')} · ${e.castka < 0 ? '+' : '−'}${kc(Math.abs(e.castka))}</span></div>`).join('')}
        ${x.ostatItems.map(z => `<div><b>${esc(z.kat)}</b><span>${esc(z.pozn || '')} · −${kc(z.castka)}</span></div>`).join('')}
        ${x.mojeItems.map(z => `<div><b>${esc(z.kat)}${z.typ === 'mesicne' ? ' <small>pravidelně</small>' : ''}</b><span>${esc(z.pozn || '')} · −${kc(z.castka)}</span></div>`).join('')}
        ${x.est ? '<div><b>Odhad</b><span>úklid a poplatek za tento měsíc jsou zatím odhad z předchozích měsíců</span></div>' : ''}</div></td></tr>`;
      let cutRow = ''; if (uhr && !cut && x.mes <= uhr) { cut = true; cutRow = `<tr class="pa-cut"><td colspan="${ncol}">Faktury uhrazeny do ${esc(mlabel(uhr))}</td></tr>`; }
      return cutRow + `<tr class="pa-mo${open ? ' open' : ''}${x.bezici ? ' run' : ''}" data-mo="${x.mes}"><td><span class="cx">▸</span><b>${esc(mlabel(x.mes))}</b>${x.bezici ? ' <em>běží</em>' : x.occ != null ? ` <em>${x.occ} %</em>` : ''}${x.est ? ' <em class="est">odhad</em>' : ''}</td>
        ${vice ? byty.map(b => `<td>${x.byt[b.key] == null ? '<span class="mut">—</span>' : nf(x.byt[b.key])}</td>`).join('') : ''}<td><b>${nf(x.obrat)}</b></td>
        ${COLS.filter(c => C[c[0]]).map(c => { const v = val(x, c[0]) || 0; return `<td class="${v < 0 ? 'pos' : 'neg'}">${neg(v)}${c[0] === 'prov' && sz.length ? ` <small class="sz">${sz.join('/')} %</small>` : ''}</td>`; }).join('')}
        <td class="${x.zbude >= 0 ? 'pos' : 'neg'}"><b>${nf(x.zbude)}</b></td><td>${x.bezici ? '' : `<button type="button" class="pa-pdf" data-fakt="${x.mes}">PDF</button>`}</td></tr>` + det;
    }).join('');
    const per = list.length ? (list.length === 1 ? mlabel(list[0].mes) : mlabel(list[0].mes) + ' – ' + mlabel(list[list.length - 1].mes)) : '';
    return `<section class="pa-card pa-anchor" id="pa-vyu"><div class="pa-cardhead"><h3>Měsíční vyúčtování <small>${esc(per)}</small></h3></div>
      <div class="pa-toggles" role="group" aria-label="Odečítat ve sloupci Zbude">${COLS.map(c => `<label class="${C[c[0]] ? 'on' : ''}"><input type="checkbox" data-col="${c[0]}" ${C[c[0]] ? 'checked' : ''}>${esc(c[1])}</label>`).join('')}<span class="pa-hint">odečítat ve sloupci Zbude</span></div>
      ${list.length ? `<div class="pa-tablewrap"><table class="pa-table pa-vy"><thead><tr><th>Měsíc</th>${vice ? byty.map(b => `<th>${esc(b.nazev)}<small>hrubý příjem</small></th>`).join('') : ''}<th>Obrat<small>${vice ? 'celkem' : 'hrubý příjem'}</small></th>${COLS.filter(c => C[c[0]]).map(c => `<th>${esc(c[1])}<small>${esc(c[2])}</small></th>`).join('')}<th>Zbude<small>čistý zisk</small></th><th>Faktura</th></tr></thead><tbody>${rows}
      <tr class="tot"><td>Celkem</td>${vice ? byty.map(b => `<td>${nf(tot.byt[b.key])}</td>`).join('') : ''}<td>${nf(tot.obrat)}</td>${COLS.filter(c => C[c[0]]).map(c => `<td class="${tot[c[0]] < 0 ? 'pos' : 'neg'}">${neg(tot[c[0]])}</td>`).join('')}<td class="${tot.zbude >= 0 ? 'pos' : 'neg'}">${nf(tot.zbude)}</td><td></td></tr></tbody></table></div>
      <p class="pa-note">Klikněte na měsíc pro rozpad na Airbnb a Booking a jednotlivé položky. Odškrtnutím položky nahoře ji přestanete odečítat ve sloupci Zbude. Částky v Kč.${uhr ? ' Faktury správy uhrazeny do <b>' + esc(mlabel(uhr)) + '</b>.' : ''}</p>` : '<p class="pa-note">Za zvolené období nejsou data.</p>'}</section>`;
  }

  /* ---------- moje náklady (pravidelné / jednorázové) ---------- */
  const KAT = [['Elektřina', '⚡'], ['Plyn', '🔥'], ['Voda', '💧'], ['Internet', '📶'], ['Fond oprav', '🏢'], ['Nedoplatek', '🧾'], ['Oprava', '🔧'], ['Poškození', '💥'], ['Pojištění', '🛡️'], ['Jiné', '•']];
  const katIc = k => (KAT.find(x => x[0] === k) || ['', '•'])[1];
  function mojeSekce(D) {
    const zz = mojeNaklady(D).map((z, i) => ({ ...z, i })).sort((a, b) => (a.typ === b.typ ? b.mes.localeCompare(a.mes) : a.typ === 'mesicne' ? -1 : 1));
    const mesicne = suma(zz.filter(z => z.typ === 'mesicne' && (!z.do || z.do >= (D.dnes || '').slice(0, 7))));
    const bn = k => k ? ((D.byty.find(b => b.key === k) || {}).nazev || k) : (D.byty.length > 1 ? 'všechny byty' : '');
    const dm = (D.dnes || new Date().toISOString()).slice(0, 7);
    return `<section class="pa-card pa-anchor" id="pa-nak"><div class="pa-cardhead"><h3>Moje náklady</h3>${mesicne ? `<span class="pa-pill">pravidelně ${kc(mesicne)} / měsíc</span>` : ''}</div>
      <p class="pa-note" style="margin:0 0 14px">Energie, internet, opravy a další výdaje, které platíte sami. Odečtou se ve vyúčtování ve sloupci Moje náklady.</p>
      <form id="pa-nkf" class="pa-nkf">
        <div class="pa-seg pa-typ"><button type="button" data-typ="mesicne" class="${ST.nk.typ === 'mesicne' ? 'on' : ''}">Pravidelný měsíčně</button><button type="button" data-typ="jednou" class="${ST.nk.typ === 'jednou' ? 'on' : ''}">Jednorázový</button></div>
        <div class="pa-kat">${KAT.map(([k, ic]) => `<button type="button" data-kat="${k}" class="${ST.nk.kat === k ? 'on' : ''}"><span aria-hidden="true">${ic}</span>${k}</button>`).join('')}</div>
        <div class="pa-nkrow"><label>${ST.nk.typ === 'mesicne' ? 'Od měsíce' : 'Měsíc'}<input type="month" id="nk-mes" value="${dm}" required></label>${ST.nk.typ === 'mesicne' ? `<label>Do měsíce <small>nepovinné</small><input type="month" id="nk-do"></label>` : ''}<label>Částka Kč<input type="number" id="nk-castka" min="1" step="1" inputmode="numeric" placeholder="např. 1 850" required></label>
        ${D.byty.length > 1 ? `<label>Byt<select id="nk-byt"><option value="">Všechny byty</option>${D.byty.map(b => `<option value="${esc(b.key)}">${esc(b.nazev)}</option>`).join('')}</select></label>` : ''}<label class="w">Poznámka<input id="nk-pozn" placeholder="např. záloha ČEZ, výměna baterie"></label></div>
        <div class="pa-nkgo"><button class="btn gold sm" type="submit">Přidat náklad</button><span id="nk-msg" class="pa-hint"></span></div></form>
      ${zz.length ? `<ul class="pa-nklist">${zz.map(z => `<li><span class="ic" aria-hidden="true">${katIc(z.kat)}</span><div><b>${esc(z.kat)}</b> <i class="${z.typ === 'mesicne' ? 'rec' : ''}">${z.typ === 'mesicne' ? 'každý měsíc od ' + esc(mshort(z.mes)) + (z.do ? ' do ' + esc(mshort(z.do)) : '') : esc(mlabel(z.mes))}</i><small>${esc([bn(z.byt), z.pozn].filter(Boolean).join(' · '))}</small></div><b class="c">${kc(z.castka)}</b><button type="button" class="x" data-nkdel="${z.i}" aria-label="Smazat ${esc(z.kat)}">✕</button></li>`).join('')}</ul>` : '<p class="pa-note">Zatím žádné vlastní náklady.</p>'}
      <p class="pa-note" style="font-size:12.5px">Záznamy se ukládají v tomto prohlížeči.</p></section>`;
  }

  /* ---------- PDF faktura za měsíc (tisk z prohlížeče) ---------- */
  function faktura(D, mes) {
    const byty = vybraneByty(D).filter(b => b.radky.find(x => x.mes === mes)); if (!byty.length) return;
    const [Y, M] = mes.split('-').map(Number), duzp = new Date(Y, M, 0).toLocaleDateString('cs-CZ');
    const cislo = mes.replace('-', '') + (byty.length === 1 ? byty[0].key.replace(/\s/g, '').slice(0, 3).toUpperCase() : 'FL');   // stejné číslování jako faktura ve VELÍNu
    let vyn = '', obrat = 0, prov = 0, ukl = 0, pra = 0, ks = 0, ex = 0, exR = '', sazby = new Set();
    byty.forEach(b => { const r = b.radky.find(x => x.mes === mes); obrat += r.obrat; prov += r.provize; ukl += r.uklid || 0; pra += r.prani || 0; ks += r.ks || 0; if (r.sazba != null) sazby.add(r.sazba);
      vyn += `<tr><td>${esc(b.nazev)}</td><td>${kc(r.ab)}</td><td>${kc(r.bk)}</td><td><b>${kc(r.obrat)}</b></td></tr>`;
      (r.extra || []).filter(e => e.castka > 0).forEach(e => { ex += e.castka; exR += `<tr><td>${esc(e.popis || 'Nákup / oprava')}</td><td>1</td><td>${kc(e.castka)}</td></tr>`; }); });
    const prijem = byty.reduce((s, b) => s + ((b.radky.find(x => x.mes === mes).extra || []).filter(e => e.castka < 0).reduce((t, e) => t - e.castka, 0)), 0);
    const kUhr = prov + ukl + pra + ex; const S = D.spravce || {}, O = D.odberatel || {};
    const idb = o => `<b>${esc(o.nazev || o.osoba || '—')}</b>${o.osoba && o.nazev ? '<br>' + esc(o.osoba) : ''}${o.sidlo ? '<br>' + esc(o.sidlo) : ''}${o.ico ? '<br>IČ: ' + esc(o.ico) : ''}${o.dic ? '<br>DIČ: ' + esc(o.dic) : ''}${o.ucet ? '<br>Účet: ' + esc(o.ucet) : ''}`;
    const spl = new Date(); spl.setDate(spl.getDate() + (S.splatnost_dni || 14));
    const css = 'body{font:13px/1.5 Figtree,system-ui,sans-serif;color:#142D26;max-width:760px;margin:24px auto;padding:0 20px}h1{font:800 22px Urbanist,system-ui,sans-serif;margin:0}h2{font-size:12px;margin:22px 0 4px;text-transform:uppercase;letter-spacing:.08em;color:#1F7A4D}.mut{color:#66736C;font-size:12px}.hd{display:flex;justify-content:space-between;border-bottom:3px solid #142D26;padding-bottom:12px}.who{display:flex;gap:28px;margin:16px 0 6px;flex-wrap:wrap}.who>div{flex:1;min-width:220px}.lab{font-size:10px;font-weight:700;letter-spacing:.1em;color:#8A948E;text-transform:uppercase;margin-bottom:3px}.meta{display:flex;gap:24px;flex-wrap:wrap;font-size:12px;margin:8px 0}table{width:100%;border-collapse:collapse;margin-top:6px;font-variant-numeric:tabular-nums}td,th{padding:7px 6px;border-bottom:1px solid #E3E8E4;text-align:right}td:first-child,th:first-child{text-align:left}th{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#8A948E;border-bottom:2px solid #142D26}.tot td{border-top:2px solid #142D26;border-bottom:0;font-weight:800;font-size:17px;padding-top:12px}.ctx{margin-top:18px;background:#EEF5F0;border-radius:10px;padding:12px 14px;font-size:12.5px}.dl{position:fixed;top:14px;right:14px;background:#142D26;color:#fff;border:0;border-radius:999px;padding:11px 18px;font:700 14px system-ui;cursor:pointer}@media print{.dl{display:none}body{margin:0}}';
    const w = window.open('', '_blank'); if (!w) { alert('Prohlížeč zablokoval nové okno. Povolte prosím vyskakovací okna pro bytahost.cz.'); return; }
    w.document.write(`<!doctype html><html lang="cs"><meta charset="utf-8"><title>Faktura ${esc(mlabel(mes))}</title><style>${css}</style><button class="dl" onclick="window.print()">Stáhnout / tisk PDF</button>
      <div class="hd"><div><h1>Faktura za správu</h1><div class="mut">období ${esc(mlabel(mes))} · ${esc(byty.map(b => b.nazev).join(', '))}</div></div><div style="text-align:right"><b>č. ${esc(cislo)}</b><div class="mut">${S.platce_dph ? 'daňový doklad' : 'neplátce DPH'}</div></div></div>
      <div class="who"><div><div class="lab">Dodavatel</div>${idb(S)}</div><div><div class="lab">Odběratel</div>${idb({ nazev: O.nazev || D.jmeno, ico: O.ico, dic: O.dic, sidlo: O.sidlo, ucet: O.ucet })}</div></div>
      <div class="meta"><span>Vystaveno: <b>${new Date().toLocaleDateString('cs-CZ')}</b></span><span>DUZP: <b>${duzp}</b></span><span>Splatnost: <b>${spl.toLocaleDateString('cs-CZ')}</b></span><span>VS: <b>${cislo.replace(/\D/g, '')}</b></span></div>
      <h2>Výnosy za pobyty, přišly vám přímo na účet</h2><table><tr><th>Apartmán</th><th>Airbnb</th><th>Booking</th><th>Obrat</th></tr>${vyn}${byty.length > 1 ? `<tr><td><b>Celkem</b></td><td></td><td></td><td><b>${kc(obrat)}</b></td></tr>` : ''}</table>
      <h2>Fakturované položky</h2><table><tr><th>Položka</th><th>Ks</th><th>Částka</th></tr><tr><td>Odměna za správu (${[...sazby].join('/')} %)</td><td>1</td><td>${kc(prov)}</td></tr>${ukl ? `<tr><td>Úklid apartmánu po odjezdu hostů</td><td>${ks}×</td><td>${kc(ukl)}</td></tr>` : ''}${pra ? `<tr><td>Praní ložního prádla a ručníků</td><td>${ks}×</td><td>${kc(pra)}</td></tr>` : ''}${exR}<tr class="tot"><td>Částka k úhradě</td><td></td><td>${kc(kUhr)}</td></tr></table>
      <div class="ctx">Peníze z Airbnb a Booking vám přišly v plné výši přímo na účet. Po úhradě této faktury vám z obratu zůstává <b>${kc(obrat - kUhr + prijem)}</b>${prijem ? ` (včetně příjmu navíc ${kc(prijem)})` : ''}.</div>
      <p class="mut" style="margin-top:14px">Vystaveno v portálu majitele Byt a host ${new Date().toLocaleDateString('cs-CZ')}. Podklady z Airbnb a Booking.com podle měsíce pobytu hostů.</p></html>`);
    w.document.close();
  }

  /* ---------- hlavní render ---------- */
  function render(D) {
    const root = $('#portal-view'); if (!root) return;
    const all = mesice(D); if (!ST.od) nastavObdobi(D, ST.obd);
    let cur = D.dnes ? D.dnes.slice(0, 7) : all[all.length - 1]; if (!all.includes(cur)) cur = all[all.length - 1];
    if (!ST.calByt || !D.byty.some(b => b.key === ST.calByt)) ST.calByt = ST.byt !== 'all' ? ST.byt : D.byty[0].key;
    const list = radkyObdobi(D);
    const T = list.reduce((t, x) => { t.obrat += x.obrat; t.zbude += x.zbude; t.n += x.occN; t.d += x.occD; return t; }, { obrat: 0, zbude: 0, n: 0, d: 0 });
    const occ = T.d ? Math.round(T.n / T.d * 100) : 0;
    // minulý měsíc = měsíc před dneškem (když chybí, poslední uzavřený)
    const ST0 = { od: ST.od, do: ST.do }; ST.od = all[0]; ST.do = all[all.length - 1]; const vse = radkyObdobi(D); ST.od = ST0.od; ST.do = ST0.do;
    const pm = addM((D.dnes || '').slice(0, 7) || addM(cur, 1), -1); const minuly = vse.find(x => x.mes === pm) || vse.filter(x => !x.bezici).pop(); const predtim = minuly && vse.find(x => x.mes === addM(minuly.mes, -1));
    const hodnota = x => x ? (ST.cisty ? x.zbude : x.obrat) : 0;
    const zmena = minuly && predtim && hodnota(predtim) ? Math.round((hodnota(minuly) - hodnota(predtim)) / Math.abs(hodnota(predtim)) * 100) : null;
    const per = list.length ? (list.length === 1 ? mlabel(list[0].mes) : mshort(list[0].mes) + ' – ' + mshort(list[list.length - 1].mes)) : '—';
    const opt = sel => all.map(m => `<option value="${m}" ${sel === m ? 'selected' : ''}>${esc(mlabel(m))}</option>`).join('');
    root.innerHTML = `
    <div class="pa-head"><div><div class="pa-kick">${esc(D.spravce && D.spravce.nazev || 'Byt a host')} · data k ${esc(D.gen || D.dnes || '')}</div><h2>${esc(D.jmeno)}</h2></div></div>
    <nav class="pa-nav" aria-label="Sekce portálu"><a href="#pa-prehled">Přehled</a><a href="#pa-rez">Rezervace</a><a href="#pa-kal">Kalendář</a><a href="#pa-vyu">Vyúčtování</a><a href="#pa-nak">Moje náklady</a><a href="#pa-blokcard">Blokace</a></nav>
    <div class="pa-filters pa-anchor" id="pa-prehled">${D.byty.length > 1 ? `<div class="pa-seg" id="pa-byt"><button type="button" class="${ST.byt === 'all' ? 'on' : ''}" data-v="all">Všechny byty</button>${D.byty.map(b => `<button type="button" class="${ST.byt === b.key ? 'on' : ''}" data-v="${esc(b.key)}">${esc(b.nazev)}</button>`).join('')}</div>` : ''}
      <div class="pa-seg" id="pa-obd"><button type="button" class="${ST.obd === 'rok' ? 'on' : ''}" data-v="rok">Letos</button><button type="button" class="${ST.obd === '12' ? 'on' : ''}" data-v="12">12 měsíců</button><button type="button" class="${ST.obd === 'minuly' ? 'on' : ''}" data-v="minuly">Minulý rok</button><button type="button" class="${ST.obd === 'vse' ? 'on' : ''}" data-v="vse">Vše</button></div>
      <div class="pa-range"><label>Od<select id="pa-od">${opt(ST.od)}</select></label><label>Do<select id="pa-do">${opt(ST.do)}</select></label></div></div>
    <div class="pa-kpi">
      <div class="hi"><div class="pa-kt"><span>${ST.cisty ? 'Čistý zisk' : 'Hrubý příjem'} · ${esc(per)}</span><div class="pa-cg" role="radiogroup" aria-label="Čistý nebo hrubý"><button type="button" role="radio" aria-checked="${ST.cisty}" data-cisty="1" class="${ST.cisty ? 'on' : ''}">čistý</button><button type="button" role="radio" aria-checked="${!ST.cisty}" data-cisty="0" class="${ST.cisty ? '' : 'on'}">hrubý</button></div></div><b>${kc(ST.cisty ? T.zbude : T.obrat)}</b><small>${ST.cisty ? 'po provizi a všech zaškrtnutých nákladech' : 'příjem z Airbnb a Booking před náklady'}</small></div>
      <div><span>${minuly ? 'V ' + esc(MON6[+minuly.mes.slice(5, 7) - 1]) + ' jste vydělali' : 'Minulý měsíc'}</span><b>${minuly ? kc(hodnota(minuly)) : '—'}</b><small>${ST.cisty ? 'čistý zisk' : 'hrubý příjem'}${zmena != null ? ` · <span class="${zmena >= 0 ? 'up' : 'dn'}">${zmena >= 0 ? '+' : '−'}${Math.abs(zmena)} % proti ${esc(MON6[+predtim.mes.slice(5, 7) - 1])}</span>` : ''}</small></div>
      <div><span>Obsazenost · ${esc(per)}</span><b>${occ} %</b><small>${nf(T.n)} nocí z ${nf(T.d)}</small></div>
    </div>
    ${grafy(list)}
    ${rezSekce(D, vybraneByty(D), cur)}
    ${kalendar(D, cur)}
    ${vyuctovani(D, list)}
    <div class="pa-grid2">
      ${mojeSekce(D)}
      <section class="pa-card pa-anchor" id="pa-blokcard"><h3>Rezervovat byt pro sebe</h3><p class="pa-note">Zadejte termín, kdy chcete byt pro sebe nebo rodinu. Zablokujeme ho v kalendářích Airbnb i Booking a potvrdíme do 24 hodin. Už potvrzené rezervace hostů zůstávají. Žádost hned uvidíte v rezervacích jako „čeká“.</p>
        <form id="pa-blok" class="form" style="grid-template-columns:1fr 1fr"><div><label for="pb-byt">Byt</label><select id="pb-byt">${D.byty.map(b => `<option value="${esc(b.key)}">${esc(b.nazev)}</option>`).join('')}</select></div><div><label for="pb-od">Od</label><input type="date" id="pb-od" required></div><div><label for="pb-do">Do</label><input type="date" id="pb-do" required></div><div><label for="pb-pozn">Poznámka</label><input id="pb-pozn" placeholder="např. rodina, 2 osoby"></div><div class="full"><button class="btn gold" type="submit">Poslat žádost o blokaci</button><div id="pb-msg"></div></div></form>
        ${(D.zprava && (D.zprava.text || typeof D.zprava === 'string')) ? `<h3 style="margin-top:22px">Zpráva od správce</h3><p>${esc(D.zprava.text || D.zprava)}</p>` : ''}
        ${D.byty.some(b => (b.odkazy || []).length) ? `<h3 style="margin-top:22px">Odkazy</h3><div class="pa-links">${D.byty.flatMap(b => (b.odkazy || []).filter(o => /^https?:/.test(o.u)).map(o => `<a class="chip" href="${esc(o.u)}" target="_blank" rel="noopener">${esc(o.t)}</a>`)).join('')}</div>` : ''}
      </section>
    </div>`;
    bind(D, cur);
  }

  function bind(D, cur) {
    const R = () => { const y = $('#page-portalapp') ? $('#page-portalapp').scrollTop : 0; render(D); if ($('#page-portalapp')) $('#page-portalapp').scrollTop = y; };
    $$('.pa-nav a').forEach(a => a.onclick = e => { e.preventDefault(); const t = $(a.getAttribute('href')); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    $$('#pa-byt button').forEach(b => b.onclick = () => { ST.byt = b.dataset.v; if (ST.byt !== 'all') ST.calByt = ST.byt; R(); });
    $$('#pa-obd button').forEach(b => b.onclick = () => { if (b.dataset.v === 'vse') { const a = mesice(D); ST.obd = 'vse'; ST.od = a[0]; ST.do = a[a.length - 1]; } else nastavObdobi(D, b.dataset.v); R(); });
    const rng = () => { let a = $('#pa-od').value, b = $('#pa-do').value; if (a > b) [a, b] = [b, a]; ST.od = a; ST.do = b; ST.obd = 'vlastni'; R(); };
    $('#pa-od').onchange = rng; $('#pa-do').onchange = rng;
    $$('[data-cisty]').forEach(b => b.onclick = () => { ST.cisty = b.dataset.cisty === '1'; R(); });
    const rm0 = () => ST.rm || ((D.dnes || '').slice(0, 7) || cur); $('#pa-rm-prev').onclick = () => { ST.rm = addM(rm0(), -1); R(); }; $('#pa-rm-next').onclick = () => { ST.rm = addM(rm0(), 1); R(); }; $('#pa-rstav').onchange = e => { ST.rstav = e.target.value; R(); };
    const cm0 = () => ST.cal || ((D.dnes || '').slice(0, 7) || cur); $('#pa-cal-prev').onclick = () => { ST.cal = addM(cm0(), -1); R(); }; $('#pa-cal-next').onclick = () => { ST.cal = addM(cm0(), 1); R(); };
    $$('#pa-calbyt button').forEach(b => b.onclick = () => { ST.calByt = b.dataset.v; R(); });
    $$('[data-col]').forEach(c => c.onchange = () => { ST.cols[c.dataset.col] = c.checked; R(); });
    $$('.pa-mo').forEach(tr => tr.onclick = e => { if (e.target.closest('.pa-pdf')) return; ST.open[tr.dataset.mo] = !ST.open[tr.dataset.mo]; const det = tr.nextElementSibling; if (det && det.classList.contains('pa-det')) { det.hidden = !ST.open[tr.dataset.mo]; tr.classList.toggle('open', ST.open[tr.dataset.mo]); } });
    $$('.pa-pdf').forEach(b => b.onclick = () => faktura(D, b.dataset.fakt));
    $('#pa-rezbtn').onclick = () => { const f = $('#pa-blok'); f.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => $('#pb-od').focus(), 400); };
    // moje náklady
    $$('.pa-typ button').forEach(b => b.onclick = () => { ST.nk.typ = b.dataset.typ; R(); });
    $$('.pa-kat button').forEach(b => b.onclick = () => { ST.nk.kat = b.dataset.kat; $$('.pa-kat button').forEach(x => x.classList.toggle('on', x === b)); });
    $('#pa-nkf').onsubmit = e => { e.preventDefault(); const castka = +$('#nk-castka').value, mes = $('#nk-mes').value; const msg = $('#nk-msg');
      if (!mes || !(castka > 0)) { msg.textContent = 'Vyplňte měsíc a částku.'; return; }
      const z = { typ: ST.nk.typ, kat: ST.nk.kat, mes, castka, pozn: $('#nk-pozn').value.trim(), byt: $('#nk-byt') ? $('#nk-byt').value : '' };
      if (z.typ === 'mesicne' && $('#nk-do') && $('#nk-do').value) z.do = $('#nk-do').value < mes ? mes : $('#nk-do').value;
      const zz = mojeNaklady(D); zz.push(z); if (!lsSet('bh_naklady_' + D.klic, zz)) { msg.textContent = 'Uložení se nepodařilo, prohlížeč blokuje úložiště.'; return; }
      R(); const m2 = $('#nk-msg'); if (m2) m2.textContent = 'Přidáno: ' + z.kat + ' ' + kc(castka) + '.'; };
    $$('[data-nkdel]').forEach(b => b.onclick = () => { const zz = mojeNaklady(D); zz.splice(+b.dataset.nkdel, 1); lsSet('bh_naklady_' + D.klic, zz); R(); });
    // blokace
    $('#pa-blok').onsubmit = async e => { e.preventDefault(); const msg = $('#pb-msg'); const od = $('#pb-od').value, doo = $('#pb-do').value; if (!od || !doo || doo <= od) { msg.innerHTML = '<div class="msg bad">Zadejte termín Od a Do.</div>'; return; } const ok = window.BH && window.BH.sb ? await window.BH.sb('web_blokace', { klient: D.klic, byt_key: $('#pb-byt').value, od, do_: doo, pozn: $('#pb-pozn').value, jmeno: D.jmeno }) : false; msg.innerHTML = `<div class="msg ${ok ? 'ok' : 'bad'}">${ok ? 'Žádost odeslána, potvrdíme do 24 hodin.' : 'Odeslání se nepodařilo, zavolejte nám prosím.'}</div>`; if (ok) { const l = lokalniBlokace(D); l.push({ byt: $('#pb-byt').value, od, do: doo, pozn: $('#pb-pozn').value, t: Date.now() }); lsSet('bh_blok_' + D.klic, l.slice(-20)); ST.rm = od.slice(0, 7); ST.rstav = 'all'; e.target.reset(); render(D); $('#pa-rez').scrollIntoView({ behavior: 'smooth', block: 'start' }); } };
  }
  window.BH_PORTAL = { extractData, render };
})();
