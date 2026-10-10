# Hugsanaskrá

Einfalt app fyrir símann til að skrá hugsanaskrár (thought record) á íslensku. Hugsað til að nota milli tíma hjá sálfræðingi.

- Virkar í síma (iPhone og Android) og á tölvu, líka án nets.
- **Öll gögn vistast bara í símanum** (localStorage). Engin skráning, enginn netþjónn og ekkert er sent neitt.
- Ekkert uppsetningarferli: bara nokkrar skrár, engin forritasöfn.

> Appið er skráningartól, ekki meðferð. Það kemur ekki í staðinn fyrir sálfræðing eða lækni.

## Hvað appið gerir

**Ný færsla (3 skref)**

1. **Tilfinning:** veldu eina eða fleiri.
   - *Hringur:* 7 grunntilfinningar í hring. Ýttu á eina og undirflokkarnir spretta út, ýttu á undirflokk og orðin spretta út. Ýtt á miðjuna fer til baka.
   - *Skap-mælir:* 4 litaðir reitir (orka og þægindi) með orðum undir.
   - Leit að orði og frjáls texti ef orðið vantar.
2. **Styrkur og samhengi:** sleði 0–10 fyrir hverja tilfinningu, tími og dagsetning, og merki fyrir **stað**, **fólk** og **hvað ég var að gera**. Þú getur bætt við eigin merkjum með „+“.
3. **Hugsun:** hvað gerðist rétt áður, hugsun sem kom, annað sjónarhorn (valfrjálst), hvað ég gerði og hvort það hjálpaði (já / smá / nei).

„Vista“ er í boði frá skrefi 2, svo færsla tekur innan við mínútu. Hægt er að opna færslu seinna og bæta við hugsuninni.

**Annað**

- **Forsíða:** kveðja eftir tíma dags, vikuræma (hver dagur fær lit sterkustu tilfinningar dagsins) og síðasta færsla.
- **Færslur:** listi, nýjast efst. Opna, breyta og eyða.
- **Dagatal:** litaðir dagar, ýttu á dag til að sjá færslur hans.
- **Yfirsýn:** færslur á viku, meðalstyrkur, algengustu tilfinningar, merki (fjöldi og meðalstyrkur), algeng orð í „Hvað gerðist rétt áður“ og hvað hjálpaði.
- **Útflutningur:** textaskjal eða CSV fyrir valið tímabil, til að senda eða sýna sálfræðingi. CSV notar semíkommu og UTF-8, svo íslenskir stafir opnast rétt í Excel.
- **Afrit og innflutningur (JSON):** svo þú tapir ekki gögnum ef þú skiptir um síma. Innlestur bætir við færslum sem vantar og eyðir engu.

## Setja upp á símann (GitHub Pages)

Þú þarft ókeypis GitHub-aðgang.

1. Búðu til nýtt **opinbert** repository (t.d. `hugsanaskra`) og hladdu upp öllum skrám úr þessari möppu (Add file → Upload files → Commit).
2. Farðu í **Settings → Pages**. Veldu *Deploy from a branch*, branch `main` og möppuna `/ (root)`. Vistaðu.
3. Eftir um mínútu birtist slóð, t.d. `https://nafnið-þitt.github.io/hugsanaskra/`.
4. Opnaðu slóðina **einu sinni með neti**:
   - **iPhone:** Safari → deilingartakkinn → *Bæta á heimaskjá*.
   - **Android:** Chrome → valmynd (⋮) → *Bæta á heimaskjá* eða *Setja upp app*.
5. Eftir þetta virkar appið án nets.

Repository er opinbert, en þar er bara kóðinn. **Færslurnar þínar fara aldrei af símanum og eru ekki á GitHub.**

## Uppfæra appið

1. Skiptu út `index.html` (og `sw.js` ef hún breyttist) á GitHub.
2. Hækkaðu töluna í `VERSION` í `sw.js` (t.d. `hugsanaskra-v3` → `hugsanaskra-v4`). Annars sækir síminn gömlu útgáfuna úr skyndiminni.
3. Opnaðu appið með neti. Ef gamla útgáfan sést enn, lokaðu appinu alveg og opnaðu það aftur.

Gögnin þín haldast óbreytt við uppfærslu.

## Skrárnar

| Skrá | Hlutverk |
|---|---|
| `index.html` | Allt appið (útlit, kóði og gögn í einni skrá) |
| `manifest.json` | Nafn, litir og tákn, svo hægt sé að setja appið á heimaskjá |
| `sw.js` | Þjónustuskrá (service worker): geymir appið í símanum svo það virki án nets |
| `icon-192.png`, `icon-512.png` | Tákn appsins |

## Breyta sjálfur

Kóðinn er einfaldur og vel athugasemdum merktur. Helstu staðir í `index.html`:

- **Litir og útlit:** `:root { … }` efst í `<style>`.
- **Tilfinningaorð:** `WHEEL` (hringurinn) og `QUADS` (skap-mælirinn).
- **Sjálfgefin merki:** `TAG_GROUPS`.
- **Orð sem eru ekki talin sem kveikjur:** `STOP`.
- **Bil og stærð hringsins:** `drawStage()`.

## Öryggi og takmarkanir

- **Taktu afrit reglulega** (Gögn → Taka afrit). Ef síminn eyðir gögnum vefsíðna, eða þú hreinsar gögn vafrans, tapast færslurnar. Appið minnir þig á eftir 30 daga.
- iPhone getur eytt gögnum vefsíðna sem eru lítið notaðar. Að hafa appið á heimaskjá dregur úr því, en afrit er eina örugga leiðin.
- Engin lykilorð eða PIN-kóði enn. Hver sem getur opnað símann þinn getur opnað appið.
- Engar áminningar. Vefapp án netþjóns getur ekki sent áreiðanlegar tilkynningar. Notaðu vekjara eða áminningu í símanum.
- „Algengustu kveikjur“ telja orð eftir fyrstu 5 stöfum (til að ná beygingum). Þetta er gróf talning. Merkin (staður, fólk, hvað ég var að gera) eru áreiðanlegri.

## Hugmyndir að næstu útgáfum

- Lýsing á hverri tilfinningu (haldið lengi á orði).
- PIN-kóði.
- Valfrjáls reitur „trú á hugsun (0–100)“ fyrir og eftir.
- Valfrjáls merki fyrir líkamleg einkenni.
