/**
 * Dutch grocery → supermarket category with emoji headers.
 * Multi-word matches first (longest keyword wins).
 */
const CATEGORIES: [string, string[]][] = [
  ['🥦 Groente & Fruit', [
    'tomaat', 'komkommer', 'paprika', 'wortel', 'ui', 'sla', 'salade',
    'spinazie', 'courgette', 'champignon', 'knoflook', 'gember',
    'broccoli', 'bloemkool', 'prei', 'selderij', 'aubergine', 'olijf',
    'banaan', 'appel', 'peer', 'sinaasappel', 'mandarijn', 'watermeloen',
    'citroen', 'mango', 'aardbei', 'druif', 'kiwi', 'appelmoes', 'ananassap',
    'mangosap', 'multisap', 'appelsap', 'blödorange', 'aardappel', 'friet',
  ]],
  ['🍞 Brood & Ontbijt', [
    'hamburger brood', 'tostibrood', 'krentenbollen', 'frikandelbrood',
    'bamischuif', 'brioche', 'durum', 'brood', 'croissant', 'pistolet',
    'baguette', 'cornflakes', 'hagelslag vlokken', 'hagelslag', 'jam',
    'chocoladepasta', 'pindakaas',
  ]],
  ['🥛 Zuivel & Eieren', [
    'roomboter naturel', 'roomboter zout', 'roomboter', 'slagroom',
    'yoghurt drink', 'yoghurt', 'crème fraiche', 'chocolade melk',
    'karnemelk', 'geraspte kaas', 'raclette cheese', 'raclette',
    'melk', 'kaas', 'eieren', 'vla', 'margerine', 'ayran',
  ]],
  ['🥩 Vlees, Kip & Vis', [
    'kipfilet', 'kipnuggets', 'kippenbouten', 'kipvleugels', 'hele kip',
    'diepvries snacks', 'gehakt', 'hamburger', 'frikandel', 'salami',
    'sucuk', 'merguez', 'döner', 'kalf', 'lam', 'vlees',
    'zalm', 'tonijn', 'fishstick',
  ]],
  ['❄️ Diepvries', [
    'ijsbak cookie dough', 'ijsbak', 'ijsjes', 'frikandellen',
    'pizza', 'nuggets', 'diepvries', 'ijs',
  ]],
  ['🍚 Rijst, Pasta & Droge Waren', [
    'aardappel zetmeel', 'basmati rice', 'pasta penne', 'pasta',
    'bulgur', 'couscous', 'rijst', 'noodles', 'maizena', 'zetmeel',
    'rode linzen', 'groene linzen', 'kikkererwten', 'split erwten',
    'linzen', 'erwten', 'bloem', 'meel', 'suiker', 'zout',
    'poedersuiker', 'kristal suiker', 'suikerklontjes', 'bakpapier',
  ]],
  ['🌶️ Kruiden, Sauzen & Olie', [
    'paprika poeder', 'koriander blad', 'peterselie blad',
    'zwarte peper', 'kefta kruiden', 'curry kruiden', 'munt blad',
    'gemberpoeder', 'komijn', 'peper', 'curry', 'kruiden',
    'knoflook saus', 'andalous saus', 'algerien saus', 'samurai saus',
    'loumpia saus', 'sambal saus', 'satesaus poeder', 'pasta saus',
    'mayonaise', 'ketchup', 'saus', 'siroop',
    'zonnebloem olie', 'olijven groen', 'smen', 'azijn', 'olie',
  ]],
  ['🥤 Drinken', [
    'frisdrank limoen', 'frisdrank pommes', 'frisdrank tropical',
    'chocolade melk poeder', 'water met prik', 'sinasappelsap',
    'waterflesjes', 'cola zero', 'ijsthee', 'cola', 'thee',
    'koffie', 'sap', 'water', 'frisdrank',
  ]],
  ['🍪 Snacks & Zoet', [
    'snoepjes', 'popcorn', 'chips', 'koek', 'snoep', 'chocolade',
  ]],
  ['👶 Baby', [
    'babydoekjes', 'babymelk', 'babypotjes', 'pyamapap',
  ]],
  ['🧼 Huishouden & Schoonmaak', [
    'dikke bleek', 'vuilniszakken 30l', 'vuilniszakken', 'vuilniszak',
    'vaatwastablet', 'vaatwas', 'keukenpapier', 'toiletpapier',
    'wasverzachter', 'afwasmiddel', 'wasmiddel', 'bleek', 'dasty',
  ]],
  ['💊 Verzorging & Apotheek', [
    'pleisters', 'sudo creme', 'sudo', 'shampoo', 'zeep', 'tandpasta',
  ]],
  ['🌍 Speciaal / Buitenland', [
    'verven thee', 'cashew nootjes', 'cashew', 'amandel', 'noot', 'pinda',
    'algerien', 'andalous', 'loumpia', 'samurai', 'sambal', 'ayran',
    'durum', 'döner', 'sucuk', 'merguez', 'halal', 'bamischuif',
  ]],
];

// Build lookup: keyword → category, sorted longest-first for multi-word priority
const lookup = new Map<string, string>();
for (const [category, keywords] of CATEGORIES) {
  for (const kw of keywords) {
    const existing = lookup.get(kw);
    if (!existing || kw.length > existing.length) {
      lookup.set(kw, category);
    }
  }
}
const sortedKeywords = [...lookup.keys()].sort((a, b) => b.length - a.length);

export const categorizeItem = (title: string): string => {
  const lower = title.toLowerCase().trim();
  for (const kw of sortedKeywords) {
    if (lower.includes(kw)) return lookup.get(kw)!;
  }
  return 'Overig';
};
