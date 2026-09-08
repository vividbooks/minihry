// Zvukový systém pro matematické hry
// Obsahuje definice pro zvukové efekty používající Web Audio API
// Zvuky jsou inspirovány hrou "Větší menší" (QuantityComparisonGame)

export type SoundType = 'correct' | 'incorrect' | 'gameComplete' | 'click' | 'gameStart' | 'countdown' | 'collectPoint';

// Konfigurace frekvencí a parametrů pro jednotlivé zvuky
export const SOUND_CONFIG = {
  correct: {
    frequency: 523.25, // C5 nota - radostný tón
    duration: 0.3,
    volume: 0.3,
    type: 'sine' as OscillatorType,
    harmonics: true // přidá harmonický akord
  },
  
  incorrect: {
    frequency: 220, // A3 nota - nižší tón
    duration: 0.5,
    volume: 0.2,
    type: 'triangle' as OscillatorType,
    harmonics: false
  },
  
  gameComplete: {
    frequency: 659.25, // E5 - oslavný tón
    duration: 0.8,
    volume: 0.4,
    type: 'sine' as OscillatorType,
    harmonics: true
  },
  
  click: {
    frequency: 880, // A5 - vysoký klik
    duration: 0.1,
    volume: 0.1,
    type: 'sine' as OscillatorType,
    harmonics: false
  },
  
  gameStart: {
    frequency: 440, // A4 - základní tón
    duration: 0.4,
    volume: 0.2,
    type: 'sine' as OscillatorType,
    harmonics: false
  },
  
  countdown: {
    frequency: 349.23, // F4 - neutrální tón
    duration: 0.2,
    volume: 0.15,
    type: 'sine' as OscillatorType,
    harmonics: false
  },
  
  collectPoint: {
    frequency: 783.99, // G5 - vysoký příjemný tón
    duration: 0.4,
    volume: 0.25,
    type: 'sine' as OscillatorType,
    harmonics: true // přidá harmonický efekt pro příjemnější zvuk
  }
} as const;