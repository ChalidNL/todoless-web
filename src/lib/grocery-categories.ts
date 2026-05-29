/**
 * Dutch grocery → supermarket category. Multi-word matches first.
 */
const CATEGORIES: [string, string[]][] = [
  ['Groente', [
    'tomaat', 'komkommer', 'paprika', 'wortel', 'ui', 'sla', 'salade',
    'spinazie', 'courgette', 'champignon', 'knoflook', 'gember',
    'broccoli', 'bloemkool', 'prei', 'selderij', 'aubergine', 'olijf',
  ]],
  ['Fruit', [
    'banaan', 'appel', 'peer', 'sinaasappel', 'mandarijn', 'watermeloen',
    'citroen', 'mango', 'aardbei', 'druif', 'kiwi', 'appelmoes', 'ananassap',
    'mangosap', 'multisap', 'appelsap', 'blödorange',
  ]],
  ['Aardappelen', [
    'aardappel', 'friet',
  ]],
  ['Vlees', [
    'kipfilet', 'kipnuggets', 'kippenbout', 'kipvleugels', 'hele kip',
    'gehakt', 'hamburger', 'salami', 'sucuk', 'merguez', 'döner',
    'kalf', 'lam', 'vlees', 'frikandel', 'bout', 'vleugel',
  ]],
  ['Vis', [
    'zalm', 'tonijn', 'fishstick',
  ]],
  ['Zuivel & Eieren', [
    'roomboter', 'slagroom', 'yoghurt drink', 'yoghurt',
    'crème fraiche', 'chocolade melk', 'karnemelk', 'geraspte kaas',
    'raclette cheese', 'raclette', 'melk', 'kaas', 'eieren', 'vla',
    'margerine', 'ayran',
  ]],
  ['Brood & Bakkerij', [
    'hamburger brood', 'tostibrood', 'krentenbollen', 'frikandelbrood',
    'bamischuif', 'brioche', 'durum', 'brood', 'croissant', 'pistolet',
    'baguette',
  ]],
  ['Rijst, Pasta & Granen', [
    'basmati rice', 'basmati', 'pasta penne', 'pasta',
    'cornflakes', 'bulgur', 'couscous', 'rijst', 'noodles',
  ]],
  ['Bakproducten & Meel', [
    'aardappel zetmeel', 'poedersuiker', 'kristal suiker', 'suikerklontjes',
    'bakpapier', 'bloem', 'meel', 'suiker', 'zout', 'maizena', 'zetmeel',
  ]],
  ['Peulvruchten', [
    'rode linzen', 'groene linzen', 'kikkererwten', 'split erwten',
    'linzen', 'erwten',
  ]],
  ['Kruiden & Specerijen', [
    'paprika poeder', 'koriander blad', 'peterselie blad',
    'zwarte peper', 'kefta kruiden', 'curry kruiden', 'munt blad',
    'gemberpoeder', 'komijn', 'peper', 'curry', 'kruiden',
  ]],
  ['Sauzen & Smeersels', [
    'chocoladepasta', 'knoflook saus', 'andalous saus', 'algerien saus',
    'samurai saus', 'loumpia saus', 'sambal saus', 'satesaus poeder',
    'pasta saus', 'pindakaas', 'hagelslag', 'mayonaise', 'ketchup',
    'chocolade', 'siroop', 'saus', 'jam',
  ]],
  ['Dranken', [
    'frisdrank limoen', 'frisdrank pommes', 'frisdrank tropical',
    'chocolade melk poeder', 'water met prik', 'sinasappelsap',
    'ijsthee', 'waterflesjes', 'appelsap', 'cola zero', 'cola',
    'thee', 'koffie', 'sap', 'water', 'frisdrank', 'siroop',
  ]],
  ['Snacks & Snoep', [
    'ijsjes', 'ijsbak cookie dough', 'ijsbak', 'chocolade',
    'snoepjes', 'popcorn', 'chips', 'koek', 'snoep', 'ijs',
  ]],
  ['Diepvries', [
    'diepvries snacks', 'frikandellen', 'pizza', 'nuggets',
    'diepvries',
  ]],
  ['Schoonmaak', [
    'dikke bleek', 'vuilniszakken 30l', 'vuilniszakken', 'vuilniszak',
    'vaatwastablet', 'vaatwas', 'keukenpapier', 'toiletpapier',
    'wasverzachter', 'afwasmiddel', 'wasmiddel', 'bleek', 'dasty', 'azijn',
  ]],
  ['Persoonlijke Verzorging', [
    'babydoekjes', 'babymelk', 'babypotjes', 'pleisters', 'pyamapap',
    'sudo creme', 'sudo', 'shampoo', 'zeep', 'tandpasta',
  ]],
  ['Olie & Vet', [
    'zonnebloem olie', 'olijven groen', 'smen', 'olie',
  ]],
  ['Noten & Zaden', [
    'cashew nootjes', 'cashew', 'amandel', 'noot', 'pinda',
  ]],
  ['Overig', [
    'hagelslag vlokken', 'chocolade melk poeder', 'verven thee',
    'ijsthee',
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
