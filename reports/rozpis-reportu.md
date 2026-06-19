---
tags: [velin, apartmany, reporty, schedule, rozpis]
stav: zivy
aktualizovano: 2026-06-19
---

# Rozpis reportů — kdy co chodí

> Zdroj pravdy, který report/sken běží kdy a pro koho. Reportů je hodně → tady se v nich
> orientuješ. **Princip: shluknout vše kolem 8:00** (probouzíš se), ať to není rozházené.
> Výjimka = příjezdy (mají vlastní logiku 18:00 + 9:00).

## Denní časová osa

| Čas | Report | Co obsahuje | Stav |
|---|---|---|---|
| **08:00** | 🌅 **RANNÍ DIGEST** (spojený) | volná okna + urgentní ceny, obsazenost, změny profilů; (po) konkurence; (1. v měs.) výdělky | cíl spojit |
| **09:00** | 🛬 **Příjezdy DNES** | kdo dnes přijíždí + čas (upřesněno) → **primárně spustit úklid dřív** | upravit |
| **18:00** | 🛬🧹 **Příjezdy ZÍTRA + úklid** | náhled zítřejších příjezdů + **rozpis úklidu na 3–5 dní** | upravit |

### Proč příjezdy 18:00 + 9:00 (ne ráno 8:00)
Příklad: příjezd 20.6. → hostovi jde dotaz 19.6. v 8:00, ale **kdo kdy přijede se většinou zjistí
až 20.6. ráno**. Proto:
- **18:00** = náhled na zítřek (co už víme).
- **9:00 ten den pro ten den** = upřesnění časů → aby šel **úklid co nejdřív**.

## Frekvence per report

| Report | Frekvence | Čas | Automat? |
|---|---|---|---|
| Dostupnost (iCal: volná okna, orphan) | 3× denně | 7 / 13 / 19 h | ✅ bez loginu |
| Ranní digest (ceny + obsazenost + profil) | denně | 08:00 | částečně |
| Příjezdy dnes | denně | 09:00 | ✅ (Gmail) |
| Příjezdy zítra + úklid (3–5 dní) | denně | 18:00 | ✅ (Gmail/iCal) |
| Naše ceny + urgentní konkurence | denně | v rámci 08:00 digestu | login (CDP) |
| Plný sken konkurence (154) | 1–2× týdně | po, do ranního digestu | login |
| Hodnocení (Booking+Airbnb) | týdně | po, do ranního digestu | login |
| Výdělkový žebříček | měsíčně | 1. v měsíci, do digestu | čte bázi |

## Princip konsolidace
- **Jeden ranní digest v 8:00** místo X samostatných zpráv — sekce uvnitř jedné Telegram zprávy
  (ceny/volná okna · obsazenost · konkurence (po) · výdělky (1. v měs.)).
- Týdenní věci (konkurence, hodnocení) → **zařadit do pondělního ranního digestu**, ne zvlášť.
- Měsíční (výdělky) → do digestu 1. dne v měsíci.
- Příjezdy/úklid zůstávají samostatné kvůli vlastnímu načasování (18:00 / 9:00).

## Úklid — proti spamu v historii (živá jedna zpráva)
Problém: úklidový report 2×/den zaplňuje historii duplicitami.
Cíl: v historii zůstává jen **poslední aktuální** rozpis (4 dny dopředu, dny jdoucí po sobě), ne hromada kopií.

**Řešení A (doporučeno) — edit jedné zprávy:** bot drží JEDNU úklidovou zprávu (ideálně připnutou),
každý běh ji přes Telegram `editMessageText` přepíše aktuálním rozpisem. 2 běhy/den zůstávají, ale jen tiše updatují.
- Nutné: uložit `message_id` poslední zprávy (n8n static data / stavový soubor). Při 1. běhu `sendMessage`, dál `editMessageText`.
- Gotcha: `editMessageText` selže když je text identický („message is not modified") → ošetřit (catch / přidat čas updatu).
- Fallback: když edit selže (zpráva smazaná), pošli novou a ulož nové `message_id`.

**Řešení B (alternativa) — smazat starou + poslat novou:** `deleteMessage` na předchozí `message_id`, pak `sendMessage`.
Čisté, ale problikne notifikace.

### DŮLEŽITÉ — zachovat reálnou historii (schváleno A + tohle)
Editovat/mazat se smí **jen opakované PŘEDPOVĚDI budoucích dnů**. **Reálně proběhlé úklidy a příjezdy
zůstávají v historii** jako trvalý záznam.
- **Budoucí dny (předpověď, 4 dny dopředu):** jedna živá editovaná zpráva (řešení A) — bez duplicit.
- **Proběhlý den (realita):** jakmile den uplyne, jeho skutečný úklid + příjezd se **zafixuje**
  (samostatná zpráva, už se needituje ani nemaže). Historie = jen reálné minulé dny, ne staré předpovědi.
- Mechanika: každé ráno „uzavřít včerejšek" → trvalá zpráva „✅ <datum>: úklid byty …, příjezdy …",
  živá předpovědní zpráva pak ukazuje jen dnešek..+4 dny.
- Volitelně i log do vaultu (`_mozek`) pro datovou vrstvu / pozdější analýzu obsazenosti.

→ Implementace = úprava n8n workflow **UKLID** (uložení/čtení `message_id` živé zprávy + „uzavření" včerejška + edit node). Produkce → až po ✓.

## Co je potřeba postavit (až po ✓)
1. **Ranní digest agregátor** — spojí výstupy cenového/obsazenostního/profilového do 1 zprávy v 8:00.
2. **Úprava příjezdového bota** — z 8:00 na **18:00 + 9:00**, den-pro-den upřesnění + dřívější trigger úklidu.
3. **Scheduler vrstvy 1 (iCal 3×/den)** — bez loginu, plně automatický.
4. **Úklid: edit jedné zprávy** (řešení A výše) — n8n UKLID workflow, proti spamu v historii.

Souvisí: [[cenova-mechanika-airbnb-booking]], [[prijezdy-bot-princip]], [[cenovy-agent-pricelabs]],
úklidový bot (`apartmany-boti`), [[booking-datova-vrstva]].
