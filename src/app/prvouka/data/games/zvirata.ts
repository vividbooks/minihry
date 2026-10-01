import type { PrvoukaChoiceOption, PrvoukaGame, PrvoukaPicture, PrvoukaQuestion } from '../types';
import { createRandom, pickMany, shuffle } from '../random';

type Habitat = 'les' | 'louka' | 'voda' | 'statek' | 'doma' | 'mesto' | 'zahrada' | 'daleko';
type Diet = 'rostliny' | 'zvirata' | 'oboje';
type Winter = 'spi' | 'odleta' | 'venku';
type Group = 'hospodarske' | 'domaci' | 'volne';

const HABITAT_LABELS: Record<Habitat, string> = {
  les: 'v lese',
  louka: 'na louce a na poli',
  voda: 'u vody a ve vodě',
  statek: 'na statku u lidí',
  doma: 'doma s lidmi',
  mesto: 've městě a na vesnici',
  zahrada: 'na zahradě a v parku',
  daleko: 'v dalekých krajích',
};

const DIET_LABELS: Record<Diet, string> = {
  rostliny: 'rostliny',
  zvirata: 'jiná zvířata',
  oboje: 'rostliny i zvířata',
};

const WINTER_LABELS: Record<Winter, string> = {
  spi: 'spí zimním spánkem',
  odleta: 'odletí do teplých krajin',
  venku: 'zůstává venku a hledá potravu',
};

const GROUP_LABELS: Record<Group, string> = {
  hospodarske: 'Hospodářské',
  domaci: 'Mazlíček',
  volne: 'Volně žijící',
};

interface Animal {
  key: string;
  name: string;
  picture: PrvoukaPicture;
  legs?: number;
  insect: boolean;
  /** Kde zvíře žije (správné odpovědi). */
  habitats: Habitat[];
  /** Kde by se dalo potkat taky – nesmí být mezi špatnými možnostmi. */
  maybe?: Habitat[];
  diet?: Diet;
  winter?: Winter;
  group: Group;
  /** Ve 2. ročníku (exotická zvířata, méně známí ptáci). */
  grade: 1 | 2;
  fact?: string;
}

const ill = (id: string, emoji: string, alt: string): PrvoukaPicture => ({ kind: 'ill', id, emoji, alt });
const photo = (key: string, alt: string): PrvoukaPicture => ({ kind: 'photo', src: `/prvouka/foto/${key}.jpg`, alt });

/** Zvířata, která mají obrázek v knihovně ilustrací Laioutu (prvouka, čeština, matematika). */
const ANIMALS: Animal[] = [
  { key: 'veverka', name: 'veverka', picture: ill('prvouka-veverka', '🐿️', 'Veverka'), legs: 4, insect: false, habitats: ['les'], maybe: ['zahrada', 'mesto'], winter: 'venku', group: 'volne', grade: 1, fact: 'Veverka si na podzim schovává zásoby ořechů a semen.' },
  { key: 'jezek', name: 'ježek', picture: ill('prvouka-jezek', '🦔', 'Ježek'), legs: 4, insect: false, habitats: ['zahrada', 'les'], maybe: ['louka', 'mesto'], diet: 'zvirata', winter: 'spi', group: 'volne', grade: 1, fact: 'Ježek jí hmyz, žížaly a slimáky – jablka mu nedávej.' },
  { key: 'mravenec', name: 'mravenec', picture: ill('prvouka-mravenec', '🐜', 'Mravenec'), legs: 6, insect: true, habitats: ['les'], maybe: ['louka', 'zahrada', 'mesto'], group: 'volne', grade: 1 },
  { key: 'vcela', name: 'včela', picture: ill('matika-vcela', '🐝', 'Včela'), legs: 6, insect: true, habitats: ['louka', 'zahrada'], maybe: ['statek', 'les', 'mesto'], diet: 'rostliny', group: 'hospodarske', grade: 1, fact: 'Včela sbírá nektar a pyl z květů. Včelař jí staví úly.' },
  { key: 'babocka', name: 'babočka', picture: ill('babocka', '🦋', 'Babočka'), legs: 6, insect: true, habitats: ['louka', 'zahrada'], maybe: ['les', 'mesto'], diet: 'rostliny', group: 'volne', grade: 1 },
  { key: 'belasek', name: 'bělásek', picture: ill('belasek', '🦋', 'Bělásek'), legs: 6, insect: true, habitats: ['louka', 'zahrada'], maybe: ['les', 'mesto', 'statek'], diet: 'rostliny', group: 'volne', grade: 1 },
  { key: 'lisaj', name: 'lišaj', picture: ill('prvouka-lisaj', '🦋', 'Lišaj'), legs: 6, insect: true, habitats: ['louka', 'zahrada'], maybe: ['les'], diet: 'rostliny', group: 'volne', grade: 2, fact: 'Lišaj je noční motýl.' },
  { key: 'pustik', name: 'puštík', picture: ill('prvouka-pustik', '🦉', 'Puštík'), legs: 2, insect: false, habitats: ['les'], maybe: ['zahrada', 'mesto'], diet: 'zvirata', winter: 'venku', group: 'volne', grade: 1, fact: 'Puštík loví v noci myši.' },
  { key: 'datel', name: 'datel', picture: ill('prvouka-datel', '🐦', 'Datel'), legs: 2, insect: false, habitats: ['les'], maybe: ['zahrada'], diet: 'zvirata', winter: 'venku', group: 'volne', grade: 1, fact: 'Datel vytahuje hmyz zpod kůry stromů.' },
  { key: 'sojka', name: 'sojka', picture: ill('prvouka-sojka', '🐦', 'Sojka'), legs: 2, insect: false, habitats: ['les'], maybe: ['zahrada'], diet: 'oboje', winter: 'venku', group: 'volne', grade: 2 },
  { key: 'sykora', name: 'sýkora koňadra', picture: ill('prvouka-sykora-sedici', '🐦', 'Sýkora koňadra'), legs: 2, insect: false, habitats: ['zahrada', 'les'], maybe: ['mesto'], diet: 'oboje', winter: 'venku', group: 'volne', grade: 1, fact: 'Sýkora v zimě ráda chodí na krmítko.' },
  { key: 'vrabec', name: 'vrabec', picture: ill('prvouka-vrabec', '🐦', 'Vrabec'), legs: 2, insect: false, habitats: ['mesto'], maybe: ['zahrada', 'statek'], diet: 'oboje', winter: 'venku', group: 'volne', grade: 1 },
  { key: 'vlastovka', name: 'vlaštovka', picture: ill('prvouka-vlastovka', '🐦', 'Vlaštovka'), legs: 2, insect: false, habitats: ['statek', 'mesto'], maybe: ['louka', 'voda'], diet: 'zvirata', winter: 'odleta', group: 'volne', grade: 1, fact: 'Vlaštovka chytá hmyz v letu a na zimu odlétá do Afriky.' },
  { key: 'cap', name: 'čáp', picture: ill('prvouka-cap-hnizdo', '🐦', 'Čáp v hnízdě'), legs: 2, insect: false, habitats: ['louka', 'voda'], maybe: ['mesto', 'statek'], diet: 'zvirata', winter: 'odleta', group: 'volne', grade: 1 },
  { key: 'rorys', name: 'rorýs', picture: ill('rorys', '🐦', 'Rorýs'), legs: 2, insect: false, habitats: ['mesto'], maybe: ['louka', 'voda'], diet: 'zvirata', winter: 'odleta', group: 'volne', grade: 2 },
  { key: 'holub', name: 'holub', picture: ill('holub', '🐦', 'Holub'), legs: 2, insect: false, habitats: ['mesto'], maybe: ['statek', 'zahrada', 'louka'], diet: 'rostliny', winter: 'venku', group: 'volne', grade: 1 },
  { key: 'kachna', name: 'kachna divoká', picture: ill('prvouka-kachna', '🦆', 'Kachna divoká'), legs: 2, insect: false, habitats: ['voda'], maybe: ['mesto', 'statek'], diet: 'oboje', group: 'volne', grade: 1 },
  { key: 'netopyr', name: 'netopýr', picture: ill('prvouka-netopyr', '🦇', 'Netopýr'), insect: false, habitats: ['les'], maybe: ['mesto', 'zahrada', 'statek', 'voda'], diet: 'zvirata', winter: 'spi', group: 'volne', grade: 1, fact: 'Netopýr v noci loví hmyz a v zimě spí zavěšený hlavou dolů.' },
  { key: 'srna', name: 'srna', picture: ill('prvouka-srnka', '🦌', 'Srna'), legs: 4, insect: false, habitats: ['les', 'louka'], diet: 'rostliny', winter: 'venku', group: 'volne', grade: 1 },
  { key: 'jelen', name: 'jelen', picture: ill('jelen', '🦌', 'Jelen'), legs: 4, insect: false, habitats: ['les'], maybe: ['louka'], diet: 'rostliny', winter: 'venku', group: 'volne', grade: 1, fact: 'Jelenovi každý rok na jaře opadají parohy a dorostou nové.' },
  { key: 'bobr', name: 'bobr', picture: ill('prvouka-bobr', '🦫', 'Bobr'), legs: 4, insect: false, habitats: ['voda'], maybe: ['les'], diet: 'rostliny', winter: 'venku', group: 'volne', grade: 2, fact: 'Bobr okusuje kůru a staví hráze z větví.' },
  { key: 'vydra', name: 'vydra', picture: ill('prvouka-vydra', '🦦', 'Vydra'), legs: 4, insect: false, habitats: ['voda'], maybe: ['les'], diet: 'zvirata', winter: 'venku', group: 'volne', grade: 2, fact: 'Vydra skvěle plave a loví ryby.' },
  { key: 'hranostaj', name: 'hranostaj', picture: ill('prvouka-hranostaj', '🦦', 'Hranostaj'), legs: 4, insect: false, habitats: ['louka', 'les'], maybe: ['voda', 'statek', 'zahrada'], diet: 'zvirata', winter: 'venku', group: 'volne', grade: 2, fact: 'Hranostaj má v zimě bílou srst, aby nebyl na sněhu vidět.' },
  { key: 'krecek', name: 'křeček polní', picture: ill('prvouka-krecek', '🐹', 'Křeček polní'), legs: 4, insect: false, habitats: ['louka'], maybe: ['zahrada'], winter: 'spi', group: 'volne', grade: 2 },
  { key: 'sysel', name: 'sysel', picture: ill('sysel', '🐿️', 'Sysel'), legs: 4, insect: false, habitats: ['louka'], maybe: ['zahrada'], diet: 'rostliny', winter: 'spi', group: 'volne', grade: 2 },
  { key: 'medved', name: 'medvěd', picture: ill('matika-medved', '🐻', 'Medvěd'), legs: 4, insect: false, habitats: ['les'], diet: 'oboje', winter: 'spi', group: 'volne', grade: 1, fact: 'Medvěd jí maliny, med i ryby. Zimu prospí v brlohu.' },
  { key: 'uzovka', name: 'užovka', picture: ill('prvouka-uzovka', '🐍', 'Užovka'), legs: 0, insect: false, habitats: ['voda'], maybe: ['louka', 'les', 'zahrada'], diet: 'zvirata', group: 'volne', grade: 2, fact: 'Užovka nemá nohy – plazí se. Loví žáby a ryby.' },
  { key: 'colek', name: 'čolek', picture: ill('prvouka-colek', '🦎', 'Čolek'), legs: 4, insect: false, habitats: ['voda'], maybe: ['les', 'zahrada'], diet: 'zvirata', group: 'volne', grade: 2 },
  { key: 'zaba', name: 'žába', picture: ill('matika-zabka', '🐸', 'Žabka'), legs: 4, insect: false, habitats: ['voda'], maybe: ['zahrada', 'louka', 'les'], diet: 'zvirata', group: 'volne', grade: 1, fact: 'Žába chytá hmyz dlouhým lepkavým jazykem.' },
  { key: 'pes', name: 'pes', picture: ill('pes-lezi', '🐕', 'Pes'), legs: 4, insect: false, habitats: ['doma'], maybe: ['statek', 'mesto', 'zahrada'], group: 'domaci', grade: 1 },
  { key: 'kocka', name: 'kočka', picture: ill('matika-cernakocka', '🐈', 'Kočka'), legs: 4, insect: false, habitats: ['doma'], maybe: ['statek', 'mesto', 'zahrada'], diet: 'zvirata', group: 'domaci', grade: 1 },
  { key: 'beran', name: 'beran', picture: ill('beran', '🐏', 'Beran'), legs: 4, insect: false, habitats: ['statek'], maybe: ['louka'], diet: 'rostliny', group: 'hospodarske', grade: 1, fact: 'Beran je tatínek jehňátek. Ovce nám dávají vlnu.' },
  { key: 'osel', name: 'osel', picture: ill('osel', '🫏', 'Osel'), legs: 4, insect: false, habitats: ['statek'], maybe: ['louka'], diet: 'rostliny', group: 'hospodarske', grade: 1 },
  { key: 'tele', name: 'tele', picture: ill('tele', '🐄', 'Tele'), legs: 4, insect: false, habitats: ['statek'], maybe: ['louka'], diet: 'rostliny', group: 'hospodarske', grade: 1, fact: 'Tele je mládě krávy. Kráva nám dává mléko.' },
  { key: 'sele', name: 'sele', picture: ill('sele', '🐖', 'Sele'), legs: 4, insect: false, habitats: ['statek'], diet: 'oboje', group: 'hospodarske', grade: 1 },
  { key: 'hribe', name: 'hříbě', picture: ill('hribe', '🐴', 'Hříbě'), legs: 4, insect: false, habitats: ['statek'], maybe: ['louka'], diet: 'rostliny', group: 'hospodarske', grade: 1 },
  { key: 'zebra', name: 'zebra', picture: ill('zebra', '🦓', 'Zebra'), legs: 4, insect: false, habitats: ['daleko'], diet: 'rostliny', group: 'volne', grade: 2 },
  { key: 'slon', name: 'slon', picture: ill('sloni', '🐘', 'Sloni'), legs: 4, insect: false, habitats: ['daleko'], diet: 'rostliny', group: 'volne', grade: 2 },
  { key: 'klokan', name: 'klokan', picture: ill('klokani', '🦘', 'Klokani'), legs: 4, insect: false, habitats: ['daleko'], diet: 'rostliny', group: 'volne', grade: 2, fact: 'Klokan nosí mládě ve vaku na břiše.' },
  { key: 'koala', name: 'koala', picture: ill('koala', '🐨', 'Koala'), legs: 4, insect: false, habitats: ['daleko'], diet: 'rostliny', group: 'volne', grade: 2 },
  { key: 'lenochod', name: 'lenochod', picture: ill('lenochod', '🦥', 'Lenochod'), legs: 4, insect: false, habitats: ['daleko'], diet: 'rostliny', group: 'volne', grade: 2 },
  { key: 'delfin', name: 'delfín', picture: ill('delfin', '🐬', 'Delfín'), legs: 0, insect: false, habitats: ['voda', 'daleko'], diet: 'zvirata', group: 'volne', grade: 2, fact: 'Delfín žije v moři a dýchá vzduch jako my.' },
  { key: 'chameleon', name: 'chameleon', picture: ill('chameleon', '🦎', 'Chameleon'), legs: 4, insect: false, habitats: ['daleko'], diet: 'zvirata', group: 'volne', grade: 2, fact: 'Chameleon umí měnit barvu a chytá hmyz jazykem.' },
];

interface Family {
  key: string;
  mother: string;
  father: string;
  young: string;
  picture: PrvoukaPicture;
  /** Koho ukazuje obrázek. */
  shows: 'mother' | 'father' | 'young';
}

/** Rodiny hospodářských a volně žijících zvířat (1/2/18–21). */
const FAMILIES: Family[] = [
  { key: 'skot', mother: 'kráva', father: 'býk', young: 'tele', picture: ill('tele', '🐄', 'Tele'), shows: 'young' },
  { key: 'prase', mother: 'prasnice', father: 'kanec', young: 'sele', picture: ill('sele', '🐖', 'Sele'), shows: 'young' },
  { key: 'kun', mother: 'klisna', father: 'hřebec', young: 'hříbě', picture: ill('hribe', '🐴', 'Hříbě'), shows: 'young' },
  { key: 'ovce', mother: 'ovce', father: 'beran', young: 'jehně', picture: ill('beran', '🐏', 'Beran'), shows: 'father' },
  { key: 'pes', mother: 'fena', father: 'pes', young: 'štěně', picture: ill('stene', '🐶', 'Štěně'), shows: 'young' },
  { key: 'kocka', mother: 'kočka', father: 'kocour', young: 'kotě', picture: ill('matika-cervenakocka', '🐈', 'Kočka'), shows: 'mother' },
  { key: 'slepice', mother: 'slepice', father: 'kohout', young: 'kuře', picture: photo('slepice', 'Slepice'), shows: 'mother' },
  { key: 'koza', mother: 'koza', father: 'kozel', young: 'kůzle', picture: photo('koza', 'Koza'), shows: 'mother' },
  { key: 'kachna', mother: 'kachna', father: 'kačer', young: 'káčátko', picture: ill('prvouka-kachna', '🦆', 'Kačer'), shows: 'father' },
  { key: 'srna', mother: 'srna', father: 'srnec', young: 'srnče', picture: ill('prvouka-srnka', '🦌', 'Srna'), shows: 'mother' },
  { key: 'jelen', mother: 'laň', father: 'jelen', young: 'kolouch', picture: ill('jelen', '🦌', 'Jelen'), shows: 'father' },
  { key: 'medved', mother: 'medvědice', father: 'medvěd', young: 'medvídě', picture: ill('matika-medved', '🐻', 'Medvěd'), shows: 'father' },
  { key: 'liska', mother: 'liška', father: 'lišák', young: 'liščátko', picture: photo('liska', 'Liška'), shows: 'mother' },
];

function capital(text: string): string {
  return `${text[0].toUpperCase()}${text.slice(1)}`;
}

function textOptions(correct: string, wrong: string[]): PrvoukaChoiceOption[] {
  return [correct, ...wrong].map((label) => ({ id: label, label: capital(label), correct: label === correct }));
}

export const zvirataGame: PrvoukaGame = {
  id: 'zvirata',
  name: 'Poznávačka zvířat',
  tagline: 'Kdo to je, kde žije, co jí a jak přečká zimu?',
  accent: '#803b50',
  surface: '#fff0e3',
  titleColor: '#883f59',
  cover: { kind: 'ill', id: 'prvouka-veverka', emoji: '🐿️', alt: 'Veverka' },
  topics: [
    { id: 'poznej', label: 'Kdo je to?', defaultGrades: [1, 2], pages: 'celý rok' },
    { id: 'hmyz', label: 'Hmyz, nebo ne?', defaultGrades: [1, 2], pages: '1/1/5' },
    { id: 'nohy', label: 'Kolik má nohou?', defaultGrades: [1, 2], pages: '1/1/5' },
    { id: 'mlada', label: 'Maminka, tatínek, mládě', defaultGrades: [1, 2], pages: '1/2/18–21' },
    { id: 'skupiny', label: 'Hospodářské, nebo volně žijící?', defaultGrades: [1], pages: '1/2/18–21' },
    { id: 'zima', label: 'Jak přečká zimu?', defaultGrades: [1, 2], pages: '1/1/23, 2/1/15, 2/1/28' },
    { id: 'domov', label: 'Kde žije?', defaultGrades: [2], pages: '1/2/34, 2/2/32–36' },
    { id: 'potrava', label: 'Co jí?', defaultGrades: [2], pages: '1/1/10, 2/2/40' },
  ],
  buildPool: ({ grade, topics, random }) => {
    const pool: PrvoukaQuestion[] = [];
    const on = (topic: string) => topics.includes(topic);
    const animals = ANIMALS.filter((animal) => animal.grade <= grade);
    // Možnosti se míchají semínkem z kola, aby se úloha při opakování nelišila jen pořadím.
    const local = createRandom(Math.floor(random() * 1e9));

    for (const animal of animals) {
      const base = { picture: animal.picture, hint: animal.fact };

      if (on('poznej')) {
        const sameGroup = animals.filter((other) => other.key !== animal.key && other.legs === animal.legs);
        const others = (sameGroup.length >= 2 ? sameGroup : animals.filter((other) => other.key !== animal.key));
        const wrong = pickMany(others, 2, local).map((other) => other.name);
        pool.push({
          key: `poznej:${animal.key}`,
          prompt: 'Které zvíře to je?',
          icons: ['pozoruj'],
          ...base,
          task: { kind: 'choice', layout: 'grid', options: textOptions(animal.name, wrong) },
          hint: animal.fact ? `To je ${animal.name}. ${animal.fact}` : `To je ${animal.name}.`,
        });
      }

      if (on('hmyz')) {
        pool.push({
          key: `hmyz:${animal.key}`,
          prompt: `Je ${animal.name} hmyz?`,
          icons: ['pozoruj'],
          ...base,
          caption: animal.name,
          task: {
            kind: 'choice',
            layout: 'yesno',
            options: [
              { id: 'ano', label: 'Ano', correct: animal.insect },
              { id: 'ne', label: 'Ne', correct: !animal.insect },
            ],
          },
          hint: animal.insect
            ? 'Hmyz má 6 nohou, tykadla a tělo ze tří částí: hlava, hruď a zadeček.'
            : `${capital(animal.name)} není hmyz – hmyz má 6 nohou a tykadla.`,
        });
      }

      if (on('nohy') && animal.legs !== undefined) {
        const values = [0, 2, 4, 6, 8].filter((value) => value !== animal.legs);
        const wrong = pickMany(values, 3, local);
        pool.push({
          key: `nohy:${animal.key}`,
          prompt: `Kolik nohou má ${animal.name}?`,
          icons: ['pocitej'],
          ...base,
          caption: animal.name,
          task: {
            kind: 'choice',
            layout: 'grid',
            options: [animal.legs, ...wrong].sort((a, b) => a - b).map((value) => ({ id: String(value), label: String(value), correct: value === animal.legs })),
          },
          hint: animal.legs === 2 ? 'Ptáci mají 2 nohy a 2 křídla.' : animal.legs === 6 ? 'Hmyz má 6 nohou.' : animal.legs === 0 ? `${capital(animal.name)} nemá žádné nohy.` : `${capital(animal.name)} má 4 nohy.`,
        });
      }

      if (on('zima') && animal.winter) {
        pool.push({
          key: `zima:${animal.key}`,
          prompt: `Co dělá ${animal.name} v zimě?`,
          icons: ['povidej'],
          ...base,
          caption: animal.name,
          task: {
            kind: 'choice',
            layout: 'grid',
            options: (Object.keys(WINTER_LABELS) as Winter[]).map((winter) => ({ id: winter, label: capital(WINTER_LABELS[winter]), correct: winter === animal.winter })),
          },
          hint: animal.fact ?? `${capital(animal.name)} ${WINTER_LABELS[animal.winter]}.`,
        });
      }

      if (on('domov')) {
        const excluded = new Set<Habitat>([...animal.habitats, ...(animal.maybe ?? [])]);
        const wrongPool = (Object.keys(HABITAT_LABELS) as Habitat[]).filter((habitat) => !excluded.has(habitat));
        if (wrongPool.length >= 2) {
          const right = animal.habitats[Math.floor(local() * animal.habitats.length)];
          const wrong = pickMany(wrongPool, 2, local);
          pool.push({
            key: `domov:${animal.key}`,
            prompt: `Kde žije ${animal.name}?`,
            icons: ['povidej'],
            ...base,
            caption: animal.name,
            task: {
              kind: 'choice',
              layout: 'grid',
              options: [right, ...wrong].map((habitat) => ({ id: habitat, label: capital(HABITAT_LABELS[habitat]), correct: habitat === right })),
            },
            hint: `${capital(animal.name)} žije ${animal.habitats.map((habitat) => HABITAT_LABELS[habitat]).join(' nebo ')}.`,
          });
        }
      }

      if (on('potrava') && animal.diet) {
        pool.push({
          key: `potrava:${animal.key}`,
          prompt: `Co jí ${animal.name}?`,
          icons: ['povidej'],
          ...base,
          caption: animal.name,
          task: {
            kind: 'choice',
            layout: 'grid',
            options: (Object.keys(DIET_LABELS) as Diet[]).map((diet) => ({ id: diet, label: capital(DIET_LABELS[diet]), correct: diet === animal.diet })),
          },
          hint: animal.fact ?? `${capital(animal.name)} jí ${DIET_LABELS[animal.diet]}.`,
        });
      }

      if (on('skupiny')) {
        pool.push({
          key: `skupiny:${animal.key}`,
          prompt: 'Kam zvíře patří?',
          icons: ['spoj'],
          ...base,
          caption: animal.name,
          task: {
            kind: 'choice',
            layout: 'baskets',
            options: (Object.keys(GROUP_LABELS) as Group[]).map((group) => ({ id: group, label: GROUP_LABELS[group], correct: group === animal.group })),
          },
          hint: animal.group === 'hospodarske'
            ? 'Hospodářská zvířata chová člověk pro užitek – mléko, vejce, vlnu, med.'
            : animal.group === 'domaci'
              ? 'Mazlíček žije s námi doma a staráme se o něj.'
              : 'Volně žijící zvíře se o sebe stará samo v přírodě.',
        });
      }
    }

    if (on('hmyz')) {
      // Najdi hmyz mezi třemi obrázky.
      const insects = animals.filter((animal) => animal.insect);
      const notInsects = animals.filter((animal) => !animal.insect && animal.picture.kind === 'ill');
      insects.forEach((insect, index) => {
        const wrong = pickMany(notInsects, 2, local);
        pool.push({
          key: `hmyz:najdi:${index}`,
          prompt: 'Který z nich je hmyz?',
          icons: ['zakrouzkuj'],
          task: {
            kind: 'choice',
            layout: 'pictures',
            options: shuffle([insect, ...wrong], local).map((animal) => ({ id: animal.key, label: capital(animal.name), picture: animal.picture, correct: animal.key === insect.key })),
          },
          hint: `${capital(insect.name)} je hmyz – má 6 nohou a tykadla.`,
        });
      });
    }

    if (on('mlada')) {
      const families = FAMILIES;
      for (const family of families) {
        const others = families.filter((other) => other.key !== family.key);
        const shown = family.shows === 'young' ? family.young : family.shows === 'mother' ? family.mother : family.father;
        if (family.shows !== 'young') {
          pool.push({
            key: `mlada:mlade:${family.key}`,
            prompt: `Jak se jmenuje mládě? Na obrázku je ${shown}.`,
            icons: ['povidej'],
            picture: family.picture,
            caption: shown,
            task: { kind: 'choice', layout: 'grid', options: textOptions(family.young, pickMany(others, 2, local).map((other) => other.young)) },
            hint: `${capital(family.mother)} a ${family.father} mají ${family.young}.`,
          });
        }
        if (family.shows !== 'mother') {
          pool.push({
            key: `mlada:maminka:${family.key}`,
            prompt: `Kdo je maminka? Na obrázku je ${shown}.`,
            icons: ['povidej'],
            picture: family.picture,
            caption: shown,
            task: { kind: 'choice', layout: 'grid', options: textOptions(family.mother, pickMany(others, 2, local).map((other) => other.mother)) },
            hint: `Maminka je ${family.mother}, tatínek ${family.father} a mládě ${family.young}.`,
          });
        }
        if (family.shows !== 'father') {
          pool.push({
            key: `mlada:tatinek:${family.key}`,
            prompt: `Kdo je tatínek? Na obrázku je ${shown}.`,
            icons: ['povidej'],
            picture: family.picture,
            caption: shown,
            task: { kind: 'choice', layout: 'grid', options: textOptions(family.father, pickMany(others, 2, local).map((other) => other.father)) },
            hint: `Maminka je ${family.mother}, tatínek ${family.father} a mládě ${family.young}.`,
          });
        }
      }
    }

    return pool;
  },
};
