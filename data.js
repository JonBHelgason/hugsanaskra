/* =====================================================================
   DATA.JS – orðalistar og fastir textar
   Hér geturðu bætt við eða breytt: tilfinningaorðum (WHEEL, QUADS),
   hugsunarvillum (ERRORS), sjálfgefnum merkjum (TAG_GROUPS) og útskýringartextum (TXT).
   ===================================================================== */

/* ---------- Tilfinningahjólið (hringurinn) ----------
   Uppbygging: grunntilfinning -> undirflokkur -> orð. */
const WHEEL = [
  {name:'Hamingja', color:'#fdfdc0', mids:[
    {name:'Ánægja',      words:['Gleði','Kátína']},
    {name:'Ró',          words:['Þakklæti','Sátt']},
    {name:'Áhugi',       words:['Forvitni','Hrifning']},
    {name:'Stolt',       words:['Sjálfstraust','Hreykni']},
    {name:'Viðurkenning',words:['Samþykki','Staðfesta']},
    {name:'Kraftur',     words:['Hugrekki','Sköpun']},
    {name:'Traust',      words:['Ást','Þakklæti']},
    {name:'Samkennd',    words:['Góðvild','Innileiki']},
    {name:'Bjartsýni',   words:['Eftirvænting','Von']}
  ]},
  {name:'Undrun', color:'#c9c9f5', mids:[
    {name:'Hissa',     words:['Forviða','Vonbrigði']},
    {name:'Ráðaleysi', words:['Svekkelsi','Ringlun']},
    {name:'Agndofa',   words:['Furða','Hneykslun']},
    {name:'Spenna',    words:['Ákefð','Kappsemi']}
  ]},
  {name:'Skömm', color:'#d2f7b8', mids:[
    {name:'Niðurlæging',words:['Feimni','Smán','Minnimáttarkennd','Höfnun','Vandræðalegt']},
    {name:'Sektarkennd',words:['Samviskubit','Auðmýkt']},
    {name:'Iðrun',      words:['Skammast','Eftirsjá']}
  ]},
  {name:'Ótti', color:'#fde0b0', mids:[
    {name:'Hræðsla', words:['Skelfing','Beygur']},
    {name:'Kvíði',   words:['Óró','Áhyggjur']},          /* á myndinni stendur "Óróí" – athugaðu */
    {name:'Ógnun',   words:['Óöryggi','Skelkun']},
    {name:'Álag',    words:['Taugaveiklun','Streita']}
  ]},
  {name:'Reiði', color:'#ffb8da', mids:[
    {name:'Vonbrigði',  words:['Sár','Móðgun']},
    {name:'Öfund',      words:['Afbrýðisemi','Öfundsýki']},
    {name:'Árásargirni',words:['Bræði','Æsingur']},
    {name:'Pirringur',  words:['Skapstyggð','Ergelsi']},
    {name:'Óánægja',    words:['Gremja','Biturð','Hneykslun']},
    {name:'Vanþóknun',  words:['Fyrirlitning','Dómharka']}
  ]},
  {name:'Viðbjóður', color:'#c4c4c4', mids:[
    {name:'Andúð',      words:['Andstyggð','Fyrirlitning']},
    {name:'Mislíka',    words:['Blöskra','Hatur']},
    {name:'Viðurstyggð',words:['Klígja','Óbeit','Ónot','Ógeð']}
  ]},
  {name:'Depurð', color:'#29a3e0', mids:[
    {name:'Þróttleysi',words:['Slen','Dugleysi']},
    {name:'Þjáning',   words:['Angist','Kvöl']},
    {name:'Örvænting', words:['Böl','Hjálparleysi','Vonleysi']},
    {name:'Sorg',      words:['Hryggð','Söknuður','Doði']},
    {name:'Leiði',     words:['Minnimáttarkennd','Einmannaleiki','Áhugaleysi']}
  ]}
];

/* ---------- Skap-mælir (4 litaðir reitir: orka x þægindi) ---------- */
const QUADS = [
  {id:'rautt',  color:'#e8645f', title:'Mikil orka', sub:'óþægilegt', words:[
    'Bræði','Skelfing','Streita','Taugatitringur','Áfall',
    'Heift','Ofsareiði','Gremja','Spenna','Orðleysi',
    'Sjóðandi reiði','Hræðsla','Reiði','Taugaóstyrkur','Eirðarleysi',
    'Kvíði','Uggur','Áhyggjur','Ergelsi','Pirringur',
    'Viðbjóður','Hugarangur','Hugarvíl','Óróleiki','Fýla']},
  {id:'gult',   color:'#f4c542', title:'Mikil orka', sub:'þægilegt', words:[
    'Undrun','Léttleiki','Hátíðarskap','Hrifningarvíma','Alsæla',
    'Ofurorka','Kátína','Hvatning','Innblástur','Fögnuður',
    'Orka','Fjör','Spenningur','Bjartsýni','Eldmóður',
    'Ánægja','Einbeiting','Gleði','Stolt','Hrifning',
    'Notalegheit','Kæti','Von','Leikgleði','Sæla']},
  {id:'blatt',  color:'#5bb8ea', title:'Lítil orka', sub:'óþægilegt', words:[
    'Ógeð','Dapurleiki','Vonbrigði','Depurð','Áhugaleysi',
    'Svartsýni','Önuglyndi','Hugfall','Sorg','Leiði',
    'Firring','Volæði','Einmanaleiki','Kjarkleysi','Þreyta',
    'Hryggð','Þunglyndi','Fúllyndi','Örmögnun','Slen',
    'Örvænting','Vonleysi','Auðn','Uppgefni','Þróttleysi']},
  {id:'graent', color:'#7cc470', title:'Lítil orka', sub:'þægilegt', words:[
    'Náðugheit','Léttlyndi','Sátt','Ást','Lífsfylling',
    'Ró','Öryggi','Fullsæla','Þakklæti','Hrærsla',
    'Slökun','Afslöppun','Hvíld','Blessun','Jafnvægi',
    'Mildi','Íhugun','Friður','Vellíðan','Áhyggjuleysi',
    'Syfja','Værukærð','Kyrrð','Hlýja','Æðruleysi']}
];

/* ---------- Hugsunarvillur (13) ----------
   n = nafn, d = stutt skýring, e = dæmi.
   Textarnir eru tillaga (byggt á Burns, Feeling Good, 1980, og Beck, Cognitive Therapy and the
   Emotional Disorders, 1976). Yfirfarðu þá áður en þeir eru notaðir í meðferð. */
const ERRORS = [
  {n:'Neikvæð rörsýn',        d:'Þú sérð bara neikvæða smáatriðið og missir af heildinni.', e:'Fjögur jákvæð ummæli, eitt neikvætt, og þú hugsar bara um það.'},
  {n:'Afskrifum hið jákvæða', d:'Jákvæðir hlutir eru ekki taldir með.',                      e:'„Þetta var bara heppni.“'},
  {n:'Ýkjun og smættun',      d:'Mistök eru gerð stærri og árangur minni en þau eru.',       e:'„Þetta litla klúður eyðilagði allt.“'},
  {n:'Alhæfingar',            d:'Eitt atvik verður að reglu. Orð eins og „alltaf“ og „aldrei“.', e:'„Ég klúðra alltaf öllu.“'},
  {n:'Hugsunarlestur',        d:'Þú telur þig vita hvað aðrir hugsa án sannana.',            e:'„Henni finnst ég asnaleg.“'},
  {n:'Sjálfsmiðun',           d:'Þú tekur á þig ábyrgð á því sem þú stjórnar ekki.',         e:'„Hann var í vondu skapi, ég hlýt að hafa gert eitthvað.“'},
  {n:'Allt eða ekkert',       d:'Hugsun í öfgum, ekkert millibil.',                          e:'„Ef þetta er ekki fullkomið er það misheppnað.“'},
  {n:'Hrakspá',               d:'Þú spáir slæmri niðurstöðu eins og hún sé staðreynd.',      e:'„Ég á eftir að falla á prófinu.“'},
  {n:'Hörmungatrú',           d:'Þú gerir ráð fyrir því versta mögulega.',                   e:'„Ef ég geri mistök missi ég vinnuna og allt hrynur.“'},
  {n:'Tilfinningarök',        d:'Tilfinningin er tekin sem sönnun.',                         e:'„Mér líður eins og misheppnuðum manni, þess vegna er ég það.“'},
  {n:'Ósanngjarn samanburður',d:'Þú berð þig við þá bestu eða við fullkomnun.',              e:'„Hinir eru miklu duglegri en ég.“'},
  {n:'Uppnefni',              d:'Þú setur neikvæðan merkimiða á þig eða aðra.',              e:'„Ég er aumingi.“'},
  {n:'Óraunsæ boð og bönn',   d:'Stífar reglur um hvernig þú eða aðrir „eiga“ að vera.',     e:'„Ég á að ráða við þetta. Ég má ekki gera mistök.“'}
];

/* ---------- Sjálfgefin merki (á hverja aðstæðu). Þú bætir við eigin með + í appinu. ---------- */
const TAG_GROUPS = [
  {id:'tema',   title:'Þema',   items:['Vinna','Hvíld','Hreyfing','Matur']},
  {id:'folk',   title:'Fólk',   items:['Ein/n','Fjölskylda','Vinir','Vinnufélagar']},
  {id:'stadur', title:'Staður', items:['Heima','Vinna','Úti','Í bíl']}
];

/* ---------- Útskýringartextar efst í dálkum ---------- */
const TXT = {
  col1:'Skrifaðu hér lýsingu á aðstæðunum eða þeim atvikum sem komu þér úr jafnvægi eða höfðu áhrif á líðan þína. Hvar varstu, hvenær og hvað gerðist?',
  col2:'Hvaða tilfinning kviknaði? Mundu að tilfinningum lýsir þú yfirleitt með einu orði. Einnig: Þú getur hafa fundið fyrir fleiri en einni tilfinningu, t.d. fyrst reiði og svo samviskubiti eða fyrst kvíða og síðan depurð eða vanmætti. Mundu að meta styrk tilfinningarinnar á skalanum 1-10.',
  col3:'Hvað kom upp í huga þér? Hvað hugsaðir þú? Sástu kannski myndir fyrir þér eða voru það hugsanir sem hægt er að lýsa með því hvað þú sagðir með sjálfri/sjálfum þér?',
  col4:'Veldu eina hugsun í einu. Þú getur unnið þær í hvaða röð sem er.',
  q1:'Hvernig gætir þú dregið þessa hugsun í efa?',
  q2:'Hvernig væri hægt að sjá þetta út frá öðru ljósi?'
};

/* ---------- Litir orða (til að lita sleða og súlur) ---------- */
const WORD_COLOR = {};
WHEEL.forEach(b=>{
  if(!WORD_COLOR[b.name]) WORD_COLOR[b.name]=b.color;
  b.mids.forEach(m=>{
    if(!WORD_COLOR[m.name]) WORD_COLOR[m.name]=b.color;
    m.words.forEach(w=>{ if(!WORD_COLOR[w]) WORD_COLOR[w]=b.color; });
  });
});
QUADS.forEach(q=> q.words.forEach(w=>{ if(!WORD_COLOR[w]) WORD_COLOR[w]=q.color; }));
const FREE_COLOR = '#9aa5b1';                       // litur fyrir frjálsan texta
const colorOf = w => WORD_COLOR[w] || FREE_COLOR;
