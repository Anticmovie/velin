---
tags: [velin, apartmany, ceny, mechanika, booking, airbnb, dph]
stav: zivy
aktualizovano: 2026-06-19
---

# Cenová mechanika Airbnb vs Booking — jak to doopravdy funguje

> Klíčový poznatkový dokument pro cenotvorbu. Zdroj pravdy v strojové podobě je
> `data/byty.json` → `_cenovy_model`. Tento dokument je lidsky čitelný výklad.
> Dostupné na GitHubu (repo velin-mozek), v Obsidianu (vault `_mozek`) i lokálně
> (kopie u cenových enginů v `apartmany-boti/_local/pricelabs/`).

## 1. Provize a DPH (kdo je majitel daňově)

Majitel **NENÍ plátce DPH** (podniká přes firmy bez DPH), ALE je **identifikovaná
osoba v EU** → z provizních faktur Booking/Airbnb musí odvést **21 % DPH** (reverse
charge) a **nemůže si ji odečíst** → je to reálný náklad. Proto:

| Platforma | Základní provize | + DPH 21 % | **Efektivní náklad hosta(host)** |
|---|---|---|---|
| **Booking** | 15 % | × 1,21 | **18,15 %** |
| **Airbnb (hostitel)** | 3 % | × 1,21 | **3,63 %** |

→ **Airbnb je pro nás mnohem levnější kanál** (3,63 % vs 18,15 %). Kde to jde,
směřovat hosta na Airbnb. **NEpoužívat na Airbnb channel manager** — skočí na 15 %.
Kurz pro přepočty: **24,2 Kč/€**.

## 2. Finální cena hosta — JEDINÉ správné srovnání

Platformy zobrazují cenu jinak. Porovnávat (mezi sebou i s konkurencí) se smí jen
**finální cena, kterou zaplatí host**:

### Booking
- Hostovi ukazuje **rovnou finální cenu** (vč. úklidu, vše v jednom).
- Host (my) dostane: `cena_listing × (1 − 0,1815)`.
- **Naskenované ceny konkurence z Bookingu = už finální cena hosta** (netřeba nic přičítat).

### Airbnb (ověřeno z reálných příkladů „Výdělky → Host zaplatil")
Host platí: **základ × počet nocí + úklid + servisní poplatek hosta**.
Servisní poplatek hosta = **~20 % ze (základ + úklid)**.

| Příklad | Základ/noc | Nocí | Úklid | Servis hosta | **Host zaplatil** | Finální cena/noc |
|---|--:|--:|--:|--:|--:|--:|
| 1 | 1 290,67 | 3 | 250 | 831,55 (20,2 %) | **4 953,55 Kč** | ~1 651 Kč |
| 2 | 2 367,00 | 5 | 250 | 2 398,29 (19,8 %) | **14 483,29 Kč** | ~2 897 Kč |
| 3 | 1 155,35 | 13 | 350 | 3 100,29 (20,2 %) | **18 469,79 Kč** | ~1 421 Kč |

- **Vzorec finální ceny (Airbnb):** `(základ × noci + úklid) × 1,20`
- Host (my) dostane: `(základ × noci + úklid) × (1 − 0,0363)`
- ⚠️ **Naši Airbnb cenu nutno „groslovat" (+ úklid + 20 %)**, než ji srovnáme s finální
  cenou konkurence z Bookingu. Jinak srovnáváme jablka s hruškami.

> **Pozor na chybu:** historická čísla v `vydelky.md` jsou Airbnb **NET roční průměr**
> (co nám přišlo), NE finální cena hosta. Nesrovnávat přímo s GROSS cenami konkurence.

## 3. Úklid

- Účtuje se zvlášť, **liší se per byt a per platforma** (z příkladů 250 / 250 / 350 Kč).
- Vstupuje do finální ceny hosta na obou platformách.

## 4. Cenotvorba podle počtu osob (occupancy pricing)

Cena závisí na počtu hostů. **Liší se per byt** (i kapacitou i příplatky):

- **Booking:** základní cena obvykle **do 2 osob**; **3. osoba +10 %**, **4. osoba +20 %**
  (orientačně, každý byt nastaven jinak).
- **Airbnb:** základní cena **do 2 osob**; **každá další osoba +250–300 Kč/noc**
  (orientačně, každý byt jinak).

### Kapacita našich bytů (Airbnb scan 2026-06-19)
| Kapacita | Byty |
|---|---|
| 2 osoby | 28 |
| 3 osoby | 29, 205, 616, baranova |
| 4 osoby | basilej, 202, slavojova, jatecni, v haji, vlastislavova |
| 6 osob | 421, Florenc 1, Florenc 2 |

> Všechny mají na Airbnb „1 ložnici" (oddělená spací část). Segment našeho portfolia
> = studio/1+kk; Florenc 1/2 jsou 2KK. Booking neumí studio vs apartmán rozlišit →
> konkurenci řešíme segmentovaně.

## 5. Co z toho plyne pro cenového stratéga
1. Doporučenou cenu počítat jako **finální cenu hosta** a tu srovnávat s trhem.
2. Pro Airbnb zadávat **základní sazbu** tak, aby `(základ + úklid) × 1,20 ≈ cílová finální cena`.
3. Zohlednit **kapacitu + příplatky za osoby** (jiná cena pro 2 vs plný počet).
4. Preferovat Airbnb (nižší náklad), ale držet i Booking konkurenceschopný.

Souvisí: [[byty.json]] (`_cenovy_model`), `konkurence.json`, cenový stratég
(`apartmany-boti/_local/pricelabs/cenovy_strateg.py`).
