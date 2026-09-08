import { buildGameShareURL, compactGameSettings, mergeGameSettings } from '../utils/gameShareUrl';

// Centrální registr všech her a jejich parametrů

export type GameType = 'numberRecognition' | 'numberSequence' | 'patternSequence' | 'mathCrossword' | 'robotNavigation' | 'numberComparison' | 'quantityComparison' | 'mathPractice' | 'mirrorDrawing' | 'tilingGame' | 'dominoGame' | 'moneyExchange' | 'boardGame' | 'mrBall' | 'countingGame' | 'mathSnake' | 'imageReveal' | 'buildNumber';

export interface GameConfig {
  id: GameType;
  name: string;
  description: string;
  icon: string;
  component: string;
  settings: GameSettings;
  previewImage?: string;
}

export interface GameSettings {
  [key: string]: GameSetting;
}

export interface GameSetting {
  name: string;
  type: 'number' | 'select' | 'boolean' | 'range' | 'multiselect' | 'string';
  defaultValue: any;
  options?: any[];
  min?: number;
  max?: number;
  step?: number;
  description: string;
}

// Univerzální nastavení pozadí
const BACKGROUND_SETTINGS = {
  backgroundColor: {
    name: 'Barva pozadí',
    type: 'select' as const,
    defaultValue: '#F5E6D0',
    options: [
      { value: '#9D94FF', label: 'Fialová' },
      { value: '#FFE8ED', label: 'Růžová' },
      { value: '#E8CDD6', label: 'Světle růžová' },
      { value: '#E7F9EE', label: 'Světle zelená' },
      { value: '#FAF3D4', label: 'Žlutá' },
      { value: '#F5E6D0', label: 'Béžová (výchozí)' },
      { value: '#FCEEEF', label: 'Světle růžová (koruny)' },
      { value: '#D0DBFF', label: 'Světle modrá (kartičky)' }
    ],
    description: 'Barva pozadí hry'
  }
};

// Nastavení pro deskovou hru "Člověče nezlob se"
export const BOARD_GAME_SETTINGS: GameSettings = {
  ...BACKGROUND_SETTINGS,
  startingLevel: {
    name: 'Počáteční úroveň',
    type: 'select',
    defaultValue: 1,
    options: [
      { value: 1, label: '1★ Level 1 - Rovná cesta (10 políček, 1 kostka, 3 balíčky)' }
    ],
    description: 'Úroveň obtížnosti hry'
  },
  allowMixedDirections: {
    name: 'Kombinace směrů',
    type: 'boolean',
    defaultValue: false,
    description: 'Povolit kombinaci směrů vpřed a vzad v jednom tahu. Když je vypnuto, hráč může jít pouze jedním směrem.'
  },
  autoIntroVideo: {
    name: 'Automatické intro video',
    type: 'boolean',
    defaultValue: true,
    description: 'Zobrazit motivační video před začátkem hry'
  }
};

// Nastavení pro hru "Pan Kulička"
export const MR_BALL_SETTINGS: GameSettings = {
  ...BACKGROUND_SETTINGS,
  difficulty: {
    name: 'Úroveň obtížnosti',
    type: 'select',
    defaultValue: 2,
    options: [
      { value: 1, label: '1★ Úroveň 1 - 5 políček, 3 patra, 1 kostka' },
      { value: 2, label: '2★★ Úroveň 2 - 7 políček, 4 patra, 1 kostka' },
      { value: 3, label: '3★★★ Úroveň 3 - 10 políček, 5 pater, 2 kostky' }
    ],
    description: 'Zvolte úroveň obtížnosti - ovlivňuje velikost hrací plochy a počet kostek'
  },
  autoIntroVideo: {
    name: 'Automatické intro video',
    type: 'boolean',
    defaultValue: true,
    description: 'Zobrazit motivační video před začátkem hry'
  }
};

// Nastavení pro hru Poznej čísla
export const NUMBER_RECOGNITION_SETTINGS: GameSettings = {
  ...BACKGROUND_SETTINGS,
  numberRange: {
    name: 'Rozsah čísel',
    type: 'range',
    defaultValue: [1, 9],
    min: 0,
    max: 20,
    description: 'Nejmenší a největší číslo, které se může objevit'
  },
  totalRounds: {
    name: 'Počet kol',
    type: 'number',
    defaultValue: 10,
    min: 5,
    max: 20,
    description: 'Celkový počet herních kol'
  },
  timeBasedGame: {
    name: 'Hra na čas',
    type: 'boolean',
    defaultValue: true,
    description: 'Zapnout časové omezení na každé kolo. Při vypnutí hra poběží bez časomíry.'
  },
  timeLimit: {
    name: 'Časový limit (sekundy)',
    type: 'number', 
    defaultValue: 30,
    min: 15,
    max: 60,
    description: 'Čas na dokončení jednoho kola'
  },
  maxLives: {
    name: 'Počet životů',
    type: 'number',
    defaultValue: 3,
    min: 1,
    max: 5,
    description: 'Počet chyb před koncem hry'
  },
  challengeTypes: {
    name: 'Typy zadání',
    type: 'multiselect',
    defaultValue: ['written', 'dots', 'objects', 'sound', 'blink'],
    options: [
      { value: 'written', label: 'Napsané číslo' },
      { value: 'dots', label: 'Tečky (domino)' },
      { value: 'objects', label: 'Objekty (emoji)' },
      { value: 'sound', label: 'Zvukové pípnutí' },
      { value: 'blink', label: 'Blikání diody' }
    ],
    description: 'Způsoby zobrazení čísel'
  },
  taskTypes: {
    name: 'Typy úkolů',
    type: 'multiselect', 
    defaultValue: ['tap', 'select', 'dots', 'click', 'tally', 'dice'],
    options: [
      { value: 'tap', label: 'Vyťukávání mezerníkem' },
      { value: 'select', label: 'Výběr čísla' },
      { value: 'dots', label: 'Označování teček' },
      { value: 'click', label: 'Naklikávání objektů' },
      { value: 'tally', label: 'Počítání čárek' },
      { value: 'dice', label: 'Hrací kostka - nastavení teček' }
    ],
    description: 'Způsoby odpovídání'
  }
};

// Nastavení pro číselné sekvence  
export const NUMBER_SEQUENCE_SETTINGS: GameSettings = {
  ...BACKGROUND_SETTINGS,
  cardTypes: {
    name: 'Typy kartiček',
    type: 'multiselect',
    defaultValue: ['handwritten'],
    options: [
      { value: 'standard', label: '🔢 Číslice (standardní font)' },
      { value: 'handwritten', label: '✏️ Psací číslice (dětský font)' },
      { value: 'dots', label: '⚀ Tečky (kostky, pouze 0-12)' }
    ],
    description: 'Jaké typy kartiček se budou zobrazovat. Kola se střídají mezi vybranými typy.'
  },
  sequenceTypes: {
    name: 'Typy řad',
    type: 'multiselect',
    defaultValue: ['ascending', 'descending', 'even', 'odd'],
    options: [
      { value: 'ascending', label: 'Vzestupné řady (1,2,3...)' },
      { value: 'descending', label: 'Sestupné řady (10,9,8...)' },
      { value: 'even', label: 'Sudá čísla (2,4,6...)' },
      { value: 'odd', label: 'Lichá čísla (1,3,5...)' },
      { value: 'multiples3', label: 'Násobky 3 (0,3,6...)' },
      { value: 'multiples4', label: 'Násobky 4 (0,4,8...)' },
      { value: 'multiples5', label: 'Násobky 5 (0,5,10...)' }
    ],
    description: 'Jaké typy číselných řad se budou objevovat'
  },
  sequenceLength: {
    name: 'Délka sekvence',
    type: 'range',
    defaultValue: [6, 10],
    min: 4,
    max: 15,
    description: 'Rozsah délky číselných řad'
  },
  missingCount: {
    name: 'Počet chybějících čísel',
    type: 'range', 
    defaultValue: [3, 6],
    min: 2,
    max: 8,
    description: 'Kolik čísel bude chybět v sekvenci'
  },
  numberRange: {
    name: 'Rozsah čísel',
    type: 'range',
    defaultValue: [1, 10],
    min: 0,
    max: 30,
    description: 'Nejmenší a největší číslo, které se může objevit v sekvenci'
  }
};

// Nastavení pro vzorové sekvence
export const PATTERN_SEQUENCE_SETTINGS: GameSettings = {
  ...BACKGROUND_SETTINGS,
  difficulty: {
    name: 'Obtížnost',
    type: 'select',
    defaultValue: 'easy',
    options: [
      { value: 'easy', label: 'Lehká (1 řádek, jednoduché vzory)' },
      { value: 'medium', label: 'Střední (2 řádky, vztahy mezi řádky)' },
      { value: 'hard', label: 'Těžká (2 řádky, složité vzory)' }
    ],
    description: 'Úroveň složitosti vzorů'
  },
  patternTypes: {
    name: 'Typy vzorů',
    type: 'multiselect',
    defaultValue: ['AB', 'AAB', 'ABC'],
    options: [
      { value: 'AB', label: 'AB (střídavý vzor)' },
      { value: 'AAB', label: 'AAB (dvojitý první)' },
      { value: 'AAAB', label: 'AAAB (trojitý první)' },
      { value: 'AABB', label: 'AABB (dvojice)' },
      { value: 'ABC', label: 'ABC (trojitý vzor)' },
      { value: 'ABCD', label: 'ABCD (čtyřitý vzor)' }
    ],
    description: 'Jaké vzory se budou objevovat'
  },
  customPatterns: {
    name: 'Vlastní vzory',
    type: 'string',
    defaultValue: '',
    description: 'Vlastní vzory oddělené čárkou (např. AB, ABC, AAAB)'
  },
  shapes: {
    name: 'Geometrické tvary',
    type: 'multiselect',
    defaultValue: ['circle', 'square', 'triangle'],
    options: [
      { value: 'circle', label: '● Kruh' },
      { value: 'square', label: '■ Čtverec' },
      { value: 'triangle', label: '▲ Trojúhelník' }
    ],
    description: 'Které tvary se budou používat'
  },
  colorGroups: {
    name: 'Barevné skupiny',
    type: 'multiselect',
    defaultValue: ['reds', 'blues', 'greens'],
    options: [
      { value: 'reds', label: '🔴 Červené odstíny' },
      { value: 'yellows', label: '🟡 Žluté odstíny' },
      { value: 'greens', label: '🟢 Zelené odstíny' },
      { value: 'blues', label: '🔵 Modré odstíny' },
      { value: 'purples', label: '🟣 Fialové odstíny' }
    ],
    description: 'Které barevné skupiny použít'
  },
  patternLength: {
    name: 'Délka vzoru',
    type: 'range',
    defaultValue: [12, 16],
    min: 8,
    max: 20,
    description: 'Počet prvků ve vzoru'
  },
  missingElements: {
    name: 'Chybějící prvky',
    type: 'range',
    defaultValue: [4, 8], 
    min: 2,
    max: 10,
    description: 'Kolik prvků bude chybět'
  }
};

// Nastavení pro robotickou hru
export const ROBOT_NAVIGATION_SETTINGS: GameSettings = {
  ...BACKGROUND_SETTINGS,
  difficulty: {
    name: 'Úroveň obtížnosti',
    type: 'select',
    defaultValue: 1,
    options: [
      { value: 1, label: '1★ - Začátečník (5x5, méně bodů)' },
      { value: 2, label: '2★★ - Pokročilý (6x6, více bodů)' },
      { value: 3, label: '3★★★ - Expert (7x7, hodně bodů)' }
    ],
    description: 'Přednastavené úrovně obtížnosti'
  },
  gridSize: {
    name: 'Velikost mřížky',
    type: 'number',
    defaultValue: 5,
    min: 4,
    max: 8,
    description: 'Velikost herní mřížky (průsečíky)'
  },
  collectiblePoints: {
    name: 'Počet sběrných bodů',
    type: 'number',
    defaultValue: 3,
    min: 1,
    max: 8,
    description: 'Počet bodů, které musí robot sebrat k dosažení cíle'
  },
  minDistance: {
    name: 'Minimální vzdálenost',
    type: 'number',
    defaultValue: 3,
    min: 2,
    max: 6,
    description: 'Minimální vzdálenost mezi robotem a cílem'
  }
};

// Nastavení pro matematickou křížovku
export const MATH_CROSSWORD_SETTINGS: GameSettings = {
  ...BACKGROUND_SETTINGS,
  level: {
    name: 'Úroveň obtížnosti',
    type: 'select',
    defaultValue: 1,
    options: [
      { value: 1, label: '1★ - Začátečník (3×3, čísla 1-9, 3 páry)' },
      { value: 2, label: '2★★ - Pokročilý (4×4, čísla 0-8, 4 páry)' },
      { value: 3, label: '3★★★ - Expert (5×5, čísla 0-15, 5 párů)' }
    ],
    description: 'Přednastavené úrovně obtížnosti ovlivňující velikost mřížky a složitost'
  },
  operationType: {
    name: 'Typ operace',
    type: 'select',
    defaultValue: 'addition',
    options: [
      { value: 'addition', label: 'Sčítání - najdi dvojice s daným součtem' },
      { value: 'subtraction', label: 'Odčítání - najdi dvojice se součtem' }
    ],
    description: 'Zvolte typ matematické operace pro párování čísel'
  },
  gridRows: {
    name: 'Počet řádků mřížky',
    type: 'number',
    defaultValue: 3,
    min: 3,
    max: 6,
    description: 'Výška herní mřížky (automaticky se nastaví podle úrovně obtížnosti)'
  },
  gridCols: {
    name: 'Počet sloupců mřížky',
    type: 'number',
    defaultValue: 3,
    min: 3,
    max: 6,
    description: 'Šířka herní mřížky (automaticky se nastaví podle úrovně obtížnosti)'
  },
  valueMin: {
    name: 'Minimální hodnota čísel',
    type: 'number',
    defaultValue: 1,
    min: 0,
    max: 20,
    description: 'Nejmenší číslo, které se může objevit v mřížce'
  },
  valueMax: {
    name: 'Maximální hodnota čísel',
    type: 'number',
    defaultValue: 9,
    min: 5,
    max: 50,
    description: 'Největší číslo, které se může objevit v mřížce'
  },
  differenceMin: {
    name: 'Minimální rozdíl/součet',
    type: 'number',
    defaultValue: 1,
    min: 1,
    max: 10,
    description: 'Nejmenší možný rozdíl nebo součet pro párování'
  },
  differenceMax: {
    name: 'Maximální rozdíl/součet',
    type: 'number',
    defaultValue: 4,
    min: 3,
    max: 20,
    description: 'Největší možný rozdíl nebo součet pro párování'
  },
  desiredPairs: {
    name: 'Počet hledaných párů',
    type: 'number',
    defaultValue: 3,
    min: 2,
    max: 8,
    description: 'Kolik párů musí hráč najít pro dokončení úrovně'
  }
};

// Nastavení pro hru Rozřaď čísla (porovnávání čísel)
export const NUMBER_COMPARISON_SETTINGS: GameSettings = {
  ...BACKGROUND_SETTINGS,
  numberRange: {
    name: 'Rozsah čísel',
    type: 'range',
    defaultValue: [1, 9],
    min: 1,
    max: 20,
    description: 'Nejmenší a největší číslo, které se může objevit na kartičkách'
  },
  representationTypes: {
    name: 'Typy zobrazení čísel',
    type: 'multiselect',
    defaultValue: ['objects', 'dice', 'number', 'math'],
    options: [
      { value: 'objects', label: '🍎 Počítání objektů (emoji)' },
      { value: 'dice', label: '🎲 Kostky' },
      { value: 'number', label: '🔢 Čísla' },
      { value: 'math', label: '➕ Příklady (sčítání)' }
    ],
    description: 'Způsoby zobrazení čísel na kartičkách'
  }
};

// Nastavení pro hru Čeho je víc (porovnávání množství objektů)
export const QUANTITY_COMPARISON_SETTINGS: GameSettings = {
  ...BACKGROUND_SETTINGS,
  gameMode: {
    name: 'Herní mód',
    type: 'select',
    defaultValue: 'compare',
    options: [
      { value: 'compare', label: 'Porovnávání - vyber kontejner s více objekty' },
      { value: 'clickMore', label: 'Naklikej více - naklikej více objektů než je vlevo' },
      { value: 'clickLess', label: 'Naklikej méně - naklikej méně objektů než je vlevo' }
    ],
    description: 'Vyberte herní mód pro celou hru'
  },
  objectRange: {
    name: 'Rozsah počtu objektů',
    type: 'range',
    defaultValue: [3, 10],
    min: 1,
    max: 15,
    description: 'Nejmenší a největší počet objektů v kontejnerech'
  },
  totalRounds: {
    name: 'Počet kol',
    type: 'number',
    defaultValue: 10,
    min: 5,
    max: 20,
    description: 'Celkový počet kol v jedné hře'
  },
  timeBasedGame: {
    name: 'Hra na čas',
    type: 'boolean',
    defaultValue: true,
    description: 'Zapnout časové omezení a úvodní odpočítávání (3-2-1). Při vypnutí hra poběží bez časomíry.'
  },
  timeLimit: {
    name: 'Časový limit na kolo (sekundy)',
    type: 'number',
    defaultValue: 15,
    min: 10,
    max: 30,
    description: '��as na odpověď v každém kole'
  },
  maxLives: {
    name: 'Počet životů',
    type: 'number',
    defaultValue: 3,
    min: 1,
    max: 5,
    description: 'Počet chyb před koncem hry'
  },
  maxDifference: {
    name: 'Maximální rozdíl',
    type: 'number',
    defaultValue: 3,
    min: 1,
    max: 5,
    description: 'Maximální rozdíl mezi počty objektů v kontejnerech'
  },
  enableAudio: {
    name: 'Zvukové efekty',
    type: 'boolean',
    defaultValue: true,
    description: 'Povolit zvukové efekty při správných/špatných odpovědích'
  },
  showDetailedStats: {
    name: 'Detailní statistiky',
    type: 'boolean',
    defaultValue: true,
    description: 'Zobrazit podrobné statistiky na konci hry'
  },
  autoStartRounds: {
    name: 'Automatické kola',
    type: 'boolean',
    defaultValue: true,
    description: 'Automaticky spustit další kolo po odpovědi'
  },
  containerWidth: {
    name: 'Šířka kontejnerů (desktop)',
    type: 'number',
    defaultValue: 480,
    min: 300,
    max: 600,
    description: 'Šířka kontejnerů na desktopu v pixelech'
  },
  containerHeight: {
    name: 'Výška kontejnerů (desktop)',
    type: 'number',
    defaultValue: 460,
    min: 300,
    max: 600,
    description: 'Výška kontejnerů na desktopu v pixelech'
  }
};

// Nastavení pro hru zrcadlového kreslení
export const MIRROR_DRAWING_SETTINGS: GameSettings = {
  ...BACKGROUND_SETTINGS,
  difficulty: {
    name: 'Obtížnost',
    type: 'select',
    defaultValue: 'easy',
    options: [
      { value: 'easy', label: 'Snadná (6x3 mřížka, 5 kostiček)' },
      { value: 'medium', label: 'Střední (10x5 mřížka, 2-4 objekty)' },
      { value: 'hard', label: 'Těžká (14x16 mřížka, 4-6 objektů)' }
    ],
    description: 'Úroveň obtížnosti ovlivňující velikost mřížky a složitost tvarů'
  },
  gridSizes: {
    name: 'Velikosti mřížky',
    type: 'multiselect',
    defaultValue: [6],
    options: [
      { value: 6, label: '6×3 (pro úroveň 1)' },
      { value: 10, label: '10×5 (pro úroveň 2)' },
      { value: 12, label: '12×12' },
      { value: 14, label: '14×14' },
      { value: 16, label: '16×16' }
    ],
    description: 'Povolené velikosti herní mřížky'
  },
  objectCount: {
    name: 'Počet objektů',
    type: 'range',
    defaultValue: [5, 5],
    min: 1,
    max: 8,
    description: 'Rozsah počtu objektů na levé straně mřížky'
  },
  enableEraser: {
    name: 'Povolit gumu',
    type: 'boolean',
    defaultValue: true,
    description: 'Zda má být v paletě dostupná guma pro mazání'
  },
  autoProgression: {
    name: 'Automatická progrese',
    type: 'boolean',
    defaultValue: true,
    description: 'Automaticky načíst další level po úspěšném dokončení'
  },
  progressionDelay: {
    name: 'Zpoždění progrese (sekundy)',
    type: 'number',
    defaultValue: 2,
    min: 1,
    max: 5,
    description: 'Čas před automatickým načtením dalšího levelu'
  },
  showFeedback: {
    name: 'Zobrazit zpětnou vazbu',
    type: 'boolean',
    defaultValue: true,
    description: 'Zobrazit ikony správné/špatné odpovědi při vyhodnocení'
  },
  enableDragToDraw: {
    name: 'Kreslení tažením',
    type: 'boolean',
    defaultValue: true,
    description: 'Povolit kreslení tažením myši nebo prstu'
  }
};

// Nastavení pro dlaždičkovou hru
export const TILING_GAME_SETTINGS: GameSettings = {
  ...BACKGROUND_SETTINGS,
  startingLevel: {
    name: 'Počáteční úroveň',
    type: 'select',
    defaultValue: 1,
    options: [
      { value: 1, label: '1★ - Začátečník (malé dvorky, jednoduché tvary)' },
      { value: 2, label: '2★★ - Pokročilý (střední dvorky, více tvarů)' },
      { value: 3, label: '3★★★ - Expert (velké dvorky, složité tvary)' }
    ],
    description: 'Úroveň obtížnosti při spuštění hry'
  },
  autoGeneration: {
    name: 'Automatické generování',
    type: 'boolean',
    defaultValue: true,
    description: 'Automaticky generovat náhodné dvorky při načtení'
  },
  enableDragDrop: {
    name: 'Povolit drag&drop',
    type: 'boolean',
    defaultValue: true,
    description: 'Povolit přetahování dlaždic myší nebo prstem'
  },
  showCoverage: {
    name: 'Zobrazit pokrytí',
    type: 'boolean',
    defaultValue: true,
    description: 'Zobrazit progress bar s procentuálním pokrytím dvorku'
  },
  enableRotation: {
    name: 'Povolit rotaci',
    type: 'boolean',
    defaultValue: true,
    description: 'Povolit otáčení dlaždic před umístěním'
  },
  countingPhase: {
    name: 'Fáze počítání',
    type: 'boolean',
    defaultValue: true,
    description: 'Povolit fázi počítání použitých dlaždic'
  }
};

// Nastavení pro domino hru
export const DOMINO_GAME_SETTINGS: GameSettings = {
  ...BACKGROUND_SETTINGS,
  numberRange: {
    name: 'Rozsah čísel',
    type: 'range',
    defaultValue: [0, 9],
    min: 0,
    max: 15,
    description: 'Rozsah čísel, která se budou objevovat na dominech'
  },
  gameModes: {
    name: 'Herní módy',
    type: 'multiselect',
    defaultValue: ['count', 'complete', 'complete-number', 'number-input'],
    options: [
      { value: 'count', label: 'Sčítání - klikání teček do pole CELKEM' },
      { value: 'complete', label: 'Doplňování - naklikání chybějících teček' },
      { value: 'complete-number', label: 'Doplňování s číslicí - doplnění podle rovnice' },
      { value: 'number-input', label: 'Číselný vstup - zadání výsledku pomocí šipek' }
    ],
    description: 'Které herní módy budou dostupné (můžete kombinovat více módů)'
  },
  autoModeSwitch: {
    name: 'Automatické přepínání módů',
    type: 'boolean',
    defaultValue: true,
    description: 'Automaticky střídá různé herní módy během hraní'
  },
  feedbackDuration: {
    name: 'Doba zobrazení zpětné vazby (ms)',
    type: 'number',
    defaultValue: 2000,
    min: 1000,
    max: 5000,
    description: 'Jak dlouho se zobrazují hlášky "Správně!" před novou hrou'
  },
  maxAttempts: {
    name: 'Maximální počet pokusů',
    type: 'number',
    defaultValue: 3,
    min: 1,
    max: 10,
    description: 'Počet pokusů na jeden příklad před zobrazením nové hry'
  },
  enableHints: {
    name: 'Povolit nápovědy',
    type: 'boolean',
    defaultValue: true,
    description: 'Zobrazit nápovědy při nesprávných odpovědích'
  }
};

// Nastavení pro MathTinder (Tinder-like matematická hra)
export const MATH_PRACTICE_SETTINGS: GameSettings = {
  backgroundColor: {
    name: 'Barva pozadí',
    type: 'select' as const,
    defaultValue: '#D0DBFF',
    options: [
      { value: '#9D94FF', label: 'Fialová' },
      { value: '#FFE8ED', label: 'Růžová' },
      { value: '#E8CDD6', label: 'Světle růžová' },
      { value: '#E7F9EE', label: 'Světle zelená' },
      { value: '#FAF3D4', label: 'Žlutá' },
      { value: '#F5E6D0', label: 'Béžová (výchozí)' },
      { value: '#FCEEEF', label: 'Světle růžová (koruny)' },
      { value: '#D0DBFF', label: 'Světle modrá (kartičky)' }
    ],
    description: 'Barva pozadí hry'
  },
  operationType: {
    name: 'Typ operace',
    type: 'select',
    defaultValue: 'addition_to_10',
    options: [
      { value: 'addition_to_10', label: '1) Sčítání do 10' },
      { value: 'addition_subtraction_to_10', label: '2) Sčítání a odčítání do 10' },
      { value: 'addition_over_10', label: '3) Sčítání s předchodem přes 10' },
      { value: 'addition_subtraction_over_10', label: '4) Sčítání a odčítání s předchodem přes 10' },
      { value: 'comparison_to_10', label: '5) Větší–menší do 10' },
      { value: 'comparison_over_10', label: '6) Větší menší přes 10' },
      { value: 'small_multiplication', label: '7) Malá násobilka' },
      { value: 'large_multiplication', label: '8) Velká násobilka' }
    ],
    description: 'Zvolte typ matematických operací pro hru'
  },

  totalCards: {
    name: 'Celkový počet kartiček',
    type: 'number',
    defaultValue: 15,
    min: 10,
    max: 25,
    description: 'Kolik kartiček bude v celé hře'
  },
  enableSwipeGestures: {
    name: 'Povolit swipe gesta',
    type: 'boolean',
    defaultValue: true,
    description: 'Povolit ovládání tažením kartičky vlevo/vpravo'
  },
  enableKeyboardControls: {
    name: 'Povolit klávesové zkratky',
    type: 'boolean',
    defaultValue: true,
    description: 'Povolit ovládání šipkami nebo klávesami N/A'
  },
  autoRestartDelay: {
    name: 'Auto-restart po výsledcích (sekundy)',
    type: 'number',
    defaultValue: 5,
    min: 0,
    max: 15,
    description: 'Automatické spuštění nové hry po zobrazení výsledků (0 = vypnuto)'
  }
};

// Nastavení pro hru s českými korunami
export const MONEY_EXCHANGE_SETTINGS: GameSettings = {
  ...BACKGROUND_SETTINGS,
  gameModes: {
    name: 'Herní módy',
    type: 'multiselect',
    defaultValue: ['shopping', 'exchange'],
    options: [
      { value: 'shopping', label: 'Nakupování - zaplať za předměty přesnou částkou' },
      { value: 'exchange', label: 'Rozměňování - rozměň velkou minci na menší' }
    ],
    description: 'Které herní módy budou povoleny (standardně 60% nakupování, 40% rozměňování)'
  },
  itemCategories: {
    name: 'Kategorie předmětů',
    type: 'multiselect',
    defaultValue: ['candy', 'fruit', 'food', 'toys'],
    options: [
      { value: 'candy', label: '🍬 Bonbony (2-6 Kč) - nejlevnější' },
      { value: 'fruit', label: '🍎 Ovoce (5-22 Kč) - střední ceny' },
      { value: 'food', label: '🥐 Pečivo & zelenina (18-35 Kč) - vyšší ceny' },
      { value: 'toys', label: '🚗 Hračky (28-55 Kč) - nejdražší' }
    ],
    description: 'Které kategorie předmětů se budou objevovat'
  },
  enableTwoItems: {
    name: 'Povolit dvojice předmětů',
    type: 'boolean',
    defaultValue: true,
    description: 'Povolit nákup dvou předmětů najednou (30% pravděpodobnost)'
  },
  coinTypes: {
    name: 'Povolené mince',
    type: 'multiselect',
    defaultValue: [1, 2, 5, 10, 20, 50],
    options: [
      { value: 1, label: '1 Kč - nejmenší' },
      { value: 2, label: '2 Kč - základní' },
      { value: 5, label: '5 Kč - střední' },
      { value: 10, label: '10 Kč - vyšší' },
      { value: 20, label: '20 Kč - vysoká' },
      { value: 50, label: '50 Kč - nejvyšší' }
    ],
    description: 'Které nominály českých mincí budou dostupné'
  },
  coinGenerationMultiplier: {
    name: 'Násobitel generování mincí',
    type: 'number',
    defaultValue: 2.0,
    min: 1.5,
    max: 3.0,
    step: 0.1,
    description: 'Kolikrát více mincí se vygeneruje než je potřeba (2.0 = dvojn��sobek)'
  },
  enableClickToMove: {
    name: 'Kliknutím přesunout mince',
    type: 'boolean',
    defaultValue: true,
    description: 'Povolit přesun mincí jednoduchým kliknutím (alternativa k drag & drop)'
  },
  showCoinValues: {
    name: 'Zobrazit hodnoty na mincích',
    type: 'boolean',
    defaultValue: true,
    description: 'Zobrazit číselné hodnoty na mincích (kromě obrázků)'
  },
  enableHints: {
    name: 'Povolit nápovědy',
    type: 'boolean',
    defaultValue: true,
    description: 'Zobrazit nápovědy při chybných odpovědích (rozdíl mezi zaplaceno/potřeba)'
  },
  autoNextRound: {
    name: 'Automatické další kolo',
    type: 'boolean',
    defaultValue: true,
    description: 'Automaticky spustit další kolo po správné odpovědi (po 2 sekundách)'
  }
};

// Nastavení pro hru odkrývání obrázku
export const IMAGE_REVEAL_SETTINGS: GameSettings = {
  operationType: {
    name: 'Typy matematických operací',
    type: 'multiselect',
    defaultValue: ['counting', 'addition', 'subtraction', 'comparison'],
    options: [
      { value: 'counting', label: 'Počítání objektů' },
      { value: 'addition', label: 'Sčítání' },
      { value: 'subtraction', label: 'Odčítání' },
      { value: 'comparison', label: 'Porovnávání čísel' }
    ],
    description: 'Které typy matematických operací se budou objevovat ve hře'
  },
  backgroundColor: {
    name: 'Barva pozadí',
    type: 'select' as const,
    defaultValue: '#FFB9A2',
    options: [
      { value: '#9D94FF', label: 'Fialová' },
      { value: '#FFE8ED', label: 'Růžová' },
      { value: '#E8CDD6', label: 'Světle růžová' },
      { value: '#E7F9EE', label: 'Světle zelená' },
      { value: '#FAF3D4', label: 'Žlutá' },
      { value: '#F5E6D0', label: 'Béžová (výchozí)' },
      { value: '#FCEEEF', label: 'Sv��tle růžová (koruny)' },
      { value: '#D0DBFF', label: 'Světle modrá (kartičky)' },
      { value: '#FFB9A2', label: 'Světle oranžová (odkryj obrázek)' }
    ],
    description: 'Barva pozadí hry'
  },
  gridSize: {
    name: 'Velikost mřížky',
    type: 'number',
    defaultValue: 4,
    min: 3,
    max: 6,
    description: 'Velikost herní mřížky (čtvercová)'
  },
  numberRange: {
    name: 'Rozsah čísel',
    type: 'range',
    defaultValue: [1, 10],
    min: 1,
    max: 20,
    description: 'Rozsah čísel pro matematické operace'
  },
  allowMistakes: {
    name: 'Povolený počet chyb',
    type: 'number',
    defaultValue: 3,
    min: 1,
    max: 5,
    description: 'Kolik chyb může hráč udělat před koncem hry'
  },
  showHints: {
    name: 'Zobrazit nápovědy',
    type: 'boolean',
    defaultValue: true,
    description: 'Zobrazit nápovědy při řešení otázek'
  }
};

// Nastavení pro hru Zjisti (počítání objektů)
export const COUNTING_GAME_SETTINGS: GameSettings = {
  backgroundColor: {
    name: 'Barva pozadí',
    type: 'select' as const,
    defaultValue: '#FFF8CD',
    options: [
      { value: '#FFF8CD', label: 'Světle žlutá (výchozí pro zjišťování)' },
      { value: '#9D94FF', label: 'Fialová' },
      { value: '#FFE8ED', label: 'Růžová' },
      { value: '#E8CDD6', label: 'Světle růžová' },
      { value: '#E7F9EE', label: 'Světle zelená' },
      { value: '#FAF3D4', label: 'Žlutá' },
      { value: '#F5E6D0', label: 'Béžová' },
      { value: '#FCEEEF', label: 'Světle růžová (koruny)' },
      { value: '#D0DBFF', label: 'Světle modrá (kartičky)' }
    ],
    description: 'Barva pozadí hry'
  },
  environments: {
    name: 'Typ objektů',
    type: 'multiselect',
    defaultValue: ['kuličky', 'fazole', 'knoflíky'],
    options: [
      { value: 'kuličky', label: '🔵 Kuličky v pytlíku' },
      { value: 'fazole', label: '🫘 Fazole v ruce' },
      { value: 'knoflíky', label: '🔘 Knoflíky v truhle' }
    ],
    description: 'Které typy objektů se budou objevovat'
  },
  gameModes: {
    name: 'Typ her',
    type: 'multiselect',
    defaultValue: ['lines', 'numbers'],
    options: [
      { value: 'lines', label: '📏 Čárky - počítání pomocí čárek' },
      { value: 'numbers', label: '🔢 Čísla - zobrazení čísel' }
    ],
    description: 'Které typy her se budou střídat během hraní'
  },
  numberRange: {
    name: 'Rozsah čísel',
    type: 'range',
    defaultValue: [0, 20],
    min: 0,
    max: 30,
    description: 'Nejmenší a největší číslo, které se může objevit'
  },
  autoIntroVideo: {
    name: 'Automatické intro video',
    type: 'boolean',
    defaultValue: true,
    description: 'Zobrazit úvodní video před začátkem hry'
  }
};

// Nastavení pro matematického hada
export const MATH_SNAKE_SETTINGS: GameSettings = {
  ...BACKGROUND_SETTINGS,
  difficulty: {
    name: 'Obtížnost',
    type: 'select',
    defaultValue: 1,
    options: [
      { value: 1, label: 'Úroveň 1 - Snadná (pouze sčítání)' },
      { value: 2, label: 'Úroveň 2 - Střední (pouze sčítání)' },
      { value: 3, label: 'Úroveň 3 - Těžká (sčítání + odčítání)' }
    ],
    description: 'Úroveň obtížnosti - ovlivňuje rozsah čísel a typy operací'
  },
  numberRange: {
    name: 'Rozsah čísel',
    type: 'range',
    defaultValue: [5, 20],
    min: 1,
    max: 30,
    description: 'Rozsah čísel pro rozklady (hledání výrazů, které se rovnají tomuto číslu)'
  }
};

// Nastavení pro hru Slož číslo
export const BUILD_NUMBER_SETTINGS: GameSettings = {
  ...BACKGROUND_SETTINGS,
  numberRange: {
    name: 'Rozsah cílových čísel',
    type: 'range',
    defaultValue: [2, 10],
    min: 2,
    max: 15,
    description: 'Rozsah čísel, která mají děti skládat z menších kostiček'
  },
  maxBlocks: {
    name: 'Počet kostiček',
    type: 'number',
    defaultValue: 2,
    min: 2,
    max: 5,
    description: 'Počet kostiček, které žák používá k poskládání čísla (v jedné řadě)'
  },
  feedbackDuration: {
    name: 'Doba zobrazení zpětné vazby (ms)',
    type: 'number',
    defaultValue: 2000,
    min: 1000,
    max: 5000,
    description: 'Jak dlouho se zobrazují hlášky "Správně!" před novou hrou'
  }
};

// Registr všech her
export const GAME_REGISTRY: Record<GameType, GameConfig> = {
  numberRecognition: {
    id: 'numberRecognition',
    name: 'Poznej čísla',
    description: 'Hra na poznávání čísel různými způsoby s pěti typy aktivit',
    icon: '🔢',
    component: 'NumberRecognitionGame',
    settings: NUMBER_RECOGNITION_SETTINGS
  },
  numberSequence: {
    id: 'numberSequence', 
    name: 'Číselné řady',
    description: 'Číselná řada je sestavena podle určitého pravidla. Najdi toto pravidlo a řadu doplň.',
    icon: '📊',
    component: 'NumberSequenceGame',
    settings: NUMBER_SEQUENCE_SETTINGS
  },
  patternSequence: {
    id: 'patternSequence',
    name: 'Doplň vzor',
    description: 'Rozpoznávání a doplňování geometrických vzorů',
    icon: '🔶',
    component: 'PatternSequenceGame', 
    settings: PATTERN_SEQUENCE_SETTINGS
  },
  mathCrossword: {
    id: 'mathCrossword',
    name: 'Matematická křížovka',
    description: 'Hledání párů sousedních čísel s daným rozdílem nebo součtem',
    icon: '🔢',
    component: 'MathCrosswordGame',
    settings: MATH_CROSSWORD_SETTINGS
  },
  robotNavigation: {
    id: 'robotNavigation',
    name: 'Navigace robota',
    description: 'Programování robota pomocí ��ipek k dosažení cíle na mřížce',
    icon: '🤖',
    component: 'RobotGame',
    settings: ROBOT_NAVIGATION_SETTINGS
  },
  numberComparison: {
    id: 'numberComparison',
    name: 'Rozřaď čísla',
    description: 'Porovnávání padajících objektů s referenčním číslem ve třech sloupcích',
    icon: '⚖️',
    component: 'NumberComparisonGame',
    settings: NUMBER_COMPARISON_SETTINGS
  },
  quantityComparison: {
    id: 'quantityComparison',
    name: 'Větší menší',
    description: 'Porovnávání množství objektů v kontejnerech - kdo má víc?',
    icon: '🔍',
    component: 'QuantityComparisonGame',
    settings: QUANTITY_COMPARISON_SETTINGS
  },
  mathPractice: {
    id: 'mathPractice',
    name: 'Kartičky',
    description: 'Procvičte si základní matematické operace pomocí kartiček ve stylu Tinder',
    icon: '📚',
    component: 'MathPractice',
    settings: MATH_PRACTICE_SETTINGS
  },
  mirrorDrawing: {
    id: 'mirrorDrawing',
    name: 'Zrcadlové kreslení',
    description: 'Dokresli zrcadlový obraz podle vzoru na druhé straně mřížky',
    icon: '🪞',
    component: 'MirrorDrawingGame',
    settings: MIRROR_DRAWING_SETTINGS
  },
  tilingGame: {
    id: 'tilingGame',
    name: 'Pokládání dlaždic',
    description: 'Vyplň dvorek geometrickými tvary a spočítej kolik jsi jich použil',
    icon: '���',
    component: 'TilingGame',
    settings: TILING_GAME_SETTINGS
  },
  dominoGame: {
    id: 'dominoGame',
    name: 'Domino hra',
    description: 'Počítej tečky na dominech a řeš matematické úlohy různými způsoby',
    icon: '🎲',
    component: 'DominoGame',
    settings: DOMINO_GAME_SETTINGS
  },
  moneyExchange: {
    id: 'moneyExchange',
    name: 'Zaplať a rozměň',
    description: 'Nakupuj předměty a rozměňuj české koruny - praktické počítání s penězi',
    icon: '💰',
    component: 'MoneyExchangeGame',
    settings: MONEY_EXCHANGE_SETTINGS
  },
  boardGame: {
    id: 'boardGame',
    name: 'Člověče nezlob se',
    description: 'Matematická desková hra - hácej kostkou, pohybuj se po cestě a sbírej balíčky!',
    icon: '🎲',
    component: 'BoardGame',
    settings: BOARD_GAME_SETTINGS
  },
  mrBall: {
    id: 'mrBall',
    name: 'Pan Kulička',
    description: 'Počítání políček. Žáci počítají kroky, mohou chodit v jednom kole tam i zpátky. Plánuj cestu, tref se na výtah a dojdi první k srdíčku!',
    icon: '⚽',
    component: 'MrBallGame',
    settings: MR_BALL_SETTINGS,
    previewImage: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/nahledy/pan_kulicka.png'
  },
  countingGame: {
    id: 'countingGame',
    name: 'Zjisti',
    description: 'Zjisti kolik objektů je v kontejneru - počítání s různými objekty a způsoby',
    icon: '🔍',
    component: 'CountingGame',
    settings: COUNTING_GAME_SETTINGS
  },
  mathSnake: {
    id: 'mathSnake',
    name: 'Had',
    description: 'Vybuduj matematického hada z výrazů - najdi správné rovnice a rozšiř hada',
    icon: '🐍',
    component: 'MathSnakeGame',
    settings: MATH_SNAKE_SETTINGS
  },
  imageReveal: {
    id: 'imageReveal',
    name: 'Odkryj obrázek',
    description: 'Třída společně odhaluje skrytý obrázek. Děti se mohou u tabule střídat.',
    icon: '🖼️',
    component: 'ImageRevealGame',
    settings: IMAGE_REVEAL_SETTINGS
  },
  buildNumber: {
    id: 'buildNumber',
    name: 'Slož číslo',
    description: 'Skládáme čísla z kostiček',
    icon: '🧱',
    component: 'BuildNumberGame',
    settings: BUILD_NUMBER_SETTINGS,
    previewImage: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/Group%2021337.png'
  }
};

export function getGameDefaultSettings(gameId: GameType): Record<string, unknown> {
  const game = GAME_REGISTRY[gameId];
  if (!game) return {};
  const defaults: Record<string, unknown> = {};
  for (const [key, setting] of Object.entries(game.settings)) {
    defaults[key] = setting.defaultValue;
  }
  return defaults;
}

/** Sdílený odkaz: jen odchylky od výchozího nastavení, bez dvojitého encode. */
export function generateGameURL(gameId: GameType, settings: Record<string, any>): string {
  const baseUrl = window.location.origin + window.location.pathname;
  const delta = compactGameSettings(settings, getGameDefaultSettings(gameId));
  return buildGameShareURL(baseUrl, gameId, delta);
}

/** Doplní načtenou konfiguraci (delta i starý plný JSON) o výchozí hodnoty. */
export function resolveSharedGameSettings(
  gameId: GameType,
  parsed: Record<string, unknown> | null,
): Record<string, unknown> | null {
  if (!parsed) return null;
  return mergeGameSettings(getGameDefaultSettings(gameId), parsed);
}