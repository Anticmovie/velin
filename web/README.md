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
