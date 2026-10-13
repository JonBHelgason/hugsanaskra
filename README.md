# Hugsanaskrá

Einfalt app (PWA) á íslensku til að skrá hugsanaskrár (HAM / CBT thought record) milli tíma hjá sálfræðingi.
Virkar án nets. Öll gögn vistast í símanum (localStorage). Ekkert er sent á netþjón.

## Hvernig skráning virkar
Hver skráning hefur fjóra dálka. Strjúktu á milli þeirra eða notaðu punktana neðst. Örin efst fer í yfirlit.

1. **Aðstæður**: titill, lýsing og merki (Þema, Fólk, Staður). Hægt að hafa fleiri en eina.
2. **Tilfinning**: hringur (grunntilfinning > undirflokkur > orð), skap-mælir, leit eða eigið orð. Styrkur 1–10.
3. **Hugsun**: ein eða fleiri hugsanir.
4. **Endurmat**: opnast þegar lágmarki er náð (ein aðstæða með titli og lýsingu, ein tilfinning, ein hugsun).
   Fyrir hverja hugsun: trú 0–100%, hugsunarvillur (13), tvær spurningar, trú aftur. Líðan er metin aftur einu sinni ("Kvíði: 5 → 3").

Skráning vistast sjálfkrafa. Þar til lágmarki er náð er hún merkt **Drög**.
Yfirsýn (mynstur) birtist þegar skráningar eru 5 eða fleiri.

## Skrár
| Skrá | Hlutverk |
|---|---|
| `index.html` | Grind |
| `style.css` | Útlit og litir |
| `data.js` | Tilfinningaorð, hugsunarvillur, merki, textar (hér er auðveldast að breyta) |
| `app.js` | Gögn, reglur, heim, dagatal, yfirsýn, útflutningur |
| `form.js` | Skráningin (dálkar, gluggar, hringur) og ræsing |
| `sw.js` | Þjónustuskrá (offline) |
| `manifest.json`, `icon-*.png` | Uppsetning á heimaskjá |

## Setja upp á GitHub Pages
1. Settu allar skrárnar í repository.
2. Settings > Pages > Deploy from a branch > `main` / root.
3. Opnaðu slóðina í Safari (iPhone) eða Chrome (Android) > Add to Home Screen.

## Uppfæra
Þegar þú breytir einhverri skrá, hækkaðu `VERSION` í `sw.js` (t.d. `hugsanaskra-v8`).
Annars sækir síminn gömlu útgáfuna úr skyndiminni.

## Gögn og afrit
- Gögn: `hugsanaskra_v2` í localStorage. Gömlum færslum (v1) er breytt sjálfkrafa. Gamla skráin er ekki eydd.
- Gögn > **Taka afrit (JSON)** og **Lesa inn afrit** (tekur líka við afritum úr gömlu útgáfunni).
- Gögn > **Textaskjal** fyrir tímabil, til að sýna sálfræðingi.
- Taktu afrit reglulega. Ef vafragögnum er eytt, hverfa skráningarnar.

## Athugið
Hugsunarvillutextarnir í `data.js` eru tillaga (Burns, *Feeling Good*, 1980; Beck, 1976). Láttu sálfræðinginn yfirfara þá.
