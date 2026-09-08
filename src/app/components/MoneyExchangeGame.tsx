import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { useDrag, useDrop } from 'react-dnd';
import { GameResultScreen } from './GameResultScreen';
import { useAudio } from './AudioManager';

// Interface pro popup hlášku
interface PopupMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
  isVisible: boolean;
}

// Detekce touch zařízení
const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Interface pro mince
interface CoinType {
  id: string;
  value: number;
}

// Šablony herních předmětů s cenami
const gameItemTemplates = [
  { name: 'Fialový bonbon', priceRange: [2, 5], imageUrl: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/kc/symboly/barevnesymboly_4_3_purplebonbon.svg', tagColor: '#96ceb4' },
  { name: 'Červený bonbon', priceRange: [3, 6], imageUrl: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/kc/symboly/barevnesymboly_4_5_redbonbon.svg', tagColor: '#fadf4b' },
  { name: 'Rohlík', priceRange: [3, 5], imageUrl: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/kc/symboly/dalsisymboly_1_7_rohlik.svg', tagColor: '#4ecdc4' },
  { name: 'Švestka', priceRange: [5, 9], imageUrl: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/kc/symboly/dalsisymboly_1_4_svestka.svg', tagColor: '#fd79a8' },
  { name: 'Pomeranč', priceRange: [8, 15], imageUrl: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/kc/symboly/dalsisymboly_1_8_mandarinka.svg', tagColor: '#45b7d1' },
  { name: 'Oranžové jablko', priceRange: [12, 18], imageUrl: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/kc/symboly/barevnesymboly_3_3_orangeapple.svg', tagColor: '#ff6b6b' },
  { name: 'Červené jablko', priceRange: [15, 22], imageUrl: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/kc/symboly/barevnesymboly_3_5_redapple.svg', tagColor: '#ffeaa7' },
  { name: 'Dýně', priceRange: [18, 28], imageUrl: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/kc/symboly/dalsisymboly_1_6_dyne.svg', tagColor: '#fdcb6e' },
  { name: 'Autíčko', priceRange: [22, 35], imageUrl: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/kc/symboly/dalsisymboly_2_6_auticko.svg', tagColor: '#dda0dd' },
  { name: 'Letadlo', priceRange: [28, 42], imageUrl: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/kc/symboly/dalsisymboly_2_5_letadlo.svg', tagColor: '#ffb347' },
  { name: 'Nůžky', priceRange: [35, 48], imageUrl: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/kc/symboly/dalsisymboly_2_7_nuzky%20(1).svg', tagColor: '#ff7f7f' },
];

// Interface pro herní předmět
interface GameItem {
  name: string;
  price: number;
  imageUrl: string;
  tagColor: string;
}

// Herní módy
enum GameMode {
  SHOPPING = 'shopping',    // Nakupovací mód
  EXCHANGE = 'exchange'     // Rozměňovací mód
}

// Interface pro herní kolo
interface GameRound {
  mode: GameMode;
  items: GameItem[];
  totalPrice: number;
  exchangeCoin?: number; // Pro rozměňovací mód
}

// Generování náhodné ceny v rozsahu
const generateRandomPrice = (priceRange: number[]): number => {
  const [min, max] = priceRange;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Vytvoření herního předmětu s náhodnou cenou
const createGameItem = (template: typeof gameItemTemplates[0]): GameItem => {
  return {
    ...template,
    price: generateRandomPrice(template.priceRange),
    priceRange: undefined // Odstraň priceRange z finálního předmětu
  } as GameItem;
};

// Generování herního kola - nakupovací nebo rozměňovací mód
const generateGameRound = (settings?: Record<string, any>): GameRound => {
  // Získání povolených herních módů z nastavení
  const allowedModes = settings?.gameModes || ['shopping', 'exchange'];
  const allowShopping = allowedModes.includes('shopping');
  const allowExchange = allowedModes.includes('exchange');
  
  let isExchangeMode = false;
  
  if (allowShopping && allowExchange) {
    // Oba módy povoleny - 40% šance na rozměňovací mód
    isExchangeMode = Math.random() < 0.4;
  } else if (allowExchange && !allowShopping) {
    // Pouze rozměňování
    isExchangeMode = true;
  } else {
    // Pouze nakupování nebo žádné nastavení
    isExchangeMode = false;
  }
  
  if (isExchangeMode) {
    // Rozměňovací mód - generuj minci k rozměnění (10, 20, nebo 50 Kč)
    const allowedCoins = settings?.coinTypes || [1, 2, 5, 10, 20, 50];
    const exchangeableCoins = allowedCoins.filter((coin: number) => coin >= 10); // Pouze mince 10 Kč a vyšší pro rozměňování
    const validCoins = exchangeableCoins.length > 0 ? exchangeableCoins : [10, 20, 50];
    const exchangeCoin = validCoins[Math.floor(Math.random() * validCoins.length)];
    
    return {
      mode: GameMode.EXCHANGE,
      items: [],
      totalPrice: exchangeCoin,
      exchangeCoin: exchangeCoin
    };
  } else {
    // Nakupovací mód
    const allowedCategories = settings?.itemCategories || ['candy', 'fruit', 'food', 'toys'];
    const filteredTemplates = gameItemTemplates.filter(template => {
      if (allowedCategories.includes('candy') && ['Fialový bonbon', 'Červený bonbon'].includes(template.name)) return true;
      if (allowedCategories.includes('fruit') && ['Švestka', 'Pomeranč', 'Oranžové jablko', 'Červené jablko'].includes(template.name)) return true;
      if (allowedCategories.includes('food') && ['Rohlík', 'Dýně'].includes(template.name)) return true;
      if (allowedCategories.includes('toys') && ['Autíčko', 'Letadlo', 'Nůžky'].includes(template.name)) return true;
      return false;
    });
    
    const availableTemplates = filteredTemplates.length > 0 ? filteredTemplates : gameItemTemplates;
    const enableTwoItems = settings?.enableTwoItems !== false; // defaultně true
    const shouldHaveTwoItems = enableTwoItems && Math.random() < 0.3; // 30% šance na dva předměty
    
    if (shouldHaveTwoItems) {
      // Vyber dva různé předměty
      const firstIndex = Math.floor(Math.random() * availableTemplates.length);
      let secondIndex = Math.floor(Math.random() * availableTemplates.length);
      while (secondIndex === firstIndex && availableTemplates.length > 1) {
        secondIndex = Math.floor(Math.random() * availableTemplates.length);
      }
      
      const items = [
        createGameItem(availableTemplates[firstIndex]), 
        createGameItem(availableTemplates[secondIndex])
      ];
      const totalPrice = items[0].price + items[1].price;
      
      return { mode: GameMode.SHOPPING, items, totalPrice };
    } else {
      // Jeden předmět
      const template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
      const item = createGameItem(template);
      return { mode: GameMode.SHOPPING, items: [item], totalPrice: item.price };
    }
  }
};

// Funkce pro analýzu potřebných mincí pro danou částku
const analyzeRequiredCoins = (price: number): { [key: number]: number } => {
  const required = { 1: 0, 2: 0, 5: 0, 10: 0, 20: 0, 50: 0 };
  
  // Pro lichá čísla musíme mít aspoň jednu 1 Kč minci
  if (price % 2 === 1) {
    required[1] = Math.max(required[1], 1);
  }
  
  // Pro čísla nekončící na 0 nebo 5 potřebujeme 1 nebo 2 Kč mince
  const lastDigit = price % 10;
  if (lastDigit === 1 || lastDigit === 3 || lastDigit === 6 || lastDigit === 7 || lastDigit === 8 || lastDigit === 9) {
    required[1] = Math.max(required[1], 1);
  }
  if (lastDigit === 2 || lastDigit === 4 || lastDigit === 7 || lastDigit === 9) {
    required[2] = Math.max(required[2], 1);
  }
  
  // Pro čísla končící na 5 (ale ne na 0) potřebujeme 5 Kč minci nebo kombinaci 1+2 Kč
  if (lastDigit === 5 && price % 10 !== 0) {
    required[5] = Math.max(required[5], 1);
  }
  
  return required;
};

// Inteligentní generování mincí - více než potřeba + vždy hratelné
const generateCoinsForPrice = (price: number, timestamp: number, settings?: Record<string, any>): CoinType[] => {
  const coins: CoinType[] = [];
  let counter = 1;

  // Získání násobitele z nastavení
  const multiplier = settings?.coinGenerationMultiplier || 2.5;
  const targetTotal = price * (multiplier + Math.random() * 0.6); // násobitel + náhodná variace
  
  // Získání povolených typů mincí z nastavení
  const allowedCoinTypes = settings?.coinTypes || [1, 2, 5, 10, 20, 50];
  
  // Začni s minimálně 2 kusy od každé povolené mince
  const coinCounts: Record<number, number> = {};
  allowedCoinTypes.forEach((coinType: number) => {
    coinCounts[coinType] = 2;
  });

  // Analyzuj, jaké mince jsou nutně potřeba pro tuto částku
  const requiredCoins = analyzeRequiredCoins(price);
  
  // Zajisti minimální potřebné mince
  Object.entries(requiredCoins).forEach(([value, minCount]) => {
    const coinValue = parseInt(value);
    if (allowedCoinTypes.includes(coinValue)) {
      coinCounts[coinValue] = Math.max(coinCounts[coinValue], minCount + 2); // +2 pro jistotu
    }
  });

  // Inteligentní distribuce podle cenového pásma (navíc k základním 2 kusům)
  if (price <= 10) {
    // Malé částky: ještě více malých mincí
    if (allowedCoinTypes.includes(1)) coinCounts[1] += Math.floor(Math.random() * 4) + 2;  // +2-5 ks (celkem 4-7)
    if (allowedCoinTypes.includes(2)) coinCounts[2] += Math.floor(Math.random() * 3) + 2;  // +2-4 ks (celkem 4-6)
    if (allowedCoinTypes.includes(5)) coinCounts[5] += Math.floor(Math.random() * 2) + 1;  // +1-2 ks (celkem 3-4)
    if (allowedCoinTypes.includes(10)) coinCounts[10] += Math.floor(Math.random() * 2) + 0; // +0-1 ks (celkem 2-3)
  } else if (price <= 25) {
    // Střední částky: více kombinací
    if (allowedCoinTypes.includes(1)) coinCounts[1] += Math.floor(Math.random() * 3) + 2;  // +2-4 ks (celkem 4-6)
    if (allowedCoinTypes.includes(2)) coinCounts[2] += Math.floor(Math.random() * 3) + 2;  // +2-4 ks (celkem 4-6)
    if (allowedCoinTypes.includes(5)) coinCounts[5] += Math.floor(Math.random() * 3) + 1;  // +1-3 ks (celkem 3-5)
    if (allowedCoinTypes.includes(10)) coinCounts[10] += Math.floor(Math.random() * 3) + 1; // +1-3 ks (celkem 3-5)
  } else if (price <= 45) {
    // Vyšší částky: zahrnout 20 Kč mince
    if (allowedCoinTypes.includes(1)) coinCounts[1] += Math.floor(Math.random() * 2) + 1;  // +1-2 ks (celkem 3-4)
    if (allowedCoinTypes.includes(2)) coinCounts[2] += Math.floor(Math.random() * 3) + 1;  // +1-3 ks (celkem 3-5)
    if (allowedCoinTypes.includes(5)) coinCounts[5] += Math.floor(Math.random() * 3) + 1;  // +1-3 ks (celkem 3-5)
    if (allowedCoinTypes.includes(10)) coinCounts[10] += Math.floor(Math.random() * 3) + 1; // +1-3 ks (celkem 3-5)
    if (allowedCoinTypes.includes(20)) coinCounts[20] += Math.floor(Math.random() * 3) + 1; // +1-3 ks (celkem 3-5)
  } else {
    // Velké částky: zahrnout 50 Kč mince
    if (allowedCoinTypes.includes(1)) coinCounts[1] += Math.floor(Math.random() * 2) + 1;  // +1-2 ks (celkem 3-4)
    if (allowedCoinTypes.includes(2)) coinCounts[2] += Math.floor(Math.random() * 2) + 1;  // +1-2 ks (celkem 3-4)
    if (allowedCoinTypes.includes(5)) coinCounts[5] += Math.floor(Math.random() * 3) + 1;  // +1-3 ks (celkem 3-5)
    if (allowedCoinTypes.includes(10)) coinCounts[10] += Math.floor(Math.random() * 3) + 1; // +1-3 ks (celkem 3-5)
    if (allowedCoinTypes.includes(20)) coinCounts[20] += Math.floor(Math.random() * 3) + 1; // +1-3 ks (celkem 3-5)
    if (allowedCoinTypes.includes(50)) coinCounts[50] += Math.floor(Math.random() * 2) + 1; // +1-2 ks (celkem 3-4)
  }

  // Zajisti dostatek hodnoty k zaplacení
  let currentTotal = Object.entries(coinCounts).reduce((sum, [value, count]) => sum + (parseInt(value) * count), 0);
  
  // Pokud nestačí (což by se už nemělo stát), přidej strategické mince
  while (currentTotal < price) {
    const availableValues = allowedCoinTypes.sort((a: number, b: number) => b - a); // Největší první
    let coinAdded = false;
    
    for (const coinValue of availableValues) {
      if (price - currentTotal >= coinValue && Math.random() > 0.3) {
        coinCounts[coinValue]++;
        currentTotal += coinValue;
        coinAdded = true;
        break;
      }
    }
    
    // Pokud se nepodařilo přidat větší minci, přidej nejmenší dostupnou
    if (!coinAdded) {
      const smallestCoin = allowedCoinTypes.sort((a: number, b: number) => a - b)[0];
      if (smallestCoin) {
        coinCounts[smallestCoin]++;
        currentTotal += smallestCoin;
      } else {
        break; // Pokud nejsou žádné povolené mince, konec
      }
    }
  }

  // Přidej ještě trochu extra mincí pro větší volnost (20% navíc)
  const extraMultiplier = 1.2;
  Object.keys(coinCounts).forEach(value => {
    const coinValue = parseInt(value);
    const extraCoins = Math.floor(coinCounts[coinValue] * (extraMultiplier - 1));
    if (extraCoins > 0 && Math.random() > 0.3) { // 70% šance na přidání extra mincí
      coinCounts[coinValue] += extraCoins;
    }
  });

  // Generuj skutečné objekty mincí
  Object.entries(coinCounts).forEach(([value, count]) => {
    for (let i = 0; i < count; i++) {
      coins.push({
        id: `coin-${value}-${counter++}-${timestamp}`,
        value: parseInt(value)
      });
    }
  });

  // Zamíchej pole mincí pro náhodné pozicování
  for (let i = coins.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [coins[i], coins[j]] = [coins[j], coins[i]];
  }

  return coins;
};

// Komponenta mince
function Coin({ coin, onMove, size = 'normal', style }: { 
  coin: CoinType; 
  onMove: (coin: CoinType) => void;
  size?: 'normal' | 'small';
  style?: React.CSSProperties;
}) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'coin',
    item: coin,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      onMove(coin);
    }
  };

  const getCoinImageUrl = (value: number) => {
    const baseUrl = 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/kc/';
    return `${baseUrl}${value}kc.svg`;
  };

  // Responzivní velikosti mincí - každá vyšší hodnota ~10% větší
  const getCoinSize = () => {
    if (size === 'small') return { width: '128px', height: '128px' }; // 20% menší v platební oblasti
    
    // Responzivní velikosti podle viewportu
    switch (coin.value) {
      case 1: return { width: 'clamp(53px, 7vw, 98px)', height: 'clamp(53px, 7vw, 98px)' };
      case 2: return { width: 'clamp(58px, 8vw, 108px)', height: 'clamp(58px, 8vw, 108px)' };
      case 5: return { width: 'clamp(64px, 8vw, 119px)', height: 'clamp(64px, 8vw, 119px)' };
      case 10: return { width: 'clamp(67px, 8vw, 123px)', height: 'clamp(67px, 8vw, 123px)' };
      case 20: return { width: 'clamp(70px, 9vw, 130px)', height: 'clamp(70px, 9vw, 130px)' };
      case 50: return { width: 'clamp(74px, 9vw, 133px)', height: 'clamp(74px, 9vw, 133px)' };
      default: return { width: 'clamp(53px, 7vw, 98px)', height: 'clamp(53px, 7vw, 98px)' };
    }
  };

  const coinSize = getCoinSize();
  
  return (
    <div 
      ref={drag}
      onClick={handleClick}
      style={{
        ...coinSize,
        ...style,
        cursor: 'move',
        transition: 'all 0.2s',
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? 'scale(0.9)' : 'scale(1)',
      }}
      className="hover:scale-110 visby-font"
    >
      <img 
        src={getCoinImageUrl(coin.value)}
        alt={`${coin.value} Kč`}
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'contain',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
        }}
        draggable={false}
      />
    </div>
  );
}

// Komponenta platební oblasti
function PaymentArea({ onDrop, children }: { 
  onDrop: (coin: CoinType) => void; 
  children: React.ReactNode;
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'coin',
    drop: (item: CoinType) => {
      onDrop(item);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div className="relative flex flex-col items-center">
      {/* Platební oblast - responzivní - zvětšeno o 35% (20px + 15%) */}
      <div 
        ref={drop}
        className="bg-white transition-all duration-200 rounded-3xl flex items-center justify-center relative visby-font"
        style={{
          width: 'clamp(345px, 50vw, 669px)', // Zvětšeno o 15%: 300*1.15=345, 582*1.15=669
          height: 'clamp(224px, 37.4vh, 415px)', // Zvětšeno o 15%: 195*1.15=224, 32.5*1.15=37.4, 361*1.15=415
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
          border: isOver ? '2px solid #75fbc3' : '2px solid transparent',
          backgroundColor: isOver ? '#f0fdf4' : '#ffffff',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Komponenta pro velký popup s hláškou - JEDNODUCHÁ A FUNGUJÍCÍ
function GamePopup({ popup, onClose }: { popup: PopupMessage | null; onClose: () => void }) {
  if (!popup || !popup.isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div 
        className="bg-white rounded-2xl shadow-2xl p-8 m-6 max-w-md w-full transform scale-100 animate-in fade-in zoom-in duration-300 visby-font"
        style={{
          border: popup.type === 'success' ? '3px solid #10b981' : '3px solid #ef4444'
        }}
      >
        <div className="text-center">
          {/* Ikona */}
          <div className="mb-4">
            {popup.type === 'success' ? (
              <div 
                className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                style={{ backgroundColor: '#dcfce7' }}
              >
                <svg className="w-10 h-10" style={{ color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            ) : (
              <div 
                className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                style={{ backgroundColor: '#fee2e2' }}
              >
                <svg className="w-10 h-10" style={{ color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            )}
          </div>

          {/* Zpráva */}
          <div 
            className="text-lg mb-6 px-2 visby-font"
            style={{ 
              color: '#1f2937',
              lineHeight: '1.6'
            }}
          >
            {popup.message}
          </div>

          {/* Tlačítko pro zavření */}
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-white transition-transform hover:scale-105 active:scale-95 visby-font"
            style={{
              backgroundColor: popup.type === 'success' ? '#10b981' : '#ef4444',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            Pokračovat
          </button>
        </div>
      </div>
    </div>
  );
}

// Hlavní komponenta hry
interface MoneyExchangeGameProps {
  settings?: Record<string, any>;
}

export function MoneyExchangeGame({ settings }: MoneyExchangeGameProps) {
  const { playSound } = useAudio();
  
  const [currentRound, setCurrentRound] = useState<GameRound>({ mode: GameMode.SHOPPING, items: [], totalPrice: 0 });
  const [availableCoins, setAvailableCoins] = useState<CoinType[]>([]);
  const [paidCoins, setPaidCoins] = useState<CoinType[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [popup, setPopup] = useState<PopupMessage | null>(null);

  // Pro oslavu po 10 správných odpovědích
  const [correctInARow, setCorrectInARow] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Sledování kol pro rozměňovací mód
  const [exchangeRounds, setExchangeRounds] = useState(0);
  const [exchangeCorrect, setExchangeCorrect] = useState(0);
  const [exchangeAttempts, setExchangeAttempts] = useState(0);

  // Inicializace mincí pro první hru
  useEffect(() => {
    const round = generateGameRound(settings);
    setCurrentRound(round);
    const timestamp = Date.now();
    setAvailableCoins(generateCoinsForPrice(round.totalPrice, timestamp, settings));
  }, [settings]);

  const moveCoinToPayment = (coin: CoinType) => {
    setAvailableCoins(prev => prev.filter(c => c.id !== coin.id));
    setPaidCoins(prev => [...prev, coin]);
  };

  const moveCoinBack = (coin: CoinType) => {
    setPaidCoins(prev => prev.filter(c => c.id !== coin.id));
    setAvailableCoins(prev => [...prev, coin]);
  };

  const checkPayment = () => {
    const totalPaid = paidCoins.reduce((sum, coin) => sum + coin.value, 0);
    let isCorrect = totalPaid === currentRound.totalPrice;
    
    // Pro rozměňovací mód: kontrola, že se nepoužila mince stejné hodnoty jako rozměňovaná
    if (currentRound.mode === GameMode.EXCHANGE && isCorrect) {
      const usedSameCoin = paidCoins.some(coin => coin.value === currentRound.exchangeCoin);
      if (usedSameCoin) {
        isCorrect = false;
        
        // Speciální chybová hláška
        setPopup({
          id: Date.now().toString(),
          type: 'error',
          message: `❌ Nemůžeš použít minci ${currentRound.exchangeCoin} Kč! Musíš rozměnit na menší mince.`,
          isVisible: true
        });
        
        setAttempts(prev => prev + 1);
        if (currentRound.mode === GameMode.EXCHANGE) {
          setExchangeAttempts(prev => prev + 1);
        }
        setCorrectInARow(0);
        playSound?.('incorrect');
        return;
      }
    }
    
    setAttempts(prev => prev + 1);
    if (currentRound.mode === GameMode.EXCHANGE) {
      setExchangeAttempts(prev => prev + 1);
    }
    
    if (isCorrect) {
      // SPRÁVNÁ ODPOVĚĎ
      setScore(prev => prev + 1);
      setCorrectInARow(prev => prev + 1);
      
      // Sledování rozměňovacích kol
      if (currentRound.mode === GameMode.EXCHANGE) {
        setExchangeRounds(prev => prev + 1);
        setExchangeCorrect(prev => prev + 1);
        
        // Po 10 kolech rozměňování zobrazit velkou oslavu
        if (exchangeRounds + 1 >= 10) {
          setTimeout(() => {
            setShowCelebration(true);
          }, 1000);
          playSound?.('correct');
          return;
        }
      }
      
      let message: string;
      if (currentRound.mode === GameMode.EXCHANGE) {
        message = `🎉 Skvěle! Rozměnil jsi ${currentRound.exchangeCoin} Kč!`;
      } else {
        const itemsText = currentRound.items.length === 1 
          ? `${currentRound.items[0].name.toLowerCase()}`
          : `${currentRound.items[0].name.toLowerCase()} a ${currentRound.items[1].name.toLowerCase()}`;
        
        message = `🎉 Skvěle! Zaplatil jsi ${currentRound.totalPrice} Kč za ${itemsText}.`;
      }
      
      // Zobrazit obyčejný popup pro správnou odpověď
      setPopup({
        id: Date.now().toString(),
        type: 'success',
        message,
        isVisible: true
      });
      
      // Přehrát zvuk úspěchu
      playSound?.('correct');
    } else {
      // ŠPATNÁ ODPOVĚĎ
      setCorrectInARow(0); // Reset počítadla správných odpovědí
      
      let message: string;
      if (currentRound.mode === GameMode.EXCHANGE) {
        if (totalPaid > currentRound.totalPrice) {
          message = `❌ Příliš mnoho! Složil jsi ${totalPaid} Kč, ale potřebuješ ${currentRound.totalPrice} Kč.`;
        } else {
          message = `❌ Příliš málo! Složil jsi ${totalPaid} Kč, ale potřebuješ ${currentRound.totalPrice} Kč.`;
        }
      } else {
        const itemsText = currentRound.items.length === 1 
          ? `${currentRound.items[0].name.toLowerCase()}`
          : `${currentRound.items[0].name.toLowerCase()} a ${currentRound.items[1].name.toLowerCase()}`;
          
        if (totalPaid > currentRound.totalPrice) {
          message = `❌ Příliš mnoho! Zaplatil jsi ${totalPaid} Kč, ale ${itemsText} stojí ${currentRound.totalPrice} Kč.`;
        } else {
          message = `❌ Příliš málo! Zaplatil jsi ${totalPaid} Kč, ale ${itemsText} stojí ${currentRound.totalPrice} Kč.`;
        }
      }
      
      // Zobrazit popup pro špatnou odpověď
      setPopup({
        id: Date.now().toString(),
        type: 'error',
        message,
        isVisible: true
      });
      
      // Přehrát zvuk chyby
      playSound?.('incorrect');
    }
  };

  const resetGame = () => {
    const newRound = generateGameRound(settings);
    setCurrentRound(newRound);
    
    const timestamp = Date.now();
    setAvailableCoins(generateCoinsForPrice(newRound.totalPrice, timestamp, settings));
    setPaidCoins([]);
    setScore(0);
    setAttempts(0);
    setCorrectInARow(0);
    setExchangeRounds(0);
    setExchangeCorrect(0);
    setExchangeAttempts(0);
    setPopup(null);
    setShowCelebration(false);
  };

  const handlePopupClose = () => {
    if (popup?.type === 'success') {
      // Při úspěchu automaticky pokračuj na nové kolo
      setTimeout(() => {
        const newRound = generateGameRound(settings);
        setCurrentRound(newRound);
        
        const timestamp = Date.now();
        setAvailableCoins(generateCoinsForPrice(newRound.totalPrice, timestamp, settings));
        setPaidCoins([]);
      }, 300);
    }
    setPopup(null);
  };

  const handleCelebrationContinue = () => {
    setShowCelebration(false);
    setCorrectInARow(0); // Reset počítadla
    setExchangeRounds(0); // Reset rozměňovacích kol
    setExchangeCorrect(0); // Reset správných rozměnění
    setExchangeAttempts(0); // Reset pokusů rozměnění
    
    // Začni nové kolo
    const newRound = generateGameRound(settings);
    setCurrentRound(newRound);
    
    const timestamp = Date.now();
    setAvailableCoins(generateCoinsForPrice(newRound.totalPrice, timestamp, settings));
    setPaidCoins([]);
  };

  return (
    <DndProvider backend={isTouchDevice() ? TouchBackend : HTML5Backend}>
      <div 
        className="min-h-screen w-full p-6 visby-font"
        style={{ backgroundColor: settings?.backgroundColor || '#fbebea' }}
      >
        {/* Zobrazení skóre a tlačítka nová hra */}
        <div className="fixed top-4 right-4 flex items-center gap-3 z-50">
          <div className="bg-white/90 rounded-lg px-3 py-2 shadow-sm visby-font">
            <span className="text-sm">Skóre: {score}/{attempts}</span>
            {exchangeRounds > 0 && (
              <span className="text-xs ml-2 text-gray-500">({exchangeRounds}/10 rozměn)</span>
            )}
          </div>
          <button
            onClick={resetGame}
            className="px-3 py-2 rounded-lg text-white transition-transform hover:scale-105 active:scale-95 visby-font"
            style={{
              backgroundColor: '#f472b6',
              fontSize: '12px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(244, 114, 182, 0.3)'
            }}
          >
            Nová hra
          </button>
        </div>

        {/* Mobilní layout */}
        <div className="block lg:hidden">
          {/* Nadpis - pozice vlevo, posunut o 20px dolů */}
          <div className="fixed left-6 z-50" style={{ top: 'calc(24px + 20px)' }}>
            <h1 
              className="text-black visby-font"
              style={{ 
                fontSize: 'clamp(36px, 8vw, 72px)',
                fontWeight: 'bold'
              }}
            >
              {currentRound.mode === GameMode.EXCHANGE ? 'Rozměň' : 'Zaplať'}
            </h1>
          </div>

          {/* Předměty/Exchange mince - pozice nad platební oblastí, centrovaně */}
          <div className="flex justify-center mt-2 mb-4 z-40">
            {currentRound.mode === GameMode.EXCHANGE ? (
              // Rozměňovací mód - zobraz velkou minci k rozměnění
              <>
                <div style={{ 
                  width: 'clamp(137px, 27vw, 218px)',
                  height: 'clamp(137px, 27vw, 218px)'
                }}>
                  <img 
                    src={`https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/kc/${currentRound.exchangeCoin}kc.svg`}
                    alt={`${currentRound.exchangeCoin} Kč`}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                    }}
                  />
                </div>
              </>
            ) : currentRound.items.length === 1 && currentRound.items[0] ? (
              // Layout pro jeden předmět
              <>
                <div className="flex items-center gap-4">
                  {/* Cenový štítek vlevo */}
                  <div 
                    className="flex items-center justify-center rounded-3xl relative visby-font"
                    style={{
                      width: 'clamp(120px, 25vw, 160px)',
                      height: 'clamp(70px, 15vw, 100px)',
                      backgroundColor: currentRound.items[0].tagColor,
                      transform: 'rotate(-6deg)'
                    }}
                  >
                    <div className="absolute bg-white rounded-full" style={{
                      width: 'clamp(8px, 1.5vw, 12px)',
                      height: 'clamp(8px, 1.5vw, 12px)',
                      right: '8px', top: '8px'
                    }} />
                    <span className="visby-font" style={{ 
                      fontSize: 'clamp(20px, 5vw, 36px)', 
                      fontWeight: 'bold',
                      color: '#2d1810', 
                      letterSpacing: '1px',
                      textShadow: '2px 2px 4px rgba(255,255,255,0.8), -1px -1px 2px rgba(255,255,255,0.6)',
                      WebkitTextStroke: '1px rgba(255,255,255,0.3)'
                    }}>
                      {currentRound.items[0].price} Kč
                    </span>
                  </div>
                  
                  {/* Obrázek předmětu vpravo */}
                  <div style={{ 
                    width: 'clamp(156px, 31vw, 234px)',
                    height: 'clamp(156px, 31vw, 234px)'
                  }}>
                    <img 
                      src={currentRound.items[0].imageUrl} 
                      alt={currentRound.items[0].name}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                </div>
              </>
            ) : currentRound.items.length === 2 && currentRound.items[0] && currentRound.items[1] ? (
              // Layout pro dva předměty
              <>
                <div className="flex items-center gap-6">
                  {/* Cenové štítky vlevo */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-center rounded-2xl relative visby-font"
                      style={{
                        width: 'clamp(90px, 18vw, 120px)', height: 'clamp(50px, 10vw, 70px)',
                        backgroundColor: currentRound.items[0].tagColor, transform: 'rotate(-6deg)'
                      }}>
                      <div className="absolute bg-white rounded-full" style={{
                        width: 'clamp(6px, 1vw, 8px)', height: 'clamp(6px, 1vw, 8px)',
                        right: '6px', top: '6px'
                      }} />
                      <span className="visby-font" style={{ 
                        fontSize: 'clamp(14px, 3vw, 24px)', 
                        fontWeight: 'bold',
                        color: '#2d1810',
                        textShadow: '1px 1px 2px rgba(255,255,255,0.8)'
                      }}>
                        {currentRound.items[0].price} Kč
                      </span>
                    </div>
                    <div className="flex items-center justify-center rounded-2xl relative visby-font"
                      style={{
                        width: 'clamp(90px, 18vw, 120px)', height: 'clamp(50px, 10vw, 70px)',
                        backgroundColor: currentRound.items[1].tagColor, transform: 'rotate(6deg)'
                      }}>
                      <div className="absolute bg-white rounded-full" style={{
                        width: 'clamp(6px, 1vw, 8px)', height: 'clamp(6px, 1vw, 8px)',
                        right: '6px', top: '6px'
                      }} />
                      <span className="visby-font" style={{ 
                        fontSize: 'clamp(14px, 3vw, 24px)', 
                        fontWeight: 'bold',
                        color: '#2d1810',
                        textShadow: '1px 1px 2px rgba(255,255,255,0.8)'
                      }}>
                        {currentRound.items[1].price} Kč
                      </span>
                    </div>
                  </div>
                  
                  {/* Předměty vpravo */}
                  <div className="flex flex-row gap-4">
                    <div style={{ 
                      width: 'clamp(120px, 24vw, 180px)',
                      height: 'clamp(120px, 24vw, 180px)'
                    }}>
                      <img 
                        src={currentRound.items[0].imageUrl} 
                        alt={currentRound.items[0].name}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                    <div style={{ 
                      width: 'clamp(120px, 24vw, 180px)',
                      height: 'clamp(120px, 24vw, 180px)'
                    }}>
                      <img 
                        src={currentRound.items[1].imageUrl} 
                        alt={currentRound.items[1].name}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Platební oblast - FIXED na střed obrazovky */}
          <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
            <PaymentArea onDrop={moveCoinToPayment}>
              {paidCoins.length === 0 ? (
                <div className="text-gray-400 text-center visby-font">
                  <div style={{ fontSize: 'clamp(16px, 4vw, 24px)' }}>Přetáhni</div>
                  <div style={{ fontSize: 'clamp(16px, 4vw, 24px)' }}>mince zde</div>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  {/* Mince pozicované v platební oblasti */}
                  {paidCoins.map((coin, index) => {
                    const baseX = 50; // Střední pozice
                    const baseY = 40; // Posunuto nahoru pro tlačítka
                    const offsetX = (index - (paidCoins.length - 1) / 2) * 12.5;
                    const offsetY = Math.sin(index * 0.5) * 8;
                    
                    return (
                      <div
                        key={`paid-${coin.id}-${index}`}
                        className="absolute"
                        style={{
                          left: `calc(${baseX + offsetX}% - 64px)`,
                          top: `calc(${baseY + offsetY}% - 64px)`,
                          zIndex: index + 1
                        }}
                      >
                        <Coin 
                          coin={coin} 
                          onMove={moveCoinBack}
                          size="small"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Akční tlačítko uvnitř platební oblasti */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={checkPayment}
                  className="px-4 py-2 rounded-full text-white transition-transform hover:scale-105 active:scale-95 visby-font"
                  style={{
                    backgroundColor: '#10b981',
                    fontSize: 'clamp(12px, 2.2vw, 16px)', // Větší tlačítko
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  ZKONTROLOVAT
                </button>
              </div>
            </PaymentArea>
          </div>

          {/* Peněženka a mince - pozice dole uprostřed, posunuto o 60px dolů, pak o 3px výš, posunuto 200px doleva */}
          <div className="fixed transform -translate-x-1/2 w-80 h-60" style={{ left: 'calc(50% - 200px)', bottom: 'calc(-30px - 60px + 3px)' }}>
            {/* Peněženka spodní část - tmavá horní s přezkou */}
            <div 
              className="absolute"
              style={{
                bottom: '-27px',
                left: 'calc(50% - 7px)', // Posunuto 7px vlevo pro lepší zarovnání
                transform: 'translateX(-50%) rotate(-12deg)',
                width: 'clamp(200px, 50vw, 300px)',
                height: 'clamp(120px, 25vw, 180px)',
                zIndex: 10
              }}
            >
              <div
                className="absolute top-0 left-[5px] right-0 rounded-t-xl" // Tmavá část posunuta 5px doprava
                style={{
                  height: 'clamp(30px, 6vw, 50px)',
                  backgroundColor: '#4A2E1C',
                  borderRadius: '16px 16px 4px 4px'
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  width: 'clamp(18px, 3vw, 24px)',
                  height: 'clamp(18px, 3vw, 24px)',
                  backgroundColor: '#F6C34D',
                  top: 'clamp(15px, 3vw, 25px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.25)'
                }}
              />
            </div>
            
            {/* Peněženka horní část - světlé tělo nad mincemi */}
            <div 
              className="absolute rounded-xl flex items-center justify-center"
              style={{
                bottom: '-60px',
                left: 'calc(50% + 2px)', // Hnědá část posunuta 2px doprava
                transform: 'translateX(-50%) rotate(-12deg)',
                width: 'clamp(200px, 50vw, 300px)',
                height: 'clamp(120px, 25vw, 180px)',
                backgroundColor: '#ba684a',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                zIndex: 40
              }}
            />

            {/* Mince rozmístěné kolem peněženky */}
            <div className="absolute inset-0 pointer-events-none">
              {availableCoins.map((coin, index) => {
                // Od 4. mince, přejdi na druhý řád
                const row = index < 4 ? 0 : 1;
                const colIndex = index < 4 ? index : index - 4;
                const coinsInRow = index < 4 ? 4 : availableCoins.length - 4;
                
                return (
                  <div
                    key={coin.id}
                    className="absolute pointer-events-auto"
                    style={{
                      left: `${-20 + (colIndex % coinsInRow) * 18 + Math.sin(index * 1.3 + coin.value) * 15 + Math.cos(index * 0.7) * 8}%`, // Více do leva a více náhodné
                      top: `${-15 + row * 35 + Math.cos(index * 1.1 + coin.value) * 18 + Math.sin(index * 0.9) * 10}%`, // Více náhodné rozmístění
                      transform: `rotate(${-45 + (index * 23 + coin.value * 7) % 90}deg)`, // Více náhodné otočení
                      zIndex: 30,
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <Coin
                      coin={coin}
                      onMove={moveCoinToPayment}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:block">
          {/* Nadpis - pozice vlevo, posunut o 20px dolů */}
          <div className="fixed left-6 z-50" style={{ top: 'calc(24px + 20px)' }}>
            <h1 
              className="text-black visby-font"
              style={{ 
                fontSize: 'clamp(48px, 5vw, 72px)',
                fontWeight: 'bold'
              }}
            >
              {currentRound.mode === GameMode.EXCHANGE ? 'Rozměň' : 'Zaplať'}
            </h1>
          </div>

          {/* Předměty/Exchange mince - pozice nad platební oblastí, centrovaně */}
          <div className="flex justify-center mt-4 mb-4 z-40">
            {currentRound.mode === GameMode.EXCHANGE ? (
              // Rozměňovací mód - zobraz velkou minci k rozměnění
              <>
                <div style={{ 
                  width: 'clamp(182px, 15vw, 273px)',
                  height: 'clamp(182px, 15vw, 273px)'
                }}>
                  <img 
                    src={`https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/kc/${currentRound.exchangeCoin}kc.svg`}
                    alt={`${currentRound.exchangeCoin} Kč`}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.2))'
                    }}
                  />
                </div>
              </>
            ) : currentRound.items.length === 1 && currentRound.items[0] ? (
              // Layout pro jeden předmět
              <>
                <div className="flex items-center gap-6">
                  {/* Cenový štítek vlevo */}
                  <div 
                    className="flex items-center justify-center rounded-3xl relative visby-font"
                    style={{
                      width: 'clamp(140px, 12vw, 180px)',
                      height: 'clamp(80px, 8vw, 120px)',
                      backgroundColor: currentRound.items[0].tagColor,
                      transform: 'rotate(-6deg)'
                    }}
                  >
                    <div className="absolute bg-white rounded-full" style={{
                      width: 'clamp(10px, 0.8vw, 14px)',
                      height: 'clamp(10px, 0.8vw, 14px)',
                      right: '10px', top: '10px'
                    }} />
                    <span className="visby-font" style={{ 
                      fontSize: 'clamp(24px, 3vw, 48px)', 
                      fontWeight: 'bold',
                      color: '#2d1810', 
                      letterSpacing: '1px',
                      textShadow: '2px 2px 4px rgba(255,255,255,0.8), -1px -1px 2px rgba(255,255,255,0.6)',
                      WebkitTextStroke: '1px rgba(255,255,255,0.3)'
                    }}>
                      {currentRound.items[0].price} Kč
                    </span>
                  </div>
                  
                  {/* Obrázek předmětu vpravo */}
                  <div style={{ 
                    width: 'clamp(195px, 16vw, 312px)',
                    height: 'clamp(195px, 16vw, 312px)'
                  }}>
                    <img 
                      src={currentRound.items[0].imageUrl} 
                      alt={currentRound.items[0].name}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                </div>
              </>
            ) : currentRound.items.length === 2 && currentRound.items[0] && currentRound.items[1] ? (
              // Layout pro dva předměty
              <>
                <div className="flex items-center gap-8">
                  {/* Cenové štítky vlevo */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-center rounded-3xl relative visby-font"
                      style={{
                        width: 'clamp(120px, 10vw, 150px)', height: 'clamp(70px, 6vw, 90px)',
                        backgroundColor: currentRound.items[0].tagColor, transform: 'rotate(-6deg)'
                      }}>
                      <div className="absolute bg-white rounded-full" style={{
                        width: 'clamp(8px, 0.6vw, 10px)', height: 'clamp(8px, 0.6vw, 10px)',
                        right: '8px', top: '8px'
                      }} />
                      <span className="visby-font" style={{ 
                        fontSize: 'clamp(18px, 2.5vw, 36px)', 
                        fontWeight: 'bold',
                        color: '#2d1810',
                        textShadow: '2px 2px 4px rgba(255,255,255,0.8)'
                      }}>
                        {currentRound.items[0].price} Kč
                      </span>
                    </div>
                    <div className="flex items-center justify-center rounded-3xl relative visby-font"
                      style={{
                        width: 'clamp(120px, 10vw, 150px)', height: 'clamp(70px, 6vw, 90px)',
                        backgroundColor: currentRound.items[1].tagColor, transform: 'rotate(6deg)'
                      }}>
                      <div className="absolute bg-white rounded-full" style={{
                        width: 'clamp(8px, 0.6vw, 10px)', height: 'clamp(8px, 0.6vw, 10px)',
                        right: '8px', top: '8px'
                      }} />
                      <span className="visby-font" style={{ 
                        fontSize: 'clamp(18px, 2.5vw, 36px)', 
                        fontWeight: 'bold',
                        color: '#2d1810',
                        textShadow: '2px 2px 4px rgba(255,255,255,0.8)'
                      }}>
                        {currentRound.items[1].price} Kč
                      </span>
                    </div>
                  </div>
                  
                  {/* Předměty vpravo */}
                  <div className="flex flex-row gap-6">
                    <div style={{ 
                      width: 'clamp(150px, 12vw, 240px)',
                      height: 'clamp(150px, 12vw, 240px)'
                    }}>
                      <img 
                        src={currentRound.items[0].imageUrl} 
                        alt={currentRound.items[0].name}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                    <div style={{ 
                      width: 'clamp(150px, 12vw, 240px)',
                      height: 'clamp(150px, 12vw, 240px)'
                    }}>
                      <img 
                        src={currentRound.items[1].imageUrl} 
                        alt={currentRound.items[1].name}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* Platební oblast - FIXED na střed obrazovky */}
          <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
            <PaymentArea onDrop={moveCoinToPayment}>
              {paidCoins.length === 0 ? (
                <div className="text-gray-400 text-center visby-font">
                  <div style={{ fontSize: 'clamp(18px, 2vw, 24px)' }}>Přetáhni</div>
                  <div style={{ fontSize: 'clamp(18px, 2vw, 24px)' }}>mince zde</div>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  {/* Mince pozicované v platební oblasti */}
                  {paidCoins.map((coin, index) => {
                    const baseX = 50; // Střední pozice
                    const baseY = 40; // Posunuto nahoru pro tlačítka
                    const offsetX = (index - (paidCoins.length - 1) / 2) * 12.5;
                    const offsetY = Math.sin(index * 0.5) * 8;
                    
                    return (
                      <div
                        key={`paid-${coin.id}-${index}`}
                        className="absolute"
                        style={{
                          left: `calc(${baseX + offsetX}% - 64px)`,
                          top: `calc(${baseY + offsetY}% - 64px)`,
                          zIndex: index + 1
                        }}
                      >
                        <Coin 
                          coin={coin} 
                          onMove={moveCoinBack}
                          size="small"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Akční tlačítko uvnitř platební oblasti */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={checkPayment}
                  className="px-4 py-2 rounded-full text-white transition-transform hover:scale-105 active:scale-95 visby-font"
                  style={{
                    backgroundColor: '#10b981',
                    fontSize: 'clamp(13px, 1.8vw, 18px)', // Větší tlačítko pro desktop
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  ZKONTROLOVAT
                </button>
              </div>
            </PaymentArea>
          </div>

          {/* Peněženka a mince - pozice dole uprostřed, posunuto o 60px dolů, pak o 3px výš, posunuto 200px doleva */}
          <div className="fixed transform -translate-x-1/2 w-96 h-64" style={{ left: 'calc(50% - 200px)', bottom: 'calc(-40px - 60px + 3px)' }}>
            {/* Peněženka spodní část - tmavá horní s přezkou */}
            <div 
              className="absolute"
              style={{
                bottom: '-27px',
                left: 'calc(50% - 7px)', // Posunuto 7px vlevo pro lepší zarovnání
                transform: 'translateX(-50%) rotate(-8deg)',
                width: 'clamp(280px, 25vw, 370px)',
                height: 'clamp(160px, 15vw, 220px)',
                zIndex: 10
              }}
            >
              <div
                className="absolute top-0 left-[5px] right-0 rounded-t-xl" // Tmavá část posunuta 5px doprava
                style={{
                  height: 'clamp(40px, 4vw, 60px)',
                  backgroundColor: '#4A2E1C',
                  borderRadius: '16px 16px 4px 4px'
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  width: 'clamp(20px, 2vw, 28px)',
                  height: 'clamp(20px, 2vw, 28px)',
                  backgroundColor: '#F6C34D',
                  top: 'clamp(20px, 2vw, 30px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.25)'
                }}
              />
            </div>
            
            {/* Peněženka horní část - světlé tělo nad mincemi */}
            <div 
              className="absolute rounded-xl flex items-center justify-center"
              style={{
                bottom: '-60px',
                left: 'calc(50% + 2px)', // Hnědá část posunuta 2px doprava
                transform: 'translateX(-50%) rotate(-8deg)',
                width: 'clamp(280px, 25vw, 370px)',
                height: 'clamp(160px, 15vw, 220px)',
                backgroundColor: '#ba684a',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                zIndex: 40
              }}
            />

            {/* Mince pozicované kolem peněženky */}
            <div className="absolute inset-0 w-full h-full">
              {availableCoins.map((coin, index) => {
                // Od 4. mince, přejdi na druhý řád  
                const row = index < 4 ? 0 : 1;
                const colIndex = index < 4 ? index : index - 4;
                const coinsInRow = index < 4 ? 4 : availableCoins.length - 4;
                
                return (
                  <div
                    key={coin.id}
                    className="absolute"
                    style={{
                      left: `${-25 + (colIndex % coinsInRow) * 20 + Math.sin(index * 1.5 + coin.value) * 20 + Math.cos(index * 0.6) * 12}%`, // Více do leva a více náhodné pro desktop
                      top: `${-25 + row * 35 + Math.cos(index * 1.2 + coin.value) * 22 + Math.sin(index * 0.8) * 15}%`, // Více náhodné rozmístění
                      transform: `rotate(${-50 + (index * 27 + coin.value * 11) % 100}deg)`, // Více náhodné otočení
                      zIndex: 30,
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    <Coin
                      coin={coin}
                      onMove={moveCoinToPayment}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Popup s hláškami - FUNGUJÍCÍ SYSTÉM */}
        <GamePopup popup={popup} onClose={handlePopupClose} />

        {/* Velká oslava po 10 správných odpovědích / 10 rozměněních */}
        {showCelebration && (
          <GameResultScreen
            isCorrect={true}
            onContinue={handleCelebrationContinue}
            gameTitle={exchangeRounds >= 10 ? 'Rozměň' : (currentRound.mode === GameMode.EXCHANGE ? 'Rozměň' : 'Zaplať')}
            currentScore={exchangeRounds >= 10 ? exchangeCorrect : score}
            totalAttempts={exchangeRounds >= 10 ? exchangeAttempts : attempts}
            showCelebration={true}
          />
        )}
      </div>
    </DndProvider>
  );
}

// Export default pro kompatibilitu
export default function App() {
  return <MoneyExchangeGame />;
}