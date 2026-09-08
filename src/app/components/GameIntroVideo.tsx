import { useState, useEffect } from 'react';

export interface GameIntroVideoProps {
  onVideoEnd: () => void;
}

export function GameIntroVideo({ onVideoEnd }: GameIntroVideoProps) {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  
  const messages = [
    "Připrav se!",
    "Jedeme!"
  ];

  useEffect(() => {
    // Spustíme video okamžitě
    setShowVideo(true);
    
    // Zobrazíme první hlášku
    const timer1 = setTimeout(() => {
      setCurrentMessage(1);
    }, 1500);

    return () => {
      clearTimeout(timer1);
    };
  }, []);

  const handleVideoEnd = () => {
    onVideoEnd();
  };

  const handleVideoError = () => {
    // Pokud se video nepodaří načíst, pokračujeme v hře
    onVideoEnd();
  };

  return (
    <div 
      className="h-screen w-full flex items-center justify-center font-visby"
      style={{ backgroundColor: '#FCF4E9' }}
    >
      {/* Responzivní layout - na mobilu video nahoře/text dole, na desktopu video vlevo/text vpravo */}
      <div className="flex flex-col lg:flex-row items-center justify-center h-full w-full max-w-6xl mx-auto px-4 gap-8">
        {/* Video kontejner - první na mobilu, vlevo na desktopu */}
        {showVideo && (
          <div className="flex items-center justify-center flex-1 w-full lg:w-auto" style={{ height: 'min(60vh, 85vh)' }}>
            <video
              autoPlay
              muted
              onEnded={handleVideoEnd}
              onError={handleVideoError}
              className="max-h-full max-w-full object-contain"
            >
            <source src="https://jjpiguuubvmiobmixwgh.supabase.co/storage/v1/object/public/Admin%20math/video_postavicky.mp4" type="video/mp4" />
            {/* Fallback pro prohlížeče, které nepodporují video */}
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="text-6xl mb-4">🎮</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Připrav se na hru!
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                Za chvíli začneme sbírat balíčky!
              </p>
              <button
                onClick={handleVideoEnd}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Začít hru
              </button>
            </div>
          </video>
          </div>
        )}

        {/* Hlášky pod videem na mobilu, vpravo na desktopu */}
        <div className="flex items-center justify-center flex-1 w-full lg:w-auto">
          <div 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center animate-bounce"
            style={{ 
              color: '#1E40AF'
            }}
          >
            {messages[currentMessage]}
          </div>
        </div>
        
        {/* Tlačítko pro přeskočení (vždy viditelné) */}
        <button
          onClick={handleVideoEnd}
          className="fixed bottom-6 right-6 text-sm text-gray-500 hover:text-gray-700 underline transition-colors bg-white px-3 py-2 rounded-lg shadow-md"
        >
          Přeskočit →
        </button>
      </div>
    </div>
  );
}