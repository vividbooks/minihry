/** Piktogram zadání ze sešitu (v minihrách se nevykresluje, drží se kvůli shodě dat s Ultra). */
export type CzechPromptIconId = string;

/** Ročník, pro který je úloha; hra si podle něj vybírá témata a obtížnost. */
export type PrvoukaGrade = 1 | 2;

/** Dopravní značky – SVG z přílohy sešitu 2. ročníku (Doprava venku), v `public/prvouka-img/znacky`. */
export type PrvoukaSignId =
  | 'zakaz-vjezdu'
  | 'pozor-deti'
  | 'zakaz-cyklistu'
  | 'stezka-cyklisti'
  | 'obytna-zona'
  | 'stop'
  | 'stezka-chodci'
  | 'prechod'
  | 'parkoviste'
  | 'hlavni-silnice'
  | 'zakaz-chodcu'
  | 'dej-prednost'
  | 'semafor-cervena'
  | 'semafor-zelena';

/**
 * Obrázek úlohy. `ill` je ilustrace z knihovny Laioutu (podle id v katalogu);
 * když v knihovně chybí, ukáže se `emoji`.
 */
export type PrvoukaPicture =
  | { kind: 'ill'; id: string; emoji: string; alt: string }
  | { kind: 'emoji'; emoji: string; alt: string }
  /** Fotka z Wikimedia Commons (licence v `public/prvouka/foto/credits.json`). */
  | { kind: 'photo'; src: string; alt: string }
  | { kind: 'sign'; sign: PrvoukaSignId; alt: string }
  | { kind: 'clock'; hour: number; minute: number; show24?: boolean }
  | { kind: 'digital'; text: string; note?: string };

export interface PrvoukaChoiceOption {
  id: string;
  label: string;
  picture?: PrvoukaPicture;
  correct: boolean;
}

export type PrvoukaBoard = 'months' | 'week' | 'dayparts' | 'seasons';

export type PrvoukaTask =
  | {
    kind: 'choice';
    /** grid = karty, yesno = Ano/Ne, baskets = třídění do košů, pictures = vyber obrázek. */
    layout: 'grid' | 'yesno' | 'baskets' | 'pictures';
    options: PrvoukaChoiceOption[];
  }
  | { kind: 'clock-set'; hour: number; minute: number; step: number; show24?: boolean }
  | {
    kind: 'board';
    board: PrvoukaBoard;
    correct: number[];
    /** all = vyber všechna správná a potvrď, any = stačí klepnout na jedno ze správných. */
    mode: 'all' | 'any';
  };

export interface PrvoukaQuestion {
  /** Stabilní klíč, aby se v jednom kole úloha neopakovala. */
  key: string;
  prompt: string;
  icons?: CzechPromptIconId[];
  picture?: PrvoukaPicture;
  /** Popisek pod obrázkem (jméno zvířete, plodu…). */
  caption?: string;
  /** `bubble` = popisek říká postava na obrázku (bublina jako v sešitě). */
  captionStyle?: 'bubble';
  task: PrvoukaTask;
  /** Krátké vysvětlení, které se ukáže po druhé chybě spolu se správnou odpovědí. */
  hint?: string;
}

export interface PrvoukaTopic {
  id: string;
  label: string;
  /** Ročníky, ve kterých je téma zapnuté od začátku. */
  defaultGrades: PrvoukaGrade[];
  /** Kde je téma v pracovní učebnici (ročník/díl/strana). */
  pages: string;
}

export interface PrvoukaBuildConfig {
  grade: PrvoukaGrade;
  topics: string[];
  random: () => number;
}

export interface PrvoukaGame {
  id: string;
  name: string;
  tagline: string;
  /** Barvy podle ročního období stránky sešitu: text a čísla úloh, pozadí stránky, nadpis. */
  accent: string;
  surface: string;
  titleColor: string;
  cover: PrvoukaPicture;
  topics: PrvoukaTopic[];
  /** Vrátí zásobník všech úloh pro zvolená témata; běh z něj vybírá. */
  buildPool: (config: PrvoukaBuildConfig) => PrvoukaQuestion[];
}
