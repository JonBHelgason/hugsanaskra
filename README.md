# Hugsanaskrá

Einfalt app (PWA, ljóst þema) á íslensku til að skrá hugsanaskrár (HAM / CBT thought record) milli tíma hjá sálfræðingi.
Virkar án nets. Öll gögn vistast í símanum (localStorage). Ekkert er sent á netþjón.

## Hvernig skráning virkar
Hver skráning hefur fjóra dálka. Strjúktu á milli þeirra eða notaðu punktana neðst. Örin efst fer í yfirlit.

1. **Aðstæður**: ein aðstæða með titli, lýsingu og merkjum (Þema, Fólk, Staður). Reitirnir eru beint í dálknum.
2. **Tilfinning**: valið er beint í dálknum. Hringur (grunntilfinning > undirflokkur > orð), skap-mælir, leit eða eigið orð. Styrkur 1–10.
3. **Hugsun**: textareitur. Með + kemur nýr reitur fyrir neðan, koll af kolli.
4. **Endurmat**: opnast þegar lágmarki er náð (ein aðstæða með titli og lýsingu, ein tilfinning, ein hugsun).
   Fyrir hverja hugsun: trú 0–100%, hugsunarvillur (13), tvær spurningar, trú aftur. „Meta líðan aftur“ ("Kvíði: 5 → 3") opnast þegar trú fyrir og eftir er metin á öllum hugsunum.

Skráning vistast sjálfkrafa. Á forsíðu er hún merkt með lit:
- **Rautt** (Klára 1–3): lágmarki ekki náð.
- **Gult** (Endurmat eftir): lágmarki náð, Endurmat ekki búið.
- **Grænt** (Klárað): trú fyrir og eftir metin á öllum hugsunum.

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
