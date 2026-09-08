import React, { createContext, useContext, useRef, useCallback, useEffect } from 'react';

export type SoundType = 'correct' | 'incorrect' | 'gameComplete' | 'click' | 'gameStart' | 'countdown' | 'collectPoint';

interface AudioContextType {
  playSound: (soundType: SoundType) => void;
  setMuted: (muted: boolean) => void;
  isMuted: boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export { AudioContext };

interface AudioManagerProps {
  children: React.ReactNode;
  initialMuted?: boolean;
}

export function AudioManager({ children, initialMuted = false }: AudioManagerProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isMutedRef = useRef(initialMuted);

  // Inicializace audio contextu
  useEffect(() => {
    const initAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };

    // Inicializace při prvním kliknutí uživatele
    const handleFirstInteraction = () => {
      initAudioContext();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  // Funkce pro generování zvukových tónů (stejná jako v QuantityComparisonGame)
  const playTone = useCallback((frequency: number, duration: number, type: 'success' | 'error' | 'complete' | 'click' | 'start' | 'countdown') => {
    if (!audioContextRef.current || isMutedRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    if (type === 'success') {
      // Úspěšný zvuk - příjemný harmonický akord (stejný jako v QuantityComparisonGame)
      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
      oscillator.frequency.setValueAtTime(frequency * 1.25, audioContextRef.current.currentTime + 0.1);
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
    } else if (type === 'error') {
      // Chybný zvuk - nižší tón (stejný jako v QuantityComparisonGame)
      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
      oscillator.type = 'triangle';
      gainNode.gain.setValueAtTime(0.2, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
    } else if (type === 'complete') {
      // Oslavný zvuk - vyšší radostný tón
      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
      oscillator.frequency.setValueAtTime(frequency * 1.5, audioContextRef.current.currentTime + 0.2);
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.4, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
    } else {
      // Ostatní zvuky
      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
    }

    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  }, []);

  const playSound = useCallback((soundType: SoundType) => {
    if (isMutedRef.current) return;

    try {
      switch (soundType) {
        case 'correct':
          playTone(523.25, 0.3, 'success'); // C5 nota (stejná jako v QuantityComparisonGame)
          break;
        case 'incorrect':
          playTone(220, 0.5, 'error'); // A3 nota (stejná jako v QuantityComparisonGame)
          break;
        case 'gameComplete':
          playTone(659.25, 0.8, 'complete'); // E5 - oslavný tón
          break;
        case 'click':
          playTone(880, 0.1, 'click'); // A5 - rychlý klik
          break;
        case 'gameStart':
          playTone(440, 0.4, 'start'); // A4 - start tón
          break;
        case 'countdown':
          playTone(349.23, 0.2, 'countdown'); // F4 - countdown tón
          break;
        case 'collectPoint':
          playTone(783.99, 0.4, 'success'); // G5 - vysoký příjemný tón pro sběr kostičky
          break;
        default:
          console.warn('Neznámý typ zvuku:', soundType);
      }
    } catch (error) {
      console.warn('Chyba při přehrávání zvuku:', soundType, error);
    }
  }, [playTone]);

  const setMuted = useCallback((muted: boolean) => {
    isMutedRef.current = muted;
    
    // Uložení do localStorage pro persistenci
    try {
      localStorage.setItem('gameAudioMuted', muted.toString());
    } catch (error) {
      console.warn('Nepodařilo se uložit nastavení zvuku');
    }
  }, []);

  // Načtení nastavení z localStorage
  useEffect(() => {
    try {
      const savedMuted = localStorage.getItem('gameAudioMuted');
      if (savedMuted !== null) {
        isMutedRef.current = savedMuted === 'true';
      }
    } catch (error) {
      console.warn('Nepodařilo se načíst nastavení zvuku');
    }
  }, []);

  const contextValue: AudioContextType = {
    playSound,
    setMuted,
    isMuted: isMutedRef.current
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
}

// Hook pro použití audio manageru
export function useAudio(): AudioContextType {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio musí být použit uvnitř AudioManager');
  }
  return context;
}

// Komponenta pro audio controls
interface AudioControlsProps {
  className?: string;
}

export function AudioControls({ className = '' }: AudioControlsProps) {
  const { isMuted, setMuted, playSound } = useAudio();

  const handleToggleMute = () => {
    setMuted(!isMuted);
    if (!isMuted) {
      // Pokud zapínáme zvuk, přehrajeme test zvuk
      setTimeout(() => playSound('click'), 100);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleToggleMute}
        className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
        title={isMuted ? 'Zapnout zvuk' : 'Vypnout zvuk'}
      >
        {isMuted ? (
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.776L4.5 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.5l3.883-3.776zM7 9.236L4.236 11H3v2h1.236L7 14.764V9.236zM15.293 7.293a1 1 0 011.414 0L18 8.586l1.293-1.293a1 1 0 111.414 1.414L19.414 10l1.293 1.293a1 1 0 01-1.414 1.414L18 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L16.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.776L4.5 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.5l3.883-3.776zm7.824 1.632A1 1 0 0118 6v8a1 1 0 01-1.707.707 7.965 7.965 0 01-1.414-1.414A5.972 5.972 0 0116 10a5.972 5.972 0 01-1.121-3.293 7.965 7.965 0 011.414-1.414 1 1 0 011.914.415zM15 10a3.982 3.982 0 01-.879-2.474A1 1 0 0115 6v8a1 1 0 01-.879-1.526A3.982 3.982 0 0115 10z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    </div>
  );
}