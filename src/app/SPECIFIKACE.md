# 🎮 SPECIFIKACE PRO VYTVÁŘENÍ NOVÝCH MATEMATICKÝCH HER

## 📋 **Základní informace o projektu**

Vytváříš novou hru pro vzdělávací matematickou platformu s **modulární plugin architekturou**:
- **Administrace = Polička** (jen odkazuje na hry a poskytuje služby)
- **Hra = Šuplíček** (samostatný modul s vlastní logikou)  
- **Konektor = Rozhraní** (propojuje hru s administrací)

**Platforma vlastnosti:**
- Česká vzdělávací matematická platforma pro děti
- Font: VisbyRound (automaticky načten)
- Framework: React 18 + TypeScript + Tailwind V4
- Barevné schéma: šedo-modré s béžovým pozadím
- Responzivní design (mobil + desktop)

---

## 🏗️ **Architektura systému**

### **Stávající vs. Nové hry:**
```typescript
// STÁVAJÍCÍ HRY (neměň!)
/components/NumberRecognitionGame.tsx    // Legacy import
/components/MathCrosswordGame.tsx        // Legacy import
// ... další stávající hry

// NOVÉ HRY (modulární)
/connectors/                            // Rozhraní systému
/games/[game-name]/                     // Samostatné moduly
```

### **Administrace poskytuje:**
- ✅ **Font VisbyRound** (automaticky)
- ✅ **Audio systém** (úspěch/chyba zvuky)  
- ✅ **Feedback hlášky** ("SPRÁVNĚ!"/"ŠPATNĚ!")
- ✅ **Základní CSS/Tailwind** (barvy, animace)
- ✅ **Error handling** a loading states

### **Hra obsahuje:**
- ✅ **Vlastní herní logiku**
- ✅ **Vlastní nastavení** (definované v hře)
- ✅ **Konektor implementaci**
- ✅ **Responzivní UI komponenty**

---

## 📁 **Povinná struktura souborů**

### **Pro každou novou hru vytvoř:**

```
/connectors/
├── interface.ts         # Hlavní interface definice
├── services.ts          # Služby z administrace
├── registry.ts          # Registry nových her
└── types.ts            # Společné typy

/games/[game-name]/
├── component.tsx       # Hlavní herní komponenta ⭐
├── settings.ts         # Nastavení a konfigurace hry ⭐  
├── connector.ts        # Implementace konektoru ⭐
├── types.ts           # Typy specifické pro hru
├── utils.ts           # Pomocné funkce (volitelné)
└── README.md          # Dokumentace hry (volitelné)
```

---

## 🔌 **Interface definice**

### **1. Hlavní GameConnector Interface:**

```typescript
// /connectors/interface.ts
import { ReactNode } from 'react';

export interface GameConnector {
  // Metadata pro administraci
  gameInfo: {
    id: string;                    // Unikátní ID hry
    name: string;                  // Český název hry
    description: string;           // Krátký popis pro dlaždičku
    icon: string;                  // Emoji ikona
    thumbnail?: string;            // URL obrázku náhledu
    backgroundColor: string;       // Barva pozadí dlaždičky (hex)
    category: 'numbers' | 'patterns' | 'spatial' | 'calculation';
  };
  
  // Nastavení hry (definované v games/[name]/settings.ts)
  settings: GameSettings;
  
  // React komponenta hry
  GameComponent: React.ComponentType<GameProps>;
  
  // Lifecycle callbacks - administrace je zavolá
  onCorrectAnswer: () => void;
  onWrongAnswer: () => void; 
  onGameComplete: () => void;
  onGameStart?: () => void;
}

export interface GameProps {
  settings?: Record<string, any>;  // Nastavení z konfiguratoru
  services: AdministrationServices;  // Služby z administrace
}

export interface GameSettings {
  // Společné nastavení pro všechny hry
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  questionCount?: number;
  
  // Specifické nastavení - definuj v konkrétní hře
  [key: string]: any;
}
```

### **2. Služby z administrace:**

```typescript
// /connectors/services.ts
export interface AdministrationServices {
  // 🔊 Audio systém
  audio: {
    playSuccessSound: () => void;
    playErrorSound: () => void;
    playClickSound: () => void;
    playBackgroundMusic: (volume?: number) => void;
    stopBackgroundMusic: () => void;
  };
  
  // 💬 Feedback a hlášky
  feedback: {
    showCorrect: (message?: string) => void;      // "SPRÁVNĚ!" animace
    showWrong: (message?: string) => void;        // "ŠPATNĚ!" animace  
    showSuccess: (message?: string) => void;      // Úspěšné dokončení
    showHint: (message: string) => void;          // Nápověda
    hideAll: () => void;                          // Skryj všechny hlášky
  };
  
  // 🎨 Styling a téma
  theme: {
    colors: {
      primary: string;      // #4a43e8
      success: string;      // #22c55e  
      error: string;        // #ef4444
      background: string;   // #F5E6D0
      orange: string;       // #FFD3C5 (pro Zaplať a Rozměň)
      yellow: string;       // #FFF8CD (pro Zjisti)
      blue: string;         // #D0DBFF (pro Kartičky)
    };
    font: {
      family: string;       // 'VisbyRound'
      sizes: {
        sm: string;         // text-sm
        base: string;       // text-base
        lg: string;         // text-lg
        xl: string;         // text-xl
        '2xl': string;      // text-2xl
        '3xl': string;      // text-3xl
      };
    };
  };
  
  // 🕒 Utility funkce
  utils: {
    generateId: () => string;                     // Unikátní ID
    shuffleArray: <T>(array: T[]) => T[];        // Zamíchání pole
    getRandomNumber: (min: number, max: number) => number;
    formatTime: (seconds: number) => string;     // MM:SS formát
  };
}
```

---

## ⚙️ **Implementace hry krok za krokem**

### **KROK 1: Vytvoř konektory (pouze jednou pro celý systém)**

#### **A) Hlavní interface** `/connectors/interface.ts`:
```typescript
import React, { createContext, useContext } from 'react';
import { AdministrationServices } from './services';

// Hlavní interface (viz výše)
export interface GameConnector { /* ... */ }
export interface GameProps { /* ... */ }
export interface GameSettings { /* ... */ }

// Context pro služby
const ServicesContext = createContext<AdministrationServices | null>(null);

export const ServicesProvider: React.FC<{
  services: AdministrationServices;
  children: React.ReactNode;
}> = ({ services, children }) => (
  <ServicesContext.Provider value={services}>
    {children}
  </ServicesContext.Provider>
);

// Hook pro použití služeb v hře
export const useGameServices = (): AdministrationServices => {
  const services = useContext(ServicesContext);
  if (!services) {
    throw new Error('useGameServices must be used within ServicesProvider');
  }
  return services;
};
```

#### **B) Implementace služeb** `/connectors/services.ts`:
```typescript
import { toast } from 'sonner@2.0.3';

export const createAdministrationServices = (): AdministrationServices => ({
  audio: {
    playSuccessSound: () => {
      const audio = new Audio('/sounds/success.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    },
    playErrorSound: () => {
      const audio = new Audio('/sounds/error.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    },
    playClickSound: () => {
      const audio = new Audio('/sounds/click.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    },
    playBackgroundMusic: (volume = 0.2) => {
      // Implementace background music
    },
    stopBackgroundMusic: () => {
      // Implementace stop music
    }
  },
  
  feedback: {
    showCorrect: (message = 'SPRÁVNĚ!') => {
      toast.success(message, {
        duration: 2000,
        className: 'bg-green-100 text-green-800 border-green-300 text-xl font-bold'
      });
    },
    showWrong: (message = 'ŠPATNĚ!') => {
      toast.error(message, {
        duration: 2000, 
        className: 'bg-red-100 text-red-800 border-red-300 text-xl font-bold'
      });
    },
    showSuccess: (message = 'Výborně!') => {
      toast.success(message, {
        duration: 3000,
        className: 'bg-blue-100 text-blue-800 border-blue-300 text-2xl font-bold'
      });
    },
    showHint: (message: string) => {
      toast.info(message, {
        duration: 4000,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-300'
      });
    },
    hideAll: () => {
      toast.dismiss();
    }
  },
  
  theme: {
    colors: {
      primary: '#4a43e8',
      success: '#22c55e',
      error: '#ef4444', 
      background: '#F5E6D0',
      orange: '#FFD3C5',
      yellow: '#FFF8CD',
      blue: '#D0DBFF'
    },
    font: {
      family: 'VisbyRound',
      sizes: {
        sm: '0.875rem',
        base: '1rem', 
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem'
      }
    }
  },
  
  utils: {
    generateId: () => Math.random().toString(36).substr(2, 9),
    shuffleArray: <T>(array: T[]): T[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    },
    getRandomNumber: (min: number, max: number) => 
      Math.floor(Math.random() * (max - min + 1)) + min,
    formatTime: (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }
});
```

#### **C) Registry nových her** `/connectors/registry.ts`:
```typescript
import { GameConnector } from './interface';

// Registry pro nové modulární hry
export const NEW_GAMES_REGISTRY: Record<string, GameConnector> = {};

// Funkce pro registraci nové hry
export const registerGame = (connector: GameConnector) => {
  NEW_GAMES_REGISTRY[connector.gameInfo.id] = connector;
};

// Funkce pro získání seznamu nových her
export const getNewGames = (): GameConnector[] => {
  return Object.values(NEW_GAMES_REGISTRY);
};

// Funkce pro získání konkrétní hry
export const getNewGame = (id: string): GameConnector | undefined => {
  return NEW_GAMES_REGISTRY[id];
};
```

### **KROK 2: Vytvoř konkrétní hru**

#### **A) Nastavení hry** `/games/[game-name]/settings.ts`:
```typescript
import { GameSettings } from '../../connectors/interface';

// Specifická nastavení pro tvoji hru
export interface MyGameSettings extends GameSettings {
  // Základní nastavení (povinné)
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  timeLimit?: number;
  
  // Specifická nastavení pro tvoji hru
  operationType: 'addition' | 'subtraction' | 'multiplication' | 'division';
  numberRange: [number, number];  // [min, max]
  showHints: boolean;
  enableTimer: boolean;
  
  // Pro UI konfigurátor - definice jak se nastavení zobrazí
  _configUI: {
    operationType: {
      type: 'select';
      label: 'Typ operace';
      options: [
        { value: 'addition', label: 'Sčítání' },
        { value: 'subtraction', label: 'Odčítání' },
        { value: 'multiplication', label: 'Násobení' },
        { value: 'division', label: 'Dělení' }
      ];
    };
    numberRange: {
      type: 'range';
      label: 'Rozsah čísel';
      min: 1;
      max: 100;
    };
    showHints: {
      type: 'boolean';
      label: 'Zobrazovat nápovědy';
    };
    enableTimer: {
      type: 'boolean';
      label: 'Povolit časovač';
    };
  };
}

// Výchozí nastavení
export const defaultSettings: MyGameSettings = {
  difficulty: 'medium',
  questionCount: 10,
  timeLimit: 300, // 5 minut
  operationType: 'addition',
  numberRange: [1, 20],
  showHints: true,
  enableTimer: false,
  _configUI: { /* ... definice výše */ }
};
```

#### **B) Herní komponenta** `/games/[game-name]/component.tsx`:
```typescript
import React, { useState, useEffect } from 'react';
import { GameProps } from '../../connectors/interface';
import { MyGameSettings } from './settings';
import { useGameServices } from '../../connectors/interface';

interface Question {
  id: string;
  question: string;
  correctAnswer: number;
  options: number[];
}

export const MyGameComponent: React.FC<GameProps> = ({ settings }) => {
  const services = useGameServices();
  const gameSettings = settings as MyGameSettings;
  
  // State hry
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(gameSettings.timeLimit || 300);
  const [isGameFinished, setIsGameFinished] = useState(false);

  // Generování otázky
  const generateQuestion = (): Question => {
    const [min, max] = gameSettings.numberRange;
    const a = services.utils.getRandomNumber(min, max);
    const b = services.utils.getRandomNumber(min, max);
    
    let question: string;
    let correctAnswer: number;
    
    switch (gameSettings.operationType) {
      case 'addition':
        question = `${a} + ${b} = ?`;
        correctAnswer = a + b;
        break;
      case 'subtraction':
        question = `${Math.max(a,b)} - ${Math.min(a,b)} = ?`;
        correctAnswer = Math.max(a,b) - Math.min(a,b);
        break;
      case 'multiplication':
        question = `${a} × ${b} = ?`;
        correctAnswer = a * b;
        break;
      case 'division':
        const product = a * b;
        question = `${product} ÷ ${a} = ?`;
        correctAnswer = b;
        break;
      default:
        question = `${a} + ${b} = ?`;
        correctAnswer = a + b;
    }
    
    // Generuj špatné odpovědi
    const wrongAnswers = [];
    while (wrongAnswers.length < 3) {
      const wrong = correctAnswer + services.utils.getRandomNumber(-10, 10);
      if (wrong !== correctAnswer && wrong > 0 && !wrongAnswers.includes(wrong)) {
        wrongAnswers.push(wrong);
      }
    }
    
    const options = services.utils.shuffleArray([correctAnswer, ...wrongAnswers]);
    
    return {
      id: services.utils.generateId(),
      question,
      correctAnswer,
      options
    };
  };

  // Inicializace hry
  useEffect(() => {
    setCurrentQuestion(generateQuestion());
  }, []);

  // Timer
  useEffect(() => {
    if (!gameSettings.enableTimer || isGameFinished) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsGameFinished(true);
          services.feedback.showSuccess(`Čas vypršel! Skóre: ${score}/${gameSettings.questionCount}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isGameFinished, gameSettings.enableTimer]);

  // Zpracování odpovědi
  const handleAnswer = (selectedAnswer: number) => {
    if (!currentQuestion || isGameFinished) return;
    
    services.audio.playClickSound();
    
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      services.audio.playSuccessSound();
      services.feedback.showCorrect();
      setScore(prev => prev + 1);
    } else {
      services.audio.playErrorSound();
      services.feedback.showWrong(`Správná odpověď: ${currentQuestion.correctAnswer}`);
    }
    
    // Další otázka nebo konec hry
    setTimeout(() => {
      if (questionIndex + 1 >= gameSettings.questionCount) {
        setIsGameFinished(true);
        services.feedback.showSuccess(`Hra dokončena! Skóre: ${score + (isCorrect ? 1 : 0)}/${gameSettings.questionCount}`);
      } else {
        setQuestionIndex(prev => prev + 1);
        setCurrentQuestion(generateQuestion());
      }
    }, 1500);
  };

  // Nápověda
  const showHint = () => {
    if (!currentQuestion || !gameSettings.showHints) return;
    
    const hint = `Výsledek je mezi ${Math.floor(currentQuestion.correctAnswer / 10) * 10} a ${Math.ceil(currentQuestion.correctAnswer / 10) * 10}`;
    services.feedback.showHint(hint);
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Načítám hru...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-4 flex flex-col"
      style={{ backgroundColor: services.theme.colors.background }}
    >
      {/* Header s progressem */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-lg font-bold">
          Otázka {questionIndex + 1} z {gameSettings.questionCount}
        </div>
        {gameSettings.enableTimer && (
          <div className="text-lg font-bold text-blue-600">
            ⏰ {services.utils.formatTime(timeLeft)}
          </div>
        )}
        <div className="text-lg font-bold text-green-600">
          Skóre: {score}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-8">
        <div 
          className="bg-blue-500 h-3 rounded-full transition-all duration-300"
          style={{ width: `${((questionIndex) / gameSettings.questionCount) * 100}%` }}
        />
      </div>

      {/* Otázka */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-4xl md:text-6xl font-bold mb-12 text-center">
          {currentQuestion.question}
        </div>

        {/* Možnosti odpovědí */}
        <div className="grid grid-cols-2 gap-4 max-w-md w-full">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              className="bg-white hover:bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-2xl font-bold transition-all duration-200 hover:scale-105 hover:border-blue-400"
              disabled={isGameFinished}
            >
              {option}
            </button>
          ))}
        </div>

        {/* Nápověda */}
        {gameSettings.showHints && !isGameFinished && (
          <button
            onClick={showHint}
            className="mt-8 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-6 py-3 rounded-lg font-medium"
          >
            💡 Nápověda
          </button>
        )}
      </div>

      {/* Výsledek hry */}
      {isGameFinished && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 text-center max-w-md">
            <div className="text-3xl font-bold mb-4">🎉 Hra dokončena!</div>
            <div className="text-xl mb-4">
              Tvoje skóre: <span className="font-bold text-green-600">{score}</span> z {gameSettings.questionCount}
            </div>
            <div className="text-lg text-gray-600">
              Úspěšnost: {Math.round((score / gameSettings.questionCount) * 100)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

#### **C) Konektor** `/games/[game-name]/connector.ts`:
```typescript
import { GameConnector } from '../../connectors/interface';
import { MyGameComponent } from './component';
import { defaultSettings } from './settings';

export const myGameConnector: GameConnector = {
  gameInfo: {
    id: 'myAwesomeGame',
    name: 'Má skvělá hra',
    description: 'Procvičování základních matematických operací s výběrem odpovědi',
    icon: '🧮',
    thumbnail: 'https://example.com/my-game-thumbnail.png', // volitelné
    backgroundColor: '#E6F3FF', // světle modrá
    category: 'calculation'
  },
  
  settings: defaultSettings,
  GameComponent: MyGameComponent,
  
  // Lifecycle callbacks - implementuje administrace
  onCorrectAnswer: () => {
    console.log('Správná odpověď!');
  },
  onWrongAnswer: () => {
    console.log('Špatná odpověď!');
  },
  onGameComplete: () => {
    console.log('Hra dokončena!');
  },
  onGameStart: () => {
    console.log('Hra spuštěna!');
  }
};
```

#### **D) Registrace hry** `/games/[game-name]/index.ts`:
```typescript
import { registerGame } from '../../connectors/registry';
import { myGameConnector } from './connector';

// Registruj hru do systému
registerGame(myGameConnector);

export { myGameConnector };
export { MyGameComponent } from './component';
export { defaultSettings } from './settings';
export type { MyGameSettings } from './settings';
```

### **KROK 3: Integrace do administrace**

#### **Aktualizace App.tsx** (přidej import nové hry):
```typescript
// Na začátek souboru přidej import
import './games/myAwesomeGame'; // Registrace nové hry

// V getGameComponent funkci přidej:
const gameComponents = {
  // ... existující hry
  myAwesomeGame: () => import('./games/myAwesomeGame').then(module => ({ default: module.MyGameComponent })),
};
```

#### **Aktualizace AdminPanel.tsx** (načítání nových her):
```typescript
import { getNewGames } from '../connectors/registry';

// V AdminPanel komponentě:
const newGames = getNewGames();

// Přidej nové hry do gameGroups nebo vytvoř novou kategorii:
const gameGroups = [
  // ... existující kategorie
  {
    title: "Nové hry",
    games: newGames.map(connector => ({
      id: connector.gameInfo.id,
      name: connector.gameInfo.name,
      description: connector.gameInfo.description,
      bg: connector.gameInfo.backgroundColor,
      image: connector.gameInfo.thumbnail,
      emoji: connector.gameInfo.icon
    }))
  }
];
```

---

## 🎨 **Design Guidelines**

### **Barevné schéma:**
```css
/* Základní barvy platformy */
--primary-blue: #4a43e8;        /* Hlavní modrá */
--success-green: #22c55e;       /* Zelená pro úspěch */  
--error-red: #ef4444;           /* Červená pro chybu */
--background-beige: #F5E6D0;    /* Béžové pozadí (výchozí) */

/* Specifické barvy her */
--orange-bg: #FFD3C5;           /* Pro "Zaplať a Rozměň" */
--yellow-bg: #FFF8CD;           /* Pro "Zjisti" */  
--blue-bg: #D0DBFF;             /* Pro "Kartičky" */

/* Neutrální barvy */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-600: #4b5563;
--gray-800: #1f2937;
```

### **Typografie - font VisbyRound:**
```css
/* Automaticky aplikováno na všechny elementy */
font-family: 'VisbyRound', sans-serif;

/* Velikosti podle Tailwind */
.text-sm    /* 14px */
.text-base  /* 16px */  
.text-lg    /* 18px */
.text-xl    /* 20px */
.text-2xl   /* 24px */
.text-3xl   /* 30px */
.text-4xl   /* 36px */
.text-5xl   /* 48px */
.text-6xl   /* 60px */
```

### **Responsive breakpoints:**
```css
/* Mobile first approach */
/* xs: 0px+ */     /* Výchozí - mobilní */
sm: 640px+         /* Malé tablety */  
md: 768px+         /* Tablety */
lg: 1024px+        /* Menší desktop */
xl: 1280px+        /* Desktop */
2xl: 1536px+       /* Velký desktop */
```

### **Layout patterns:**
```jsx
// ✅ Správný responsive layout
<div className="min-h-screen p-4 md:p-8">
  <div className="max-w-4xl mx-auto">
    {/* Obsah hry */}
  </div>
</div>

// ✅ Grid pro mobile/desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Items */}
</div>

// ✅ Flexbox centering
<div className="flex items-center justify-center min-h-screen">
  {/* Centrovaný obsah */}
</div>
```

### **Buttons styling:**
```jsx
// ✅ Primární tlačítko
<button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-colors">
  Pokračovat
</button>

// ✅ Sekundární tlačítko  
<button className="bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 px-6 py-3 rounded-xl font-bold">
  Zpět
</button>

// ✅ Úspěšné tlačítko
<button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold">
  Správně! ✓
</button>
```

### **Animace a přechody:**
```jsx
// ✅ Hover efekty
<div className="hover:scale-105 transition-transform duration-200">

// ✅ Fade in animace
<div className="animate-fade-in opacity-0 animate-delay-100">

// ✅ Loading states
<div className="animate-pulse bg-gray-200 rounded">

// ✅ Custom animace (už definované v CSS)
<div className="animate-simpleJump">        /* Kostky */
<div className="animate-celebrationPulse">  /* Oslava */
```

---

## 📱 **Responzivní design**

### **Mobile First pravidla:**
```jsx
// ✅ Velikosti pro mobil
<div className="text-lg md:text-2xl">           /* Menší na mobilu */
<div className="p-4 md:p-8">                   /* Menší padding */
<div className="grid grid-cols-1 md:grid-cols-2"> /* Jeden sloupec na mobilu */

// ✅ Touch targets (min 44px)
<button className="min-h-[44px] min-w-[44px] p-3">

// ✅ Čitelnost textu
<div className="text-base md:text-lg">         /* Min 16px na mobilu */
```

### **Testovací rozlišení:**
- **Mobile:** 375×667 (iPhone SE)
- **Tablet:** 768×1024 (iPad)  
- **Desktop:** 1920×1080

---

## 🔧 **TypeScript typy**

### **Povinné typy pro hru:**
```typescript
// Nastavení hry
export interface YourGameSettings extends GameSettings {
  // Definuj specifická nastavení
}

// Props herní komponenty
export interface YourGameProps extends GameProps {
  settings?: YourGameSettings;
}

// State hry
export interface GameState {
  currentQuestion?: Question;
  score: number;
  isFinished: boolean;
  timeLeft?: number;
}

// Herní data
export interface Question {
  id: string;
  // Definuj strukturu otázky
}

export interface Answer {
  // Definuj strukturu odpovědi
}
```

---

## 🎵 **Audio a Feedback**

### **Použití audio služeb:**
```typescript
const services = useGameServices();

// ✅ Zvuky
services.audio.playSuccessSound();     // Správná odpověď
services.audio.playErrorSound();       // Špatná odpověď  
services.audio.playClickSound();       // Kliknutí
services.audio.playBackgroundMusic();  // Hudba na pozadí

// ✅ Feedback hlášky
services.feedback.showCorrect();       // "SPRÁVNĚ!" toast
services.feedback.showWrong();         // "ŠPATNĚ!" toast
services.feedback.showSuccess('Výborně!'); // Vlastní zpráva
services.feedback.showHint('Nápověda...');  // Žlutá nápověda
services.feedback.hideAll();           // Skryj všechny
```

### **Timing guidelines:**
```typescript
// ✅ Doporučené timing
const FEEDBACK_DURATION = 1500;  // Zobrazení správně/špatně
const QUESTION_DELAY = 2000;     // Pauza mezi otázkami  
const HINT_DURATION = 4000;      // Doba zobrazení nápovědy
```

---

## ⚡ **Performance a optimalizace**

### **React optimalizace:**
```typescript
// ✅ Memoization
const MyComponent = React.memo(({ data }) => {
  // Komponenta se re-renderuje jen při změně props
});

// ✅ useMemo pro výpočty
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// ✅ useCallback pro funkce
const handleClick = useCallback((id: string) => {
  // Handler function
}, [dependency]);
```

### **Lazy loading:**
```typescript
// ✅ Lazy import komponent
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

// ✅ Suspense wrapper
<Suspense fallback={<div>Načítám...</div>}>
  <HeavyComponent />
</Suspense>
```

---

## 🐛 **Error Handling**

### **Povinné error handling:**
```typescript
// ✅ Try-catch pro async operace
const loadGameData = async () => {
  try {
    const data = await fetchGameData();
    setGameData(data);
  } catch (error) {
    console.error('Failed to load game data:', error);
    services.feedback.showWrong('Chyba při načítání hry');
  }
};

// ✅ Error boundary pro celou hru
export const GameErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary fallback={<div>Chyba v hře. Zkuste obnovit stránku.</div>}>
      {children}
    </ErrorBoundary>
  );
};

// ✅ Fallback states
{isLoading ? <LoadingSpinner /> : 
 hasError ? <ErrorMessage /> : 
 <GameContent />}
```

---

## 🧪 **Testování a debugování**

### **Testovací checklist:**
```
✅ Responzivní design (375px - 1920px)
✅ Touch targets (min 44×44px)
✅ Font VisbyRound se načítá
✅ Audio funguje (s fallbackem)
✅ Feedback hlášky se zobrazují
✅ Loading states fungují
✅ Error states fungují  
✅ Nastavení se ukládají
✅ Hra se správně ukončuje
✅ Performance je dobrá
```

### **Debug utilita:**
```typescript
// ✅ Debug mode pro vývoj
const DEBUG = process.env.NODE_ENV === 'development';

const debugLog = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[MyGame] ${message}`, data);
  }
};
```

---

## 📚 **Příklady implementace**

### **Jednoduchá kvízová hra:**
```typescript
// Minimální implementace s kvízy
export const QuizGame: React.FC<GameProps> = ({ settings }) => {
  const services = useGameServices();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  
  const questions = [
    { question: '2 + 2 = ?', answer: 4, options: [3, 4, 5, 6] },
    { question: '5 - 3 = ?', answer: 2, options: [1, 2, 3, 4] }
  ];
  
  const handleAnswer = (answer: number) => {
    const isCorrect = answer === questions[currentQuestion].answer;
    
    if (isCorrect) {
      services.audio.playSuccessSound();
      services.feedback.showCorrect();
      setScore(prev => prev + 1);
    } else {
      services.audio.playErrorSound(); 
      services.feedback.showWrong();
    }
    
    setTimeout(() => {
      if (currentQuestion + 1 >= questions.length) {
        services.feedback.showSuccess(`Hotovo! Skóre: ${score}/${questions.length}`);
      } else {
        setCurrentQuestion(prev => prev + 1);
      }
    }, 1500);
  };
  
  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center"
         style={{ backgroundColor: services.theme.colors.background }}>
      <h1 className="text-3xl font-bold mb-8">
        {questions[currentQuestion].question}
      </h1>
      
      <div className="grid grid-cols-2 gap-4">
        {questions[currentQuestion].options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            className="bg-white hover:bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-xl font-bold"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};
```

---

## 🚀 **Deployment checklist**

### **Před odevzdáním hry:**
```
✅ Všechny soubory vytvořeny (/games/[name]/)
✅ Konektor implementován a registrován
✅ Nastavení definována s _configUI
✅ Komponenta používá služby správně
✅ TypeScript typy definovány
✅ Error handling implementován
✅ Responzivní design otestován
✅ Audio/feedback testováno
✅ Performance zkontrolována
✅ README.md vytvořen (volitelné)
```

### **Integrace s administrací:**
```
✅ Import v App.tsx přidán
✅ Lazy loading configurován
✅ AdminPanel aktualizován
✅ GameConfigurator podporuje nová nastavení
✅ URL routing funguje
✅ Spuštění z konfiguratoru funguje
```

---

## 🔍 **FAQ a troubleshooting**

### **Časté problémy:**

**Q: Services nejsou dostupné v komponentě**
```typescript
// ❌ Špatně - services undefined
const services = useGameServices(); // Error!

// ✅ Správně - komponenta musí být zabalená v ServicesProvider
<ServicesProvider services={administrationServices}>
  <MyGameComponent />
</ServicesProvider>
```

**Q: Font se nenačítá**
```css
/* ✅ Font je načten automaticky z globals.css */
/* Nic nepřidávej, jen používej className nebo inline style */
font-family: 'VisbyRound', sans-serif; /* Automaticky */
```

**Q: Audio nefunguje**
```typescript
// ✅ Všechny audio funkce mají fallback
services.audio.playSuccessSound(); // Automatický fallback
```

**Q: Responsive nefunguje**
```jsx
// ❌ Špatně - nezadané breakpointy
<div className="text-6xl">

// ✅ Správně - mobile first
<div className="text-2xl md:text-4xl lg:text-6xl">
```

---

## 🎯 **Závěrečná připomínka**

### **Povinné body při implementaci:**
1. ✅ **Modulární architektura** - hra je samostatný modul
2. ✅ **Konektor pattern** - komunikace přes definované rozhraní  
3. ✅ **Služby z administrace** - audio, feedback, theme
4. ✅ **Responzivní design** - mobile first přístup
5. ✅ **TypeScript** - silné typování všech interface
6. ✅ **Error handling** - graceful degradation
7. ✅ **Performance** - lazy loading, memoization
8. ✅ **Accessibility** - min 44px touch targets
9. ✅ **Konzistentní UX** - s ostatními hrami
10. ✅ **Dokumentace** - komentáře v kódu

**Úspěšně vytvořená hra se automaticky objeví v administraci a bude plně funkční s konfigurátorem! 🎉**

---

*Specifikace verze 1.0 - Aktualizováno pro matematickou platformu s modulární architekturou*