/**
 * Prvoukové minihry v registru Miniher. Data a generátory úloh jsou v `./data`
 * (stejné jako v aplikaci Vividbooks Ultra), tady jen napojení na rozcestník
 * a konfigurátor.
 */
import { PRVOUKA_GAMES, defaultPrvoukaTopics } from './data/catalog';

const ILLUSTRATIONS = 'https://qypiuvqglsmxdsnyazih.supabase.co/storage/v1/object/public/platform-shared/laiout-illustrations/assets';

export type PrvoukaGameType = 'prvoukaZvirata' | 'prvoukaOvoce' | 'prvoukaHodiny' | 'prvoukaRokDen' | 'prvoukaBezpecnost';

export interface PrvoukaLandingGame {
  id: PrvoukaGameType;
  /** Id hry v `data/catalog.ts`. */
  dataId: string;
  name: string;
  /** Krátký popis na kartě (malým písmenem, jako u matematiky). */
  description: string;
  /** Delší popis v konfigurátoru. */
  longDescription: string;
  icon: string;
  /** Pastelová barva karty a pozadí konfigurátoru. */
  bg: string;
  /** Výchozí barva herní plochy (z nabídky pozadí Miniher). */
  playBg: string;
  /** Ilustrace z knihovny Laioutu pro kartu. */
  image: string;
  /** Výřez obrázku na kartě (`object-position`), když střed usekne hlavu. */
  imagePosition?: string;
}

export const PRVOUKA_LANDING_GAMES: PrvoukaLandingGame[] = [
  {
    id: 'prvoukaZvirata',
    dataId: 'zvirata',
    name: 'Poznávačka zvířat',
    description: 'kdo to je, kolik má nohou, kde žije a jak přečká zimu.',
    longDescription: 'Poznáváme zvířata z naší přírody i ze statku. Kolik mají nohou? Je to hmyz? Jak se jmenuje mládě a co dělá zvíře v zimě?',
    icon: '🐿️',
    bg: '#FFE5B4',
    playBg: '#F5E6D0',
    image: `${ILLUSTRATIONS}/prvouka-zlabatka-1300.png`,
  },
  {
    id: 'prvoukaOvoce',
    dataId: 'ovoce-zelenina',
    name: 'Ovoce a zelenina',
    description: 'třídíme úrodu do správné bedýnky.',
    longDescription: 'Obrázek se objeví nahoře a děti ho pošlou do správné bedýnky – ovoce, nebo zelenina? Ve 2. ročníku třídíme i plody dužnaté a suché.',
    icon: '🍎',
    bg: '#e0f2e6',
    playBg: '#E7F9EE',
    image: `${ILLUSTRATIONS}/ovoce-zelenina-1300.png`,
    imagePosition: 'center 15%',
  },
  {
    id: 'prvoukaHodiny',
    dataId: 'hodiny',
    name: 'Hodiny',
    description: 'čteme čas a nastavujeme ručičky.',
    longDescription: 'Kolik je hodin? Děti čtou ručičkové hodiny a samy táhnou za ručičky – celé hodiny, půl, čtvrt i tři čtvrtě. Ve 2. ročníku i digitální čas.',
    icon: '🕰️',
    bg: '#D0DBFF',
    playBg: '#D0DBFF',
    image: `${ILLUSTRATIONS}/prvouka-vstava-1300.png`,
    imagePosition: 'center 30%',
  },
  {
    id: 'prvoukaRokDen',
    dataId: 'rok-a-den',
    name: 'Rok a den',
    description: 'roční období, měsíce, svátky, týden i můj den.',
    longDescription: 'Orientujeme se v čase: kdy je jaké roční období, kdy jsou Vánoce a prázdniny, který den je po středě a kdy vstáváme, obědváme a spíme.',
    icon: '📅',
    bg: '#fcfbdc',
    playBg: '#FAF3D4',
    image: `${ILLUSTRATIONS}/podzim-zima-1300.png`,
  },
  {
    id: 'prvoukaBezpecnost',
    dataId: 'bezpecnost',
    name: 'Bezpečně venku',
    description: 'značky, přecházení, tísňová čísla a lékárnička.',
    longDescription: 'Dopravní značky ze sešitu, chodecký semafor, pravidla přecházení, komu zavolat v tísni (150, 155, 158, 112) a co patří do lékárničky.',
    icon: '🚸',
    bg: '#FFD3C5',
    playBg: '#FFE8ED',
    image: `${ILLUSTRATIONS}/prvouka-divka-telefon-1300.png`,
    imagePosition: 'center 12%',
  },
];

export const PRVOUKA_GAME_TYPES = PRVOUKA_LANDING_GAMES.map((game) => game.id);

export function prvoukaLandingGame(id: string): PrvoukaLandingGame | undefined {
  return PRVOUKA_LANDING_GAMES.find((game) => game.id === id);
}

/** Skupiny na rozcestníku prvouky (jako „Poznávám čísla“ u matematiky). */
export const PRVOUKA_GAME_GROUPS: Array<{ title: string; games: PrvoukaGameType[] }> = [
  { title: 'Poznávám přírodu', games: ['prvoukaZvirata', 'prvoukaOvoce'] },
  { title: 'Orientace v čase', games: ['prvoukaHodiny', 'prvoukaRokDen'] },
  { title: 'Bezpečí a zdraví', games: ['prvoukaBezpecnost'] },
];

/** Nastavení pro konfigurátor: ročník, témata, počet úloh, pozadí. */
export function prvoukaGameSettings(game: PrvoukaLandingGame, backgroundSettings: Record<string, any>) {
  const data = PRVOUKA_GAMES.find((item) => item.id === game.dataId);
  const topicOptions = (data?.topics ?? []).map((topic) => ({ value: topic.id, label: `${topic.label} (str. ${topic.pages})` }));
  return {
    ...backgroundSettings,
    backgroundColor: { ...backgroundSettings.backgroundColor, defaultValue: game.playBg },
    grade: {
      name: 'Ročník',
      type: 'select' as const,
      defaultValue: 1,
      options: [
        { value: 1, label: '1. ročník' },
        { value: 2, label: '2. ročník' },
      ],
      description: 'Podle ročníku se volí obtížnost (např. hodiny po půlhodinách, nebo po pěti minutách)',
    },
    topics: {
      name: 'Co procvičujeme',
      type: 'multiselect' as const,
      defaultValue: data ? defaultPrvoukaTopics(data, 1) : [],
      options: topicOptions,
      description: 'Témata podle stran pracovní učebnice prvouky (ročník/díl/strana)',
    },
    rounds: {
      name: 'Počet úloh',
      type: 'select' as const,
      defaultValue: 10,
      options: [
        { value: 5, label: '5 úloh' },
        { value: 10, label: '10 úloh' },
        { value: 15, label: '15 úloh' },
        { value: 20, label: '20 úloh' },
      ],
      description: 'Kolik úloh má jedno kolo (tři chyby a kolo končí)',
    },
  };
}
