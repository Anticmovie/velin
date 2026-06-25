window.DASHBOARD_DATA = {
    "generated":  "2026-06-26 00:05",
    "summary":  {
                    "total":  5,
                    "local":  5,
                    "external":  0
                },
    "chief":  {
                  "id":  "velitel",
                  "name":  "Velitel",
                  "role":  "Hlavní agent — denní souhrn na Telegram",
                  "job":  "Jednou denně sebere výstupy všech agentů a pošle na Telegram souhrn: co kdo dnes udělal, co postavil, co sám opravil a v čem se ekosystém rozšířil.",
                  "interval":  "denně 20:00",
                  "color":  "#facc15",
                  "emoji":  "👑",
                  "chat":  "DM 1436651098"
              },
    "agents":  [
                   {
                       "id":  "adam",
                       "name":  "Adam",
                       "role":  "Strazce Gitu a lovec vylepseni",
                       "specialty":  "Sleduje stav repozitare: necommitnute zmeny, nepushnute vetve, jak moc jsi napred/pozadu.",
                       "job":  "Hlída git stav a periodicky prochází projekty: navrhuje co commitnout, co je rozdělané a co by se dalo do projektů doplnit nebo vylepšit.",
                       "interval":  "denně",
                       "color":  "#2563eb",
                       "accent":  "#3b82f6",
                       "emoji":  "🔵",
                       "dimension":  "git"
                   },
                   {
                       "id":  "klara",
                       "name":  "Klara",
                       "role":  "Hlidacka zavislosti a bezpecnosti",
                       "specialty":  "Kontroluje balicky a lockfiles. Pozdeji: zastarale a zranitelne zavislosti (npm audit, pip).",
                       "job":  "Spouští npm audit / kontrolu balíčků, hlásí zranitelnosti a zastaralé závislosti a navrhuje bezpečné upgrady.",
                       "interval":  "2x týdně",
                       "color":  "#7c3aed",
                       "accent":  "#a855f7",
                       "emoji":  "🟣",
                       "dimension":  "deps"
                   },
                   {
                       "id":  "viktor",
                       "name":  "Viktor",
                       "role":  "Inzenyr buildu a testu",
                       "specialty":  "Hlida, jestli projekt umi buildit a ma testy. Pozdeji: realne spusteni buildu a testu.",
                       "job":  "Spouští buildy a testy, hlásí co je rozbité a navrhuje (a píše) chybějící testy, aby projekty držely zelené.",
                       "interval":  "denně / při změně",
                       "color":  "#ea580c",
                       "accent":  "#f97316",
                       "emoji":  "🟠",
                       "dimension":  "build"
                   },
                   {
                       "id":  "tereza",
                       "name":  "Tereza",
                       "role":  "Lovkyne ukolu",
                       "specialty":  "Sbira TODO, FIXME a HACK napric zdrojaky, aby ti neuteklo, co je rozdelane.",
                       "job":  "Sbírá TODO/FIXME/HACK napříč projekty, třídí podle priority a navrhuje, co dořešit jako první.",
                       "interval":  "denně",
                       "color":  "#ca8a04",
                       "accent":  "#eab308",
                       "emoji":  "🟡",
                       "dimension":  "todos"
                   },
                   {
                       "id":  "nina",
                       "name":  "Nina",
                       "role":  "Dozorci provozu",
                       "specialty":  "Hlida hostovane sluzby, ktere nejsou jen slozka na disku: Railway, n8n, Telegram boti, Cowork.",
                       "job":  "Hlídá hostované služby a workflow živě (n8n API + watchdog), hlásí výpadky a stav provozních agentů.",
                       "interval":  "průběžně",
                       "color":  "#16a34a",
                       "accent":  "#22c55e",
                       "emoji":  "🟢",
                       "dimension":  "ops"
                   },
                   {
                       "id":  "usage",
                       "name":  "Usage",
                       "role":  "Strazce limitu Claude tokenu",
                       "specialty":  "Cte ~/.claude/projects/**/*.jsonl a pocita spotrebu tokenu v okne 5h (session) a 7d (weekly) vcetne breakdown po modelech.",
                       "job":  "Kazdych 30 minut zkontroluje spotrebu tokenu, posle Telegram alert kdyz previs 70% (warn) nebo 90% (critical) limitu. Pri kalibraci dopocita absolutni stropy z procentualnich hodnot z /model.",
                       "interval":  "kazdych 30 min",
                       "color":  "#0891b2",
                       "accent":  "#06b6d4",
                       "emoji":  "📊",
                       "dimension":  "usage"
                   }
               ],
    "businesses":  [
                       {
                           "id":  "apartmany",
                           "name":  "Apartmány / pronájem",
                           "emoji":  "🏠",
                           "color":  "#0ea5e9",
                           "agents":  [
                                          {
                                              "id":  "uklidovy",
                                              "name":  "Úklidový agent",
                                              "emoji":  "🧹",
                                              "color":  "#14b8a6",
                                              "role":  "Rozpis úklidů pro úklidovou firmu",
                                              "detail":  "Z iCalů (Airbnb + Booking) spočítá odjezdy a příjezdy a pošle digest do úklidové skupiny. Cron 7:00 a 17:00.",
                                              "status":  "operational",
                                              "chat":  "skupina -5299707474",
                                              "workflow":  "Uklid notifikace v6",
                                              "project":  "apartmany-boti",
                                              "live":  true
                                          },
                                          {
                                              "id":  "prijezdovy",
                                              "name":  "Příjezdový agent",
                                              "emoji":  "🛬",
                                              "color":  "#3b82f6",
                                              "role":  "Pravděpodobné časy příjezdů hostů",
                                              "detail":  "Scanuje Booking/Airbnb e-maily a hlásí časy příjezdů do osobního DM. Denně 8:00. Scanování se předělává podle nového principu (kotvení na byt + datum).",
                                              "status":  "operational",
                                              "chat":  "DM 1436651098",
                                              "workflow":  "Email Prijezdy v5",
                                              "project":  "apartmany-boti",
                                              "live":  true
                                          },
                                          {
                                              "id":  "hlidaci",
                                              "name":  "Hlídací agent",
                                              "emoji":  "🛡️",
                                              "color":  "#ef4444",
                                              "role":  "Drží n8n naživu (watchdog)",
                                              "detail":  "Každých 10 min kontroluje n8n na Railway. Při pádu restartuje přes Railway API a pošle Telegram alert.",
                                              "status":  "operational",
                                              "chat":  "skupina -5299707474",
                                              "workflow":  "GitHub Actions (cron 10 min)",
                                              "project":  "n8n-watchdog",
                                              "live":  false
                                          },
                                          {
                                              "id":  "cenovy",
                                              "name":  "Cenový agent",
                                              "emoji":  "🏷️",
                                              "color":  "#a855f7",
                                              "role":  "Hlídá volné dny a ceny (interní PriceLabs)",
                                              "detail":  "Scanuje iCaly všech 14 bytů (Booking+Airbnb), hlásí volná okna v pásmech 1-7 / 7-14 / 14-30 dní + orphan gapy, doporučuje cenu / min-nights. Denně report na Telegram. Příště: hlídání konkurence + cenové návrhy.",
                                              "status":  "wip",
                                              "chat":  "DM 1436651098",
                                              "project":  "apartmany-boti",
                                              "live":  false
                                          }
                                      ]
                       },
                       {
                           "id":  "dejrecenzi",
                           "name":  "Dejrecenzi",
                           "emoji":  "⭐",
                           "color":  "#10b981",
                           "agents":  [
                                          {
                                              "id":  "scout",
                                              "name":  "Scout agent",
                                              "emoji":  "🔎",
                                              "color":  "#34d399",
                                              "role":  "Hledá podniky/leady na recenze",
                                              "detail":  "Vyhledává cílové podniky a tvoří texty (z commitů Recenze: \u0027Scout agent v2 + cílené texty\u0027). K doladění.",
                                              "status":  "wip",
                                              "project":  "Recenze",
                                              "live":  false
                                          }
                                      ]
                       },
                       {
                           "id":  "ruze-hned",
                           "name":  "Růže Hned",
                           "emoji":  "🌹",
                           "color":  "#e11d48",
                           "note":  "Byznys k doplnění — řekni mi, co dělá a jaké agenty potřebuje (objednávky, rozvoz, marketing…).",
                           "agents":  [

                                      ]
                       },
                       {
                           "id":  "poke-poke",
                           "name":  "Poke Poke",
                           "emoji":  "🍱",
                           "color":  "#f59e0b",
                           "note":  "Byznys k doplnění — co řeší (objednávky, rozvozy, sklad, recenze…)?",
                           "agents":  [

                                      ]
                       },
                       {
                           "id":  "chatbot",
                           "name":  "Chatbot",
                           "emoji":  "💬",
                           "color":  "#8b5cf6",
                           "note":  "Byznys k doplnění — jaký chatbot, kde běží, co dělá?",
                           "agents":  [

                                      ]
                       }
                   ],
    "projects":  [
                     {
                         "name":  "apartmany-boti",
                         "kind":  "local",
                         "type":  "Ostatni",
                         "group":  "Projekt Byty",
                         "tier":  "zdroj / kĂłd",
                         "chat":  "",
                         "path":  "C:\\Users\\antic\\OneDrive\\Desktop\\vsechny projekty\\apartmany-boti",
                         "git":  {
                                     "isRepo":  true,
                                     "branch":  "main",
                                     "uncommitted":  0,
                                     "ahead":  0,
                                     "behind":  3,
                                     "lastCommit":  "10 days ago | Add improvement agent + v6.3 arrivals bot"
                                 },
                         "deps":  {
                                      "manager":  "",
                                      "hasLockfile":  false,
                                      "count":  0
                                  },
                         "build":  {
                                       "hasBuild":  false,
                                       "hasTest":  false
                                   },
                         "todos":  3,
                         "status":  {
                                        "adam":  "ok",
                                        "klara":  "na",
                                        "viktor":  "na",
                                        "tereza":  "info",
                                        "nina":  "na"
                                    }
                     },
                     {
                         "name":  "claude-skills",
                         "kind":  "local",
                         "type":  "Ostatni",
                         "group":  "",
                         "tier":  "",
                         "chat":  "",
                         "path":  "C:\\Users\\antic\\OneDrive\\Desktop\\vsechny projekty\\claude-skills",
                         "git":  {
                                     "isRepo":  true,
                                     "branch":  "main",
                                     "uncommitted":  0,
                                     "ahead":  0,
                                     "behind":  0,
                                     "lastCommit":  "13 days ago | P┼Öid├íny UI/UX skilly: ui-ux-pro-max, ui-styling, design-system, frontend-design (ofici├íln├ş Anthropic)"
                                 },
                         "deps":  {
                                      "manager":  "",
                                      "hasLockfile":  false,
                                      "count":  0
                                  },
                         "build":  {
                                       "hasBuild":  false,
                                       "hasTest":  false
                                   },
                         "todos":  4,
                         "status":  {
                                        "adam":  "ok",
                                        "klara":  "na",
                                        "viktor":  "na",
                                        "tereza":  "info",
                                        "nina":  "na"
                                    }
                     },
                     {
                         "name":  "n8n-watchdog",
                         "kind":  "local",
                         "type":  "Python",
                         "group":  "",
                         "tier":  "",
                         "chat":  "",
                         "path":  "C:\\Users\\antic\\OneDrive\\Desktop\\vsechny projekty\\n8n-watchdog",
                         "git":  {
                                     "isRepo":  true,
                                     "branch":  "main",
                                     "uncommitted":  0,
                                     "ahead":  0,
                                     "behind":  0,
                                     "lastCommit":  "11 days ago | security: odstranen Telegram token z README (presunout do GitHub Secrets)"
                                 },
                         "deps":  {
                                      "manager":  "",
                                      "hasLockfile":  false,
                                      "count":  0
                                  },
                         "build":  {
                                       "hasBuild":  false,
                                       "hasTest":  false
                                   },
                         "todos":  0,
                         "status":  {
                                        "adam":  "ok",
                                        "klara":  "na",
                                        "viktor":  "na",
                                        "tereza":  "ok",
                                        "nina":  "na"
                                    }
                     },
                     {
                         "name":  "projekt-byty",
                         "kind":  "local",
                         "type":  "Python",
                         "group":  "Projekt Byty (archiv)",
                         "tier":  "zdroj / kĂłd",
                         "chat":  "",
                         "path":  "C:\\Users\\antic\\OneDrive\\Desktop\\vsechny projekty\\projekt-byty",
                         "git":  {
                                     "isRepo":  true,
                                     "branch":  "main",
                                     "uncommitted":  0,
                                     "ahead":  0,
                                     "behind":  0,
                                     "lastCommit":  "11 days ago | projekt-byty: archiv automatizaci (scrubnuty token, credentials mimo git)"
                                 },
                         "deps":  {
                                      "manager":  "",
                                      "hasLockfile":  false,
                                      "count":  0
                                  },
                         "build":  {
                                       "hasBuild":  false,
                                       "hasTest":  false
                                   },
                         "todos":  0,
                         "status":  {
                                        "adam":  "ok",
                                        "klara":  "na",
                                        "viktor":  "na",
                                        "tereza":  "ok",
                                        "nina":  "na"
                                    }
                     },
                     {
                         "name":  "Recenze",
                         "kind":  "local",
                         "type":  "Next.js",
                         "group":  "",
                         "tier":  "",
                         "chat":  "",
                         "path":  "C:\\Users\\antic\\OneDrive\\Desktop\\vsechny projekty\\Recenze",
                         "git":  {
                                     "isRepo":  true,
                                     "branch":  "main",
                                     "uncommitted":  0,
                                     "ahead":  0,
                                     "behind":  0,
                                     "lastCommit":  "13 days ago | Scout agent v2 + c├şlen├ę texty: popt├ívka po recenz├şch vs hleda─Źi p┼Öiv├Żd─Ťlku"
                                 },
                         "deps":  {
                                      "manager":  "npm",
                                      "hasLockfile":  true,
                                      "count":  22
                                  },
                         "build":  {
                                       "hasBuild":  true,
                                       "hasTest":  false
                                   },
                         "todos":  0,
                         "status":  {
                                        "adam":  "ok",
                                        "klara":  "ok",
                                        "viktor":  "warn",
                                        "tereza":  "ok",
                                        "nina":  "na"
                                    }
                     }
                 ],
    "usage":  {
                  "generatedAt":  "2026-06-25T22:00:01.9102268+00:00",
                  "session5h":  {
                                    "total":  0,
                                    "input":  0,
                                    "output":  0,
                                    "cache_c":  0,
                                    "cache_r":  0,
                                    "count":  0,
                                    "pct":  0
                                },
                  "weekly7d":  {
                                   "total":  348941262,
                                   "count":  1268,
                                   "pct":  28
                               },
                  "sonnet5h":  {
                                   "total":  0,
                                   "count":  0,
                                   "pct":  0
                               },
                  "sonnet7d":  {
                                   "total":  0,
                                   "count":  0
                               },
                  "burnRatePerH":  0,
                  "burnRatePerDay":  0,
                  "forecast":  {
                                   "session":  {
                                                   "remaining":  137474047,
                                                   "hoursToLimit":  null,
                                                   "etaText":  "tempo 0 - bez projekce",
                                                   "willHit":  false
                                               },
                                   "weekly":  {
                                                  "remaining":  897632826,
                                                  "hoursToLimit":  null,
                                                  "etaText":  "tempo 0 - bez projekce",
                                                  "willHit":  false
                                              }
                               },
                  "calibrated":  true,
                  "calibration":  {
                                      "ageDays":  9.2,
                                      "stale":  true,
                                      "staleDays":  7,
                                      "calibratedAt":  "2026-06-16T17:18:19.0062064+00:00"
                                  },
                  "urgency":  "warn",
                  "alerts":  [
                                 "POZOR: 64% spotreby z dlouhych sessions (8h+)",
                                 "DRAHY PROVOZ: 90% spotreby pri kontextu \u003e150k - /compact mid-task setri tokeny",
                                 "KALIBRACE STARA 9,2 dni - opis aktualni % z /model a spust: agent-usage.ps1 -Calibrate -SessionPct \u003cN\u003e -WeeklyPct \u003cN\u003e -SonnetPct \u003cN\u003e"
                             ],
                  "limits":  {
                                 "session":  137474047,
                                 "weekly":  1246574088,
                                 "sonnet":  148338200,
                                 "warnPct":  70,
                                 "critPct":  90
                             },
                  "modelBreakdown":  [

                                     ],
                  "quality":  {
                                  "longSessionPct":  64,
                                  "longSessionTok":  221781942,
                                  "sessionsLong":  3,
                                  "sessionsTotal":  6,
                                  "highCtxPct":  90,
                                  "highCtxTok":  313508953,
                                  "longThresholdH":  8,
                                  "ctxThreshold":  150000
                              }
              }
};
