import React, { useState, Suspense } from 'react';
import { GAME_REGISTRY, GameType, GameConfig } from '../constants/gameRegistry';
import { Button } from './ui/button';
import { Settings, Play } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import Container5 from '../imports/Container-9188-1388';

interface AdminPanelProps {
  onConfigureGame: (gameId: GameType) => void;
}

// Lazy loaded image component to prevent blocking - optimized
const LazyGameImage = React.memo(({ src, alt, className }: { src: string | null, alt: string, className: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!src) return null;

  return (
    <div className={`${className} relative`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-t-3xl flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        loading="lazy"
        decoding="async"
      />
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 rounded-t-3xl flex items-center justify-center">
          <span className="text-gray-400 text-sm">Obrázek se nepodařilo načíst</span>
        </div>
      )}
    </div>
  );
});

LazyGameImage.displayName = 'LazyGameImage';

export const AdminPanel = React.memo(({ onConfigureGame }: AdminPanelProps) => {
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const handlePlayGame = (gameId: GameType) => {
    setSelectedGame(gameId);
    onConfigureGame(gameId);
  };

  // Všechny hry v jednom seznamu bez kategorií s PNG náhledy
  const gameGroups = [
    {
      title: "Poznávám čísla",
      games: [
        { 
          id: 'numberRecognition', 
          name: 'Poznej čísla', 
          description: 'děti poznávají první čísla pomocí čárek, teček a rytmu.', 
          bg: '#ceeffd', 
          image: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/nahledy/poznej_cisla.png'
        },
        { 
          id: 'numberComparison', 
          name: 'Rozřaď čísla', 
          description: 'porovnáváme, co je větší a co menší.', 
          bg: '#fcfbdc', 
          image: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/nahledy/rozrad_cisla%20(1).png'
        },
        { 
          id: 'quantityComparison', 
          name: 'Čeho je víc?', 
          description: 'určujeme, čeho je více nebo méně.', 
          bg: '#fff999', 
          image: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/nahledy/ceho_je_vice.png'
        },
        { 
          id: 'boardGame', 
          name: 'Člověče nezlob se', 
          description: 'trénujeme číselnou řadu házením kostkou a pohybem figurky.', 
          bg: '#B6FFE7', 
          image: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/nahledy/clovece.png',
          emoji: '🎲'
        },
        { 
          id: 'mrBall', 
          name: 'Pan Kulička', 
          description: 'Počítání políček. Žáci počítají kroky, mohou chodit v jednom kole tam i zpátky.', 
          bg: '#FFE5B4', 
          image: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/nahledy/pan_kulicka.png',
          emoji: '⚽'
        }
      ]
    },
    {
      title: "Řady a vzory",
      games: [
        { 
          id: 'patternSequence', 
          name: 'Doplň vzor', 
          description: 'doplňujeme chybějící prvek podle pravidla.', 
          bg: '#f9edc9', 
          image: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/nahledy/dopln_vzor.png'
        },
        { 
          id: 'numberSequence', 
          name: 'Číselné řady', 
          description: 'doplňujeme chybějící čísla do posloupnosti.', 
          bg: '#fcfbdc', 
          image: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/nahledy/ciselne_rady.png'
        }
      ]
    },
    {
      title: "Prostorová orientace",
      games: [
        { 
          id: 'tilingGame', 
          name: 'Pokládání dlaždic', 
          description: 'skládáme dlaždice a počítáme, kolik jsme jich použili.', 
          bg: '#f9edc4', 
          image: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/nahledy/Pokladani_dlazdic.png'
        },
        { 
          id: 'mirrorDrawing', 
          name: 'Kreslení do mřížky', 
          description: 'tvoříme zrcadlový vzor podle zadání.', 
          bg: '#fcdca0', 
          image: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/nahledy/kresleni_do_mrizky.png'
        },
        { 
          id: 'robotNavigation', 
          name: 'Naveď robota', 
          description: 'programujeme robota, aby našel cestu k cíli.', 
          bg: '#d1cfff', 
          image: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/nahledy/naved_robota.png'
        }
      ]
    },
    {
      title: "Počítám a procvičuji",
      games: [
        { 
          id: 'dominoGame', 
          name: 'Domino', 
          description: 'sčítáme tečky na stranách domina.', 
          bg: '#e6e6e6', 
          image: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/nahledy/domino.png'
        },
        { 
          id: 'mathPractice', 
          name: 'Kartičky', 
          description: 'rozhodujeme, zda je příklad správný, nebo ne.', 
          bg: '#D0DBFF', 
          image: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/nahledy/karticky.png'
        },
        { 
          id: 'mathSnake', 
          name: 'Matematický had', 
          description: 'skládáme příklady, které vedou k cílovému číslu.', 
          bg: '#e0f2e6', 
          image: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/nahledy/had.png'
        },
        { 
          id: 'mathCrossword', 
          name: 'Matematická křížovka', 
          description: 'hledáme dvojice čísel se správným součtem.', 
          bg: '#e6f3ff', 
          image: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/nahledy/matematicka_krizovka.png',
          emoji: '🧩'
        },
        { 
          id: 'moneyExchange', 
          name: 'Zaplať a Rozměň', 
          description: 'platíme nebo rozměňujeme správné mince a bankovky.', 
          bg: '#FFD3C5', 
          image: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/nahledy/zaplat.png',
          emoji: '💰'
        },
        { 
          id: 'countingGame', 
          name: 'Zjisti', 
          description: 'řešíme první slovní úlohy s kuličkami a pytlíčkem.', 
          bg: '#FFF8CD', 
          image: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/nahledy/zjisti%20(1).png',
          emoji: '🔢'
        },
        { 
          id: 'imageReveal', 
          name: 'Odkryj obrázek', 
          description: 'Třída společně odhaluje skrytý obrázek. Děti se mohou u tabule střídat.', 
          bg: '#FFB9A2', 
          image: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/nahledy/obrazek.png',
          emoji: '🖼️'
        },
        { 
          id: 'buildNumber', 
          name: 'Slož číslo', 
          description: 'Skládáme čísla z kostiček', 
          bg: '#F5E6D0', 
          image: 'https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/Group%2021337.png',
          emoji: '🧱'
        }
      ]
    }
  ];

  // Filtrování kategorií podle vybrané kategorie
  const filteredGroups = selectedCategory 
    ? gameGroups.filter(group => group.title === selectedCategory)
    : gameGroups;

  // Seznam všech kategorií pro navigaci
  const categories = gameGroups.map(group => group.title);

  return (
    <div className="min-h-screen bg-white font-visby">
      {/* Header Section with Blue Background - zmenšeno o 30% */}
      <div className="relative bg-[#dee4f1] rounded-[32px] mx-[30px] max-w-[1320px] xl:mx-auto mt-[28px] mb-8 overflow-hidden h-[395px]">
        
        <div className="relative z-10 px-6 md:px-12 py-0 md:py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            <div className="flex-1">
              {/* VIVID BOOKS Logo s SVG */}
              <div className="mb-2">
                <img 
                  src="https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/nahledy/logo.svg"
                  alt="Vividbooks Logo"
                  className="h-18 w-18"
                />
              </div>
              
              {/* Main Title */}
              <h2 className="text-3xl md:text-5xl font-bold text-[#09056f] mb-4 md:mb-6 leading-tight">
                Matematické<br />Minihry
              </h2>
              
              {/* Description */}
              <div className="text-[#09056f] text-base md:text-lg leading-relaxed max-w-md">
                <p className="mb-4">
                  Minihry jsou součástí našich pracovních učebnic Vividbooks, ale pro veřejnost je nabízíme zcela zdarma.
                </p>
                <p>
                  👉 Pokud chcete pracovat s <a href="https://www.vividbooks.com/cs/matematika-1-stupen" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-blue-600 transition-colors">ucelenou metodikou</a> pro výuku matematiky, 
                  <a href="https://www.vividbooks.com/cs/free-trial-cz" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-blue-600 transition-colors"> vyzkoušejte Vividbooks</a> nebo 
                  <a href="https://eshop.vividbooks.com/" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-blue-600 transition-colors"> si objednejte pracovní učebnice</a>.
                </p>
              </div>
            </div>
            
            {/* Right side - Notebooks image and buttons */}
            <div className="flex flex-col items-center gap-4 w-full lg:w-auto">
              {/* Header Buttons */}
              <div className="flex flex-row gap-3 w-full lg:w-auto mb-4">
                <button className="px-4 md:px-6 py-2 md:py-3 border-2 border-[#4e5871] text-[#4e5871] rounded-lg hover:bg-[#4e5871] hover:text-white transition-colors text-xs md:text-sm">
                  Matematika: 1. ročník
                </button>
                <a 
                  href="https://app.vividbooks.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 md:px-6 py-2 md:py-3 bg-[#4e5871] text-white rounded-lg hover:bg-[#3d4660] transition-colors flex items-center justify-center gap-2 text-xs md:text-sm no-underline"
                >
                  Otevřít vividbooks učebnice
                  <span className="rotate-180">↑</span>
                </a>
              </div>
              
              {/* Notebooks Image */}
              <div className="mb-4">
                <img 
                  src="https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/Container.png"
                  alt="Vividbooks sešity"
                  className="h-80 md:h-96 w-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="max-w-full px-4 md:px-8 mb-8">
        <div className="flex flex-wrap justify-center gap-3">
          {/* Tlačítko pro zobrazení všech kategorií */}
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
              selectedCategory === null
                ? 'bg-[#4a43e8] text-white shadow-lg'
                : 'bg-white text-[#4e5871] border-2 border-[#4e5871] hover:bg-[#4e5871] hover:text-white'
            }`}
          >
            Všechny hry
          </button>
          
          {/* Tlačítka pro jednotlivé kategorie */}
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-[#4a43e8] text-white shadow-lg'
                  : 'bg-white text-[#4e5871] border-2 border-[#4e5871] hover:bg-[#4e5871] hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Games Section - All games organized by categories */}
      <div className="max-w-full px-4 md:px-8">
        {filteredGroups.map((group, groupIndex) => (
          <div key={group.title} className="mb-16 md:mb-20">
            <h3 className="text-2xl md:text-4xl font-bold text-[#4e5871] mb-8 md:mb-12 text-center px-2">
              {group.title}
            </h3>
            
            {/* Fixed width cards with auto-fit grid */}
            <div className="grid justify-center" style={{
              gridTemplateColumns: 'repeat(auto-fit, 350px)',
              gap: '2rem',
              justifyContent: 'center'
            }}>
              {group.games.map((game) => {
                const gameConfig = GAME_REGISTRY[game.id as GameType];
                if (!gameConfig) return null;

                return (
                  <div 
                    key={game.id} 
                    className={`relative rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2 ${
                      selectedGame === game.id ? 'ring-4 ring-blue-400 shadow-2xl' : ''
                    }`}
                    style={{ 
                      backgroundColor: game.bg, 
                      width: '350px',
                      height: '410px'
                    }}
                  >
                    {/* Game Image Area - podle Figma designu */}
                    <div className="h-[215px] rounded-t-3xl overflow-hidden bg-white">
                      {game.image ? (
                        <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-6xl rounded-t-3xl">Loading...</div>}>
                          <LazyGameImage
                            src={game.image}
                            alt={game.name}
                            className="w-full h-full object-cover rounded-t-3xl"
                          />
                        </Suspense>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl rounded-t-3xl">
                          {game.emoji}
                        </div>
                      )}
                    </div>

                    {/* Content area s absolutním pozicováním pro tlačítka */}
                    <div className="relative h-[155px] p-4 md:p-6">
                      {/* Game Title */}
                      <h4 className="text-xl md:text-2xl font-bold text-[#4e5871] mb-2 md:mb-3 leading-tight">
                        {game.id === 'moneyExchange' ? 'Zaplať a rozměň' : game.name}
                      </h4>

                      {/* Game Description */}
                      <p className="text-[#4e5871] text-base leading-relaxed mb-4 opacity-80">
                        {game.description}
                      </p>

                      {/* Buttons - posunuty o 20px dolů */}
                      <div className="absolute -bottom-4 left-4 right-4">
                        <button
                          onClick={() => handlePlayGame(game.id as GameType)}
                          className="w-1/2 bg-[#4a43e8] hover:bg-[#3d36d6] text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          Hraj
                        </button>
                      </div>
                    </div>
                    
                    {/* Selection Effect */}
                    {selectedGame === game.id && (
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-10 pointer-events-none rounded-3xl" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer s logem - 200px bílý prostor */}
      <div className="bg-white py-[100px] flex justify-center items-center">
        <img 
          src="https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/nahledy/logo.svg"
          alt="Vividbooks Logo"
          className="h-16 w-16 opacity-60"
        />
      </div>
    </div>
  );
});

AdminPanel.displayName = 'AdminPanel';