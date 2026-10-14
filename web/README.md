# bytahost.cz — web Byt a host (B&H)

Statický web bez buildu: `index.html` + `assets/app.js` + `data/byty.js`. Otevřít přes lokální server (`py -3 -m http.server 8787`), ne přímo ze souboru (fetch map/fontů).

## Obnova dat (fotky, ceny, dostupnost)
1. `_ridici-stredisko/scraper`: `node ab_portfolio_scan.js --od=<dnes> --do=<+12 měs> --out=ab-portfolio-cal-155-po.json --jen=...` (hlavní účet 9222), `--port=9234 ... -po-korunni.json` (korunní), `... -po-havelska.json`
2. `_zdroje/ab_fotky.js` (fotky + kapacity z Airbnb), `_zdroje/stahni_fotky.py --n=8`, `_zdroje/ab_vybaveni.js` (vybavení) — jen při změně inzerátů
3. `_zdroje/build_data.py` → `data/byty.js` (přímá cena = Airbnb cena × 0,90, zaokrouhleno na 10 Kč; město 50 Kč/dosp./noc; úklid z `ab_fee_settings.js`)

## Rezervace a poptávky
Formuláře zapisují přes Supabase REST (anon INSERT) do tabulek `web_rezervace` a `web_poptavka` (projekt velin, migrace `scraper/db_migrace_web.js`). Platba: po potvrzení se posílá platební odkaz (Stripe) nebo převod — automatizace odkazu zatím není.

## Skryté byty
`SKRYTE` v `build_data.py` (Ve Smečkách, Opatovická — nezveřejněné inzeráty), `BEZ_REZERVACE` (Anděl — zavřený kalendář).

## Nasazení
Náhled: kopie do `_ridici-stredisko/dashboard/_deploy/web/` → `scripts/deploy.ps1` → https://anticmovie.github.io/velin/web/ . Produkce bytahost.cz: nahrát obsah složky (bez `_zdroje`) na hosting nebo přesměrovat DNS na GitHub Pages.

## v3 (12. 10. 2026) – moderní design
- Písma Urbanist (nadpisy) + Figtree (text), bílý podklad, zelená #142D26 + zlatá #D3BD8A, zaoblení 22–28 px, tlačítka Airbnb (#FF385C) a Booking (#003B95) v jejich barvách.
- Hero video + pilulkový vyhledávač, pruh statistik s počítadly a hodnocením Airbnb/Booking, filtry podle čtvrti, karty s fotokaruselem (8 fotek, scroll-snap), přeškrtnutá cena Airbnb vs. přímá cena.
- Sekce recenzí = skutečné recenze z našich Airbnb inzerátů: `_zdroje/ab_recenze.js` (Chrome 9222, CDP) → `data/recenze.json` + `data/recenze.js`; překlady: `_zdroje/merge_preklady.py --dump` vypíše texty k překladu, překlady do `data/recenze-preklady.json`, pak `merge_preklady.py` sloučí (text_cs / text_en / lang). Google gtx (`preloz_recenze.py`) vrací 429, nepoužívat.
- Detail bytu: Google mapa (iframe embed, přibližné souřadnice na 3 desetinná místa), galerie (desktop mřížka / mobil posuvný pás), lepivý rezervační panel s tlačítky Airbnb a Booking.com, recenze daného bytu.
- Animace: hero (rise + blur), odhalování při scrollu (`.rv` přes IntersectionObserver + záložní kontrola při scrollu; bez JS je vše viditelné), počítadla, hover zoom fotek; `prefers-reduced-motion` vše vypne.
- Testovací screenshoty: `_ridici-stredisko/scraper/out/_v3_shots.js` (desktop + mobil); lokální server `python -m http.server 8787` občas shodí 21MB video – v testech blokovat `hero-loop.mp4`.

## Majitelé: karta, rychlý formulář, přihlášení do portálu (12. 10. 2026 večer)
- Pointa „15 % a v tom je všechno“: nabídková karta na úvodu (8 položek v ceně + poznámka: správci v Praze 15–20 % + DPH; zdroje: Blahobyty 20 % + DPH dle ceníku, Seven Keys 15 % self check-in / 20 % osobní předání), kalkulačka se srovnáním s 20 % + DPH (čistý 75,8 % vs. náš 85 %), „Co děláte vy“, dva modely (15 % / garantovaný nájem pro vybrané byty), FAQ majitelů (`OFAQ` v app.js).
- Rychlý formulář = jméno + telefon (+ nepovinně byt) → `web_poptavka` (email ''), vedle animované tlačítko „Zavolejte nám“ (`.btn.call`, pulzující prstenec + kývající sluchátko; vypnuto při `prefers-reduced-motion`). Stejné tlačítko je v hlavičce stránky jako „Správa bytů · 15 %“ (`.own-cta`).
- **Přihlášení do portálu** (`#/login`): číslo klienta + heslo. Čísla klientů jsou v `data/config.js` → `ucty` (1001 Korunní/Pražský dům, 1002 Harfa, 1003 Havelská, 1004 Florenc, 1005 Vlastislavova). Heslo = PIN, kterým je zašifrovaná stránka `majitel-<key>.html` ve VELÍNu (encrypt_dashboard.js, AES-256-GCM + PBKDF2). Web stáhne zašifrovanou stránku z GitHub Pages (CORS `*`), dešifruje ji v prohlížeči (WebCrypto) a zobrazí v celoobrazovkovém iframe (`#page-portalapp`) s lištou a tlačítkem Odhlásit. Špatné heslo = dešifrování selže = „Špatné číslo klienta nebo heslo“. „Zapamatovat“ ukládá přihlášení do localStorage (`bh_portal`), stejně jako dosud PIN gate.
- Vlastní heslo pro každého majitele: stačí v denním refreshi šifrovat `majitel-<key>.html` jiným PINem (build_portal_majitele.py / encrypt_dashboard.js) a sdělit ho majiteli; web se nemění.
- Další fáze („vnitřní systém jako Blahobyty“): nahradit iframe vlastní aplikací portálu (Supabase auth podle čísla klienta, data per byt, fotky po úklidu, blokace vlastních pobytů).

## Produkce bytahost.cz (14. 10. 2026)
- Hosting WEDOS LowCost (obj. 3225116811), docroot `/www`, upload: `MSYS_NO_PATHCONV=1 py -3 _zdroje/wedos_upload.py --plain --root=/www` (plain FTP, FTPS padá na TLS reuse).
- DNS: v client.wedos.com → Doména bytahost.cz → „Nastavení DNS záznamů služby“ → Webhosting (A @ a * → 89.221.213.17). Dřív mířilo na WEDOS Protection 185.8.237.11 (404/429).
- HTTPS: Webhosting → HTTPS → „Rychlé nastavení“ Let's Encrypt (bytahost.cz + www), obnovuje se samo.
- Pozor: doména i webhosting expirují 6. 11. 2026, prodloužit v portálu.

## Portál majitele v1 (14. 10. 2026) – vlastní UI
- `assets/portal.js`: po přihlášení (číslo klienta + heslo) web dešifruje stránku VELÍNu `majitel-<key>.html`, vytáhne z ní `const D = {...}` (byty → měsíční řádky obrat/provize/úklid/výplata/obsazenost/dny, benchmark, náklady majitele, odkazy, zpráva správce) a vykreslí vlastní portál: KPI (obrat, výplata, odměna, obsazenost), grafy po měsících, kalendář obsazenosti (Booking/Airbnb/úklid), tabulka vyúčtování, vlastní náklady, žádost o blokaci termínu (Supabase `web_blokace` → push přes `web_rezervace_watch.js`), odkazy. Filtry: byt, období (12 měs./letos/minulý rok/vše/měsíc). Fallback: když data nejdou vytáhnout, zobrazí se původní stránka v iframe.
- Data se obnovují s denním refreshem VELÍNu (build_portal_majitele.py); portál je read-only + žádosti.

## Rezervace v portálu + rezervace majitele (14. 10. 2026)
- `build_portal_majitele.py` → `rezervace` per byt: Booking ze skenů `scraper/out/booking-reservations-*.json` (hid→byt přes BK_HID; host, osoby, termín), Airbnb z `airbnb-rezervace.json` (termín, částka, osoby; bez jmen), blokace majitelů z `scraper/out/web-blokace.json` (`node blokace_export.js`, běží v refreshi před portálem). Stav se počítá v portálu podle data: ukončeno / probíhá / potvrzeno; majitel: čeká / potvrzeno.
- Portál: sekce „Rezervace“ po měsících (‹ ›, filtr stavů, Moje pobyty), tlačítko „+ Rezervovat byt“ → formulář; po odeslání se žádost hned ukáže jako „čeká“ (localStorage), správci přijde push. Potvrzení: `node blokace_export.js --potvrdit=<id>` (nebo `--zamitnout=`), pak zablokovat termín v Airbnb/Booking (zatím ručně) a další refresh portálu ukáže „potvrzeno“.
- Mobil (iOS WebKit otestováno): datumová pole s rámečkem a nápovědou „Vyberte datum“, menu overlay bez backdrop-filter pasti, tabulka rezervací se na mobilu skládá do karet.
