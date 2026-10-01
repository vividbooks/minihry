import type { PrvoukaChoiceOption, PrvoukaGame, PrvoukaPicture, PrvoukaQuestion } from '../types';

export const MONTHS = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];
/** 6. pád: po březnu, před dubnem — tvary pro otázky „po kterém“. */
const MONTHS_AFTER = ['lednu', 'únoru', 'březnu', 'dubnu', 'květnu', 'červnu', 'červenci', 'srpnu', 'září', 'říjnu', 'listopadu', 'prosinci'];
/** 7. pád: před březnem. */
const MONTHS_BEFORE = ['lednem', 'únorem', 'březnem', 'dubnem', 'květnem', 'červnem', 'červencem', 'srpnem', 'zářím', 'říjnem', 'listopadem', 'prosincem'];

export const SEASONS = ['jaro', 'léto', 'podzim', 'zima'];
/** Školní dělení: jaro březen–květen, léto červen–srpen, podzim září–listopad, zima prosinec–únor. */
export function seasonOfMonth(month: number): number {
  if (month >= 2 && month <= 4) return 0;
  if (month >= 5 && month <= 7) return 1;
  if (month >= 8 && month <= 10) return 2;
  return 3;
}

export const WEEK_DAYS = ['pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota', 'neděle'];
const WEEK_AFTER = ['pondělí', 'úterý', 'středě', 'čtvrtku', 'pátku', 'sobotě', 'neděli'];
const WEEK_BEFORE = ['pondělím', 'úterým', 'středou', 'čtvrtkem', 'pátkem', 'sobotou', 'nedělí'];
const WEEK_WAS = ['bylo pondělí', 'bylo úterý', 'byla středa', 'byl čtvrtek', 'byl pátek', 'byla sobota', 'byla neděle'];

export const DAY_PARTS = ['ráno', 'dopoledne', 'poledne', 'odpoledne', 'večer', 'noc'];

const ill = (id: string, emoji: string, alt: string): PrvoukaPicture => ({ kind: 'ill', id, emoji, alt });
const photo = (key: string, alt: string): PrvoukaPicture => ({ kind: 'photo', src: `/prvouka/foto/${key}.jpg`, alt });

interface CalendarFact {
  key: string;
  prompt: string;
  months: number[];
  mode: 'all' | 'any';
  picture?: PrvoukaPicture;
  hint: string;
  grade: 1 | 2;
}

/** Svátky, prázdniny a školní rok — měsíce podle českého školního kalendáře. */
const CALENDAR_FACTS: CalendarFact[] = [
  { key: 'vanoce', prompt: 'Ve kterém měsíci jsou Vánoce?', months: [11], mode: 'any', picture: ill('prvouka-hvezda', '🎄', 'Vánoční hvězda'), hint: 'Štědrý den je 24. prosince.', grade: 1 },
  { key: 'mikulas', prompt: 'Ve kterém měsíci chodí Mikuláš?', months: [11], mode: 'any', hint: 'Mikuláš chodí 5. prosince večer.', grade: 1 },
  { key: 'silvestr', prompt: 'Ve kterém měsíci je Silvestr – poslední den v roce?', months: [11], mode: 'any', hint: 'Silvestr je 31. prosince, pak začíná nový rok.', grade: 1 },
  { key: 'novy-rok', prompt: 'Ve kterém měsíci začíná nový rok?', months: [0], mode: 'any', hint: 'Nový rok je 1. ledna.', grade: 1 },
  { key: 'velikonoce', prompt: 'Ve kterém měsíci bývají Velikonoce?', months: [2, 3], mode: 'any', picture: ill('prvouka-rehtacka', '🐣', 'Řehtačka'), hint: 'Velikonoce jsou na jaře – v březnu nebo v dubnu.', grade: 1 },
  { key: 'skola-zacina', prompt: 'Ve kterém měsíci začíná škola?', months: [8], mode: 'any', picture: ill('prvouka-dite-batoh', '🎒', 'Dítě s batohem'), hint: 'Školní rok začíná 1. září.', grade: 1 },
  { key: 'letni-prazdniny', prompt: 'Kdy jsou letní prázdniny? Vyber oba měsíce.', months: [6, 7], mode: 'all', picture: ill('prvouka-obili', '🌾', 'Zralé obilí'), hint: 'Letní prázdniny jsou v červenci a v srpnu.', grade: 1 },
  { key: 'vysvedceni', prompt: 'Kdy dostáváme vysvědčení? Vyber oba měsíce.', months: [0, 5], mode: 'all', hint: 'Pololetní vysvědčení je na konci ledna, závěrečné na konci června.', grade: 1 },
  { key: 'den-deti', prompt: 'Ve kterém měsíci je Den dětí?', months: [5], mode: 'any', hint: 'Den dětí je 1. června.', grade: 1 },
  { key: 'den-matek', prompt: 'Ve kterém měsíci slavíme Den matek?', months: [4], mode: 'any', hint: 'Den matek je druhou neděli v květnu.', grade: 2 },
  { key: 'martin', prompt: 'Ve kterém měsíci přijíždí Martin na bílém koni?', months: [10], mode: 'any', hint: 'Svatý Martin má svátek 11. listopadu.', grade: 2 },
  { key: 'podzimni-prazdniny', prompt: 'Ve kterém měsíci bývají podzimní prázdniny?', months: [9], mode: 'any', hint: 'Podzimní prázdniny jsou na konci října.', grade: 2 },
  { key: 'slunovrat', prompt: 'Ve kterém měsíci je nejkratší den v roce?', months: [11], mode: 'any', picture: photo('mesic', 'Měsíc'), hint: 'Zimní slunovrat je kolem 21. prosince – den je nejkratší a noc nejdelší.', grade: 2 },
  { key: 'nejdelsi-den', prompt: 'Ve kterém měsíci je nejdelší den v roce?', months: [5], mode: 'any', hint: 'Letní slunovrat je kolem 21. června.', grade: 2 },
];

interface DayFact {
  key: string;
  prompt: string;
  parts: number[];
  mode: 'all' | 'any';
  picture?: PrvoukaPicture;
  hint: string;
}

/** Můj den (1/1/15) a den a noc (2/1/38). */
const DAY_FACTS: DayFact[] = [
  { key: 'vstavame', prompt: 'Kdy vstáváme?', parts: [0], mode: 'any', picture: ill('prvouka-vstava', '⏰', 'Kluk se ráno obléká'), hint: 'Vstáváme ráno.' },
  { key: 'snidane', prompt: 'Kdy snídáme?', parts: [0], mode: 'any', hint: 'Snídaně je ráno, než jdeme do školy.' },
  { key: 'skola', prompt: 'Kdy jsme ve škole?', parts: [1], mode: 'any', picture: ill('prvouka-school', '🏫', 'Škola'), hint: 'Vyučování je hlavně dopoledne.' },
  { key: 'obed', prompt: 'Kdy obědváme?', parts: [2], mode: 'any', picture: ill('prvouka-obed', '🍽️', 'Oběd ve škole'), hint: 'Obědváme v poledne.' },
  { key: 'hriste', prompt: 'Kdy si po škole hrajeme venku?', parts: [3], mode: 'any', picture: ill('prvouka-hriste', '🛝', 'Děti na hřišti'), hint: 'Po škole je odpoledne.' },
  { key: 'vecere', prompt: 'Kdy večeříme?', parts: [4], mode: 'any', picture: ill('prvouka-vecere', '🍲', 'Večeře doma'), hint: 'Večeře je večer.' },
  { key: 'spime', prompt: 'Kdy spíme?', parts: [5], mode: 'any', picture: ill('prvouka-sleep', '😴', 'Spánek'), hint: 'Spíme v noci.' },
  { key: 'zuby', prompt: 'Kdy si čistíme zuby? Vyber obě části dne.', parts: [0, 4], mode: 'all', picture: ill('prvouka-zuby', '🪥', 'Čištění zubů'), hint: 'Zuby si čistíme ráno a večer.' },
  { key: 'hvezdy', prompt: 'Kdy vidíme hvězdy a Měsíc?', parts: [5], mode: 'any', picture: photo('mesic', 'Měsíc'), hint: 'Hvězdy svítí v noci, když je tma.' },
  { key: 'slunce-nejvys', prompt: 'Kdy je Slunce na obloze nejvýš?', parts: [2], mode: 'any', hint: 'V poledne je Slunce nejvýš.' },
  { key: 'netopyr', prompt: 'Kdy loví netopýr?', parts: [5], mode: 'any', picture: ill('prvouka-netopyr', '🦇', 'Netopýr'), hint: 'Netopýr je noční zvíře.' },
];

function numberOptions(correct: number, distractors: number[], unit: (n: number) => string): PrvoukaChoiceOption[] {
  return [correct, ...distractors].map((value) => ({ id: String(value), label: unit(value), correct: value === correct }));
}

const plural = (one: string, few: string, many: string) => (n: number) => `${n} ${n === 1 ? one : n >= 2 && n <= 4 ? few : many}`;

export const casGame: PrvoukaGame = {
  id: 'rok-a-den',
  name: 'Rok a den',
  tagline: 'Roční období, měsíce, svátky, týden i můj den.',
  accent: '#803b50',
  surface: '#fff6c9',
  titleColor: '#803b50',
  cover: { kind: 'ill', id: 'prvouka-vstava', emoji: '⏰', alt: 'Kluk se ráno obléká' },
  topics: [
    { id: 'obdobi', label: 'Roční období', defaultGrades: [1, 2], pages: '1/1/18, 1/1/30' },
    { id: 'mesice', label: 'Měsíce v roce', defaultGrades: [1, 2], pages: '1/1/30' },
    { id: 'svatky', label: 'Svátky a prázdniny', defaultGrades: [1, 2], pages: '1/1/25, 1/1/29, 1/2/14' },
    { id: 'tyden', label: 'Dny v týdnu', defaultGrades: [1, 2], pages: '1/1/31' },
    { id: 'den', label: 'Můj den', defaultGrades: [1, 2], pages: '1/1/15, 2/1/38' },
  ],
  buildPool: ({ grade, topics }) => {
    const pool: PrvoukaQuestion[] = [];
    const on = (topic: string) => topics.includes(topic);

    if (on('obdobi')) {
      MONTHS.forEach((month, index) => {
        pool.push({
          key: `obdobi:mesic:${index}`,
          prompt: `Do kterého ročního období patří ${month}?`,
          icons: ['zakrouzkuj'],
          caption: month,
          task: { kind: 'board', board: 'seasons', correct: [seasonOfMonth(index)], mode: 'any' },
          hint: `${month[0].toUpperCase()}${month.slice(1)} patří k období ${SEASONS[seasonOfMonth(index)]}.`,
        });
      });
      SEASONS.forEach((season, index) => {
        const months = MONTHS.map((_, m) => m).filter((m) => seasonOfMonth(m) === index);
        pool.push({
          key: `obdobi:tri:${index}`,
          prompt: `Které tři měsíce patří k ${season === 'jaro' ? 'jaru' : season === 'léto' ? 'létu' : season === 'podzim' ? 'podzimu' : 'zimě'}?`,
          icons: ['zakrouzkuj'],
          task: { kind: 'board', board: 'months', correct: months, mode: 'all' },
          hint: `${season[0].toUpperCase()}${season.slice(1)}: ${months.map((m) => MONTHS[m]).join(', ')}.`,
        });
      });
      const seasonPictures: Array<{ season: number; picture: PrvoukaPicture; caption: string }> = [
        { season: 0, picture: ill('prvouka-snezanka', '🌷', 'Sněženka'), caption: 'Kvete sněženka.' },
        { season: 0, picture: ill('prvouka-bledule', '🌷', 'Bledule'), caption: 'Kvetou bledule.' },
        { season: 1, picture: ill('prvouka-obili', '🌾', 'Obilí'), caption: 'Dozrává obilí.' },
        { season: 2, picture: ill('prvouka-javorove-listy', '🍂', 'Javorové listy'), caption: 'Listy se barví a padají.' },
        { season: 2, picture: ill('prvouka-dyne', '🎃', 'Dýně'), caption: 'Sklízíme dýně.' },
        { season: 3, picture: ill('prvouka-hranostaj-bily', '❄️', 'Hranostaj v bílé srsti'), caption: 'Hranostaj má bílý kožich.' },
        { season: 3, picture: ill('prvouka-krmitko', '🐦', 'Krmítko'), caption: 'Ptáci chodí na krmítko.' },
        { season: 1, picture: ill('prvouka-slunecnice', '🌻', 'Slunečnice'), caption: 'Kvete slunečnice.' },
      ];
      seasonPictures.forEach((item, index) => {
        pool.push({
          key: `obdobi:obrazek:${index}`,
          prompt: 'Které je to roční období?',
          icons: ['pozoruj'],
          picture: item.picture,
          caption: item.caption,
          task: { kind: 'board', board: 'seasons', correct: [item.season], mode: 'any' },
          hint: `To je ${SEASONS[item.season]}.`,
        });
      });
    }

    if (on('mesice')) {
      MONTHS.forEach((month, index) => {
        const after = (index + 1) % 12;
        const before = (index + 11) % 12;
        pool.push({
          key: `mesice:po:${index}`,
          prompt: `Který měsíc je po ${MONTHS_AFTER[index]}?`,
          icons: ['zakrouzkuj'],
          task: { kind: 'board', board: 'months', correct: [after], mode: 'any' },
          hint: `Po ${MONTHS_AFTER[index]} přichází ${MONTHS[after]}.`,
        });
        pool.push({
          key: `mesice:pred:${index}`,
          prompt: `Který měsíc je před ${MONTHS_BEFORE[index]}?`,
          icons: ['zakrouzkuj'],
          task: { kind: 'board', board: 'months', correct: [before], mode: 'any' },
          hint: `Před ${MONTHS_BEFORE[index]} je ${MONTHS[before]}.`,
        });
        pool.push({
          key: `mesice:najdi:${index}`,
          prompt: `Najdi v kruhu měsíc ${month}.`,
          icons: ['hledej'],
          task: { kind: 'board', board: 'months', correct: [index], mode: 'any' },
          hint: `${month[0].toUpperCase()}${month.slice(1)} je ${index + 1}. měsíc v roce.`,
        });
      });
      pool.push({
        key: 'mesice:pocet',
        prompt: 'Kolik měsíců má rok?',
        icons: ['pocitej'],
        task: { kind: 'choice', layout: 'grid', options: numberOptions(12, [10, 7, 4], plural('měsíc', 'měsíce', 'měsíců')) },
        hint: 'Rok má 12 měsíců.',
      });
      pool.push({
        key: 'mesice:obdobi-pocet',
        prompt: 'Kolik ročních období má rok?',
        icons: ['pocitej'],
        task: { kind: 'choice', layout: 'grid', options: numberOptions(4, [2, 3, 12], plural('období', 'období', 'období')) },
        hint: 'Jaro, léto, podzim a zima – čtyři roční období.',
      });
    }

    if (on('svatky')) {
      for (const fact of CALENDAR_FACTS) {
        if (fact.grade > grade) continue;
        pool.push({
          key: `svatky:${fact.key}`,
          prompt: fact.prompt,
          icons: ['zakrouzkuj'],
          picture: fact.picture,
          task: { kind: 'board', board: 'months', correct: fact.months, mode: fact.mode },
          hint: fact.hint,
        });
      }
    }

    if (on('tyden')) {
      WEEK_DAYS.forEach((day, index) => {
        const after = (index + 1) % 7;
        const before = (index + 6) % 7;
        pool.push({
          key: `tyden:po:${index}`,
          prompt: `Který den je po ${WEEK_AFTER[index]}?`,
          icons: ['zakrouzkuj'],
          task: { kind: 'board', board: 'week', correct: [after], mode: 'any' },
          hint: `Po ${WEEK_AFTER[index]} je ${WEEK_DAYS[after]}.`,
        });
        pool.push({
          key: `tyden:pred:${index}`,
          prompt: `Který den je před ${WEEK_BEFORE[index]}?`,
          icons: ['zakrouzkuj'],
          task: { kind: 'board', board: 'week', correct: [before], mode: 'any' },
          hint: `Před ${WEEK_BEFORE[index]} je ${WEEK_DAYS[before]}.`,
        });
        pool.push({
          key: `tyden:zitra:${index}`,
          prompt: `Dnes je ${day}. Jaký den bude zítra?`,
          icons: ['zakrouzkuj'],
          task: { kind: 'board', board: 'week', correct: [after], mode: 'any' },
          hint: `Když je dnes ${day}, zítra bude ${WEEK_DAYS[after]}.`,
        });
        if (grade === 2) {
          pool.push({
            key: `tyden:vcera:${index}`,
            prompt: `Včera ${WEEK_WAS[before]}. Jaký den je dnes?`,
            icons: ['zakrouzkuj'],
            task: { kind: 'board', board: 'week', correct: [index], mode: 'any' },
            hint: `Po ${WEEK_AFTER[before]} je ${day}.`,
          });
        }
      });
      pool.push({
        key: 'tyden:vikend',
        prompt: 'Které dny jsou víkend? Vyber oba.',
        icons: ['zakrouzkuj'],
        task: { kind: 'board', board: 'week', correct: [5, 6], mode: 'all' },
        hint: 'Víkend je sobota a neděle.',
      });
      pool.push({
        key: 'tyden:skola',
        prompt: 'Ve které dny chodíme do školy? Vyber všechny.',
        icons: ['zakrouzkuj'],
        picture: ill('prvouka-dite-batoh', '🎒', 'Dítě s batohem'),
        task: { kind: 'board', board: 'week', correct: [0, 1, 2, 3, 4], mode: 'all' },
        hint: 'Do školy chodíme od pondělí do pátku.',
      });
      pool.push({
        key: 'tyden:pocet',
        prompt: 'Kolik dní má týden?',
        icons: ['pocitej'],
        task: { kind: 'choice', layout: 'grid', options: numberOptions(7, [5, 10, 12], plural('den', 'dny', 'dní')) },
        hint: 'Týden má 7 dní.',
      });
    }

    if (on('den')) {
      for (const fact of DAY_FACTS) {
        pool.push({
          key: `den:${fact.key}`,
          prompt: fact.prompt,
          icons: ['zakrouzkuj'],
          picture: fact.picture,
          task: { kind: 'board', board: 'dayparts', correct: fact.parts, mode: fact.mode },
          hint: fact.hint,
        });
      }
      if (grade === 2) {
        pool.push({
          key: 'den:hodin',
          prompt: 'Kolik hodin má celý den i s nocí?',
          icons: ['pocitej'],
          task: { kind: 'choice', layout: 'grid', options: numberOptions(24, [12, 10, 60], plural('hodina', 'hodiny', 'hodin')) },
          hint: 'Den a noc mají dohromady 24 hodin – tolik, než se Země jednou otočí.',
        });
        pool.push({
          key: 'den:proc-noc',
          prompt: 'Proč se střídá den a noc?',
          icons: ['povidej'],
          task: {
            kind: 'choice',
            layout: 'grid',
            options: [
              { id: 'otaci', label: 'Země se otáčí', correct: true },
              { id: 'zhasne', label: 'Slunce večer zhasne', correct: false },
              { id: 'mraky', label: 'Slunce zakryjí mraky', correct: false },
            ],
          },
          hint: 'Země se otáčí. Strana obrácená ke Slunci má den, odvrácená noc.',
        });
      }
    }

    return pool;
  },
};
