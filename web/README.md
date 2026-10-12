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
