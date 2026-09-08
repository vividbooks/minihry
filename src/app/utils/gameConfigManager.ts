import { parseGameConfigParam } from './gameShareUrl';

// Utility pro aplikování custom nastavení na hry

export interface GameConfigManager {
  applySettings: (settings: Record<string, any>) => void;
  getDefaultSettings: () => Record<string, any>;
  validateSettings: (settings: Record<string, any>) => boolean;
}

// Aplikování nastavení pro NumberRecognitionGame
export const applyNumberRecognitionSettings = (settings: Record<string, any>) => {
  // Tyto konstanty by se v reálné implementaci načítaly z settings
  const config = {
    MIN_NUMBER: settings.minNumber ?? 1,
    MAX_NUMBER: settings.maxNumber ?? 9,
    TOTAL_ROUNDS: settings.totalRounds ?? 10,
    TIME_LIMIT: settings.timeLimit ?? 30,
    MAX_LIVES: settings.maxLives ?? 3,
    CHALLENGE_TYPES: settings.challengeTypes ?? ['written', 'dots', 'objects', 'sound', 'blink'],
    TASK_TYPES: settings.taskTypes ?? ['tap', 'select', 'dots', 'click']
  };
  
  return config;
};

// Aplikování nastavení pro NumberSequenceGame (pro budoucí implementaci)
export const applyNumberSequenceSettings = (settings: Record<string, any>) => {
  const config = {
    SEQUENCE_TYPES: settings.sequenceTypes ?? ['ascending', 'descending', 'even', 'odd'],
    SEQUENCE_LENGTH: settings.sequenceLength ?? [6, 10],
    MISSING_COUNT: settings.missingCount ?? [3, 6],
    NUMBER_RANGE: settings.numberRange ?? [0, 25]
  };
  
  return config;
};

// Aplikování nastavení pro PatternSequenceGame (pro budoucí implementaci)
export const applyPatternSequenceSettings = (settings: Record<string, any>) => {
  const config = {
    DIFFICULTY: settings.difficulty ?? 'easy',
    PATTERN_TYPES: settings.patternTypes ?? ['AB', 'AAB', 'ABC'],
    SHAPES: settings.shapes ?? ['circle', 'square', 'triangle'],
    COLOR_GROUPS: settings.colorGroups ?? ['reds', 'blues', 'greens', 'oranges'],
    PATTERN_LENGTH: settings.patternLength ?? [12, 16],
    MISSING_ELEMENTS: settings.missingElements ?? [4, 8]
  };
  
  return config;
};

// Aplikování nastavení pro MathCrosswordGame
export const applyMathCrosswordSettings = (settings: Record<string, any>) => {
  const config = {
    LEVEL: settings.level ?? 1,
    GRID_ROWS: settings.gridRows ?? 3,
    GRID_COLS: settings.gridCols ?? 3,
    VALUE_MIN: settings.valueMin ?? 1,
    VALUE_MAX: settings.valueMax ?? 9,
    DIFFERENCE_MIN: settings.differenceMin ?? 1,
    DIFFERENCE_MAX: settings.differenceMax ?? 4,
    DESIRED_PAIRS: settings.desiredPairs ?? 3
  };
  
  return config;
};

// Validace nastavení
export const validateGameSettings = (gameId: string, settings: Record<string, any>): string[] => {
  const errors: string[] = [];
  
  switch (gameId) {
    case 'numberRecognition':
      if (settings.minNumber >= settings.maxNumber) {
        errors.push('Minimální číslo musí být menší než maximální');
      }
      if (settings.totalRounds < 1 || settings.totalRounds > 50) {
        errors.push('Počet kol musí být mezi 1 a 50');
      }
      if (settings.timeLimit < 10 || settings.timeLimit > 120) {
        errors.push('Časový limit musí být mezi 10 a 120 sekundami');
      }
      if (!settings.challengeTypes || settings.challengeTypes.length === 0) {
        errors.push('Musí být vybrán alespoň jeden typ zadání');
      }
      if (!settings.taskTypes || settings.taskTypes.length === 0) {
        errors.push('Musí být vybrán alespoň jeden typ úkolu');
      }
      break;
      
    case 'numberSequence':
      if (!settings.sequenceTypes || settings.sequenceTypes.length === 0) {
        errors.push('Musí být vybrán alespoň jeden typ sekvence');
      }
      if (settings.sequenceLength && settings.sequenceLength[0] >= settings.sequenceLength[1]) {
        errors.push('Minimální délka sekvence musí být menší než maximální');
      }
      break;
      
    case 'patternSequence':
      if (!settings.shapes || settings.shapes.length === 0) {
        errors.push('Musí být vybrán alespoň jeden tvar');
      }
      if (!settings.colorGroups || settings.colorGroups.length === 0) {
        errors.push('Musí být vybrána alespoň jedna barevná skupina');
      }
      break;
      
    case 'mathCrossword':
      if (settings.gridRows < 3 || settings.gridRows > 6) {
        errors.push('Počet řádků musí být mezi 3 a 6');
      }
      if (settings.gridCols < 3 || settings.gridCols > 6) {
        errors.push('Počet sloupců musí být mezi 3 a 6');
      }
      if (settings.valueMin >= settings.valueMax) {
        errors.push('Minimální hodnota musí být menší než maximální');
      }
      if (settings.differenceMin >= settings.differenceMax) {
        errors.push('Minimální rozdíl musí být menší než maximální');
      }
      if (settings.desiredPairs < 2) {
        errors.push('Musí být požadovány alespoň 2 páry');
      }
      if (settings.desiredPairs > (settings.gridRows * settings.gridCols) / 2) {
        errors.push('Příliš mnoho párů pro velikost mřížky');
      }
      break;
  }
  
  return errors;
};

// Export všech funkcí
export const gameConfigManager = {
  numberRecognition: {
    applySettings: applyNumberRecognitionSettings,
    validateSettings: (settings: Record<string, any>) => validateGameSettings('numberRecognition', settings)
  },
  numberSequence: {
    applySettings: applyNumberSequenceSettings,
    validateSettings: (settings: Record<string, any>) => validateGameSettings('numberSequence', settings)
  },
  patternSequence: {
    applySettings: applyPatternSequenceSettings,
    validateSettings: (settings: Record<string, any>) => validateGameSettings('patternSequence', settings)
  },
  mathCrossword: {
    applySettings: applyMathCrosswordSettings,
    validateSettings: (settings: Record<string, any>) => validateGameSettings('mathCrossword', settings)
  }
};

// Pomocné funkce pro URL management — nové odkazy skládá generateGameURL.
export const loadGameFromUrl = (): { gameId: string | null; settings: Record<string, any> | null } => {
  const params = new URLSearchParams(window.location.search);
  const gameId = params.get('game');
  const settings = parseGameConfigParam(params.get('config'));

  if (!gameId) {
    return { gameId: null, settings: null };
  }

  return { gameId, settings };
};