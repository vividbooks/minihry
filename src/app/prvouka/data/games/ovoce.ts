import type { PrvoukaGame, PrvoukaPicture, PrvoukaQuestion } from '../types';

interface Produce {
  key: string;
  name: string;
  picture: PrvoukaPicture;
  kind: 'ovoce' | 'zelenina';
}

const ill = (id: string, emoji: string, alt: string): PrvoukaPicture => ({ kind: 'ill', id, emoji, alt });
const emoji = (value: string, alt: string): PrvoukaPicture => ({ kind: 'emoji', emoji: value, alt });

/**
 * Ovoce a zelenina (1/1/12). Kde má knihovna ilustrací Laioutu obrázek, bere se odtud.
 * Brambory, kukuřici a luštěniny záměrně vynecháváme – ve škole se o nich vede spor.
 */
const PRODUCE: Produce[] = [
  { key: 'jablko', name: 'jablko', picture: ill('prvouka-jablko', '🍎', 'Jablko'), kind: 'ovoce' },
  { key: 'banan', name: 'banán', picture: ill('prvouka-banan', '🍌', 'Banán'), kind: 'ovoce' },
  { key: 'svestka', name: 'švestka', picture: ill('matika-svestka', '🫐', 'Švestka'), kind: 'ovoce' },
  { key: 'boruvky', name: 'borůvky', picture: ill('matika-boruvka', '🫐', 'Borůvka'), kind: 'ovoce' },
  { key: 'mandarinka', name: 'mandarinka', picture: ill('matika-mandarinka', '🍊', 'Mandarinka'), kind: 'ovoce' },
  { key: 'maliny', name: 'maliny', picture: ill('prvouka-malinovnik', '🍓', 'Maliník s plody'), kind: 'ovoce' },
  { key: 'hruska', name: 'hruška', picture: emoji('🍐', 'Hruška'), kind: 'ovoce' },
  { key: 'tresne', name: 'třešně', picture: emoji('🍒', 'Třešně'), kind: 'ovoce' },
  { key: 'jahoda', name: 'jahoda', picture: emoji('🍓', 'Jahoda'), kind: 'ovoce' },
  { key: 'citron', name: 'citron', picture: emoji('🍋', 'Citron'), kind: 'ovoce' },
  { key: 'hrozny', name: 'hroznové víno', picture: emoji('🍇', 'Hroznové víno'), kind: 'ovoce' },
  { key: 'meloun', name: 'meloun', picture: emoji('🍉', 'Meloun'), kind: 'ovoce' },
  { key: 'broskev', name: 'broskev', picture: emoji('🍑', 'Broskev'), kind: 'ovoce' },
  { key: 'kiwi', name: 'kiwi', picture: emoji('🥝', 'Kiwi'), kind: 'ovoce' },
  { key: 'ananas', name: 'ananas', picture: emoji('🍍', 'Ananas'), kind: 'ovoce' },
  { key: 'mrkev', name: 'mrkev', picture: ill('prvouka-mrkev', '🥕', 'Mrkev'), kind: 'zelenina' },
  { key: 'cibule', name: 'cibule', picture: ill('prvouka-cibule', '🧅', 'Cibule'), kind: 'zelenina' },
  { key: 'dyne', name: 'dýně', picture: ill('prvouka-dyne', '🎃', 'Dýně'), kind: 'zelenina' },
  { key: 'rajce', name: 'rajče', picture: emoji('🍅', 'Rajče'), kind: 'zelenina' },
  { key: 'okurka', name: 'okurka', picture: emoji('🥒', 'Okurka'), kind: 'zelenina' },
  { key: 'paprika', name: 'paprika', picture: emoji('🫑', 'Paprika'), kind: 'zelenina' },
  { key: 'brokolice', name: 'brokolice', picture: emoji('🥦', 'Brokolice'), kind: 'zelenina' },
  { key: 'salat', name: 'salát', picture: emoji('🥬', 'Salát'), kind: 'zelenina' },
  { key: 'cesnek', name: 'česnek', picture: emoji('🧄', 'Česnek'), kind: 'zelenina' },
  { key: 'lilek', name: 'lilek', picture: emoji('🍆', 'Lilek'), kind: 'zelenina' },
];

interface Fruit {
  key: string;
  name: string;
  picture: PrvoukaPicture;
  kind: 'duznaty' | 'suchy';
}

/** Není plod jako plod (1/1/13) a Tajemství plodů (2/1/8). */
const FRUITS: Fruit[] = [
  { key: 'jablko', name: 'jablko', picture: ill('prvouka-jablko', '🍎', 'Jablko'), kind: 'duznaty' },
  { key: 'svestka', name: 'švestka', picture: ill('matika-svestka', '🫐', 'Švestka'), kind: 'duznaty' },
  { key: 'boruvky', name: 'borůvky', picture: ill('prvouka-boruvci', '🫐', 'Borůvčí'), kind: 'duznaty' },
  { key: 'sipek', name: 'jeřabiny a šípek', picture: ill('prvouka-jerabiny-sipek', '🍒', 'Jeřabiny a šípek'), kind: 'duznaty' },
  { key: 'maliny', name: 'maliny', picture: ill('prvouka-malinovnik', '🍓', 'Maliník'), kind: 'duznaty' },
  { key: 'dyne', name: 'dýně', picture: ill('prvouka-dyne', '🎃', 'Dýně'), kind: 'duznaty' },
  { key: 'vlassky', name: 'vlašský ořech', picture: ill('prvouka-vlassky-orech', '🌰', 'Vlašský ořech'), kind: 'suchy' },
  { key: 'liskovy', name: 'lískový ořech', picture: ill('prvouka-liskovy-orech', '🌰', 'Lískový ořech'), kind: 'suchy' },
  { key: 'zalud', name: 'žalud', picture: ill('prvouka-zalud', '🌰', 'Žalud'), kind: 'suchy' },
  { key: 'bukvice', name: 'bukvice', picture: ill('prvouka-bukvice', '🌰', 'Bukvice'), kind: 'suchy' },
  { key: 'mak', name: 'mák (makovice)', picture: ill('prvouka-mak', '🌾', 'Mák'), kind: 'suchy' },
  { key: 'obili', name: 'obilí', picture: ill('prvouka-obili', '🌾', 'Obilí'), kind: 'suchy' },
  { key: 'slunecnice', name: 'slunečnice', picture: ill('prvouka-slunecnice', '🌻', 'Slunečnice'), kind: 'suchy' },
];

export const ovoceGame: PrvoukaGame = {
  id: 'ovoce-zelenina',
  name: 'Ovoce a zelenina',
  tagline: 'Roztřiď úrodu do správného košíku.',
  accent: '#185e4a',
  surface: '#def4ec',
  titleColor: '#185e4a',
  cover: { kind: 'ill', id: 'prvouka-jablko', emoji: '🍎', alt: 'Jablko' },
  topics: [
    { id: 'ovoce-zelenina', label: 'Ovoce, nebo zelenina?', defaultGrades: [1, 2], pages: '1/1/12' },
    { id: 'plody', label: 'Dužnatý, nebo suchý plod?', defaultGrades: [2], pages: '1/1/13, 2/1/8–9' },
  ],
  buildPool: ({ topics }) => {
    const pool: PrvoukaQuestion[] = [];
    if (topics.includes('ovoce-zelenina')) {
      for (const item of PRODUCE) {
        pool.push({
          key: `ovoce-zelenina:${item.key}`,
          prompt: 'Je to ovoce, nebo zelenina?',
          icons: ['spoj'],
          picture: item.picture,
          caption: item.name,
          task: {
            kind: 'choice',
            layout: 'baskets',
            options: [
              { id: 'ovoce', label: 'Ovoce', correct: item.kind === 'ovoce' },
              { id: 'zelenina', label: 'Zelenina', correct: item.kind === 'zelenina' },
            ],
          },
          hint: item.kind === 'ovoce'
            ? `${item.name[0].toUpperCase()}${item.name.slice(1)} patří k ovoci.`
            : `${item.name[0].toUpperCase()}${item.name.slice(1)} patří k zelenině.`,
        });
      }
    }
    if (topics.includes('plody')) {
      for (const item of FRUITS) {
        pool.push({
          key: `plody:${item.key}`,
          prompt: 'Je to plod dužnatý, nebo suchý?',
          icons: ['spoj'],
          picture: item.picture,
          caption: item.name,
          task: {
            kind: 'choice',
            layout: 'baskets',
            options: [
              { id: 'duznaty', label: 'Dužnatý', correct: item.kind === 'duznaty' },
              { id: 'suchy', label: 'Suchý', correct: item.kind === 'suchy' },
            ],
          },
          hint: item.kind === 'duznaty'
            ? 'Dužnatý plod je šťavnatý a měkký, semena jsou schovaná uvnitř dužniny.'
            : 'Suchý plod nemá šťavnatou dužninu – má tvrdý obal nebo skořápku.',
        });
      }
    }
    return pool;
  },
};
