import React from 'react';

// SVG komponenty pro české mince podle specifikace
// Všechny mince jsou navrženy tak, aby odpovídaly reálným českým mincím

export interface CoinSVGProps {
  size?: number;
  className?: string;
}

// 1 Kč mince - nejmenší, měděná barva
export function Coin1Kc({ size = 100, className = '' }: CoinSVGProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="copper1" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#FFB366" />
          <stop offset="50%" stopColor="#CD7F32" />
          <stop offset="100%" stopColor="#8B4513" />
        </radialGradient>
        <filter id="shadow1" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.3"/>
        </filter>
      </defs>
      
      {/* Vnější kruh */}
      <circle 
        cx="50" 
        cy="50" 
        r="48" 
        fill="url(#copper1)" 
        stroke="#B8860B" 
        strokeWidth="2"
        filter="url(#shadow1)"
      />
      
      {/* Vnitřní ozdobný kruh */}
      <circle 
        cx="50" 
        cy="50" 
        r="42" 
        fill="none" 
        stroke="#FFD700" 
        strokeWidth="1"
        opacity="0.7"
      />
      
      {/* Střední hodnota */}
      <text 
        x="50" 
        y="46" 
        textAnchor="middle" 
        fontSize="20" 
        fontWeight="bold" 
        fill="#FFFFFF"
        style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
      >
        1
      </text>
      
      {/* Text "Kč" */}
      <text 
        x="50" 
        y="62" 
        textAnchor="middle" 
        fontSize="12" 
        fontWeight="bold" 
        fill="#FFFFFF"
        style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
      >
        Kč
      </text>
    </svg>
  );
}

// 2 Kč mince - měděná, mírně větší
export function Coin2Kc({ size = 100, className = '' }: CoinSVGProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="copper2" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#FFB366" />
          <stop offset="50%" stopColor="#CD7F32" />
          <stop offset="100%" stopColor="#8B4513" />
        </radialGradient>
        <filter id="shadow2" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.3"/>
        </filter>
      </defs>
      
      <circle 
        cx="50" 
        cy="50" 
        r="48" 
        fill="url(#copper2)" 
        stroke="#B8860B" 
        strokeWidth="2"
        filter="url(#shadow2)"
      />
      
      <circle 
        cx="50" 
        cy="50" 
        r="42" 
        fill="none" 
        stroke="#FFD700" 
        strokeWidth="1"
        opacity="0.7"
      />
      
      <text 
        x="50" 
        y="46" 
        textAnchor="middle" 
        fontSize="20" 
        fontWeight="bold" 
        fill="#FFFFFF"
        style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
      >
        2
      </text>
      
      <text 
        x="50" 
        y="62" 
        textAnchor="middle" 
        fontSize="12" 
        fontWeight="bold" 
        fill="#FFFFFF"
        style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
      >
        Kč
      </text>
    </svg>
  );
}

// 5 Kč mince - měděná, větší
export function Coin5Kc({ size = 100, className = '' }: CoinSVGProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="copper5" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#FFB366" />
          <stop offset="50%" stopColor="#CD7F32" />
          <stop offset="100%" stopColor="#8B4513" />
        </radialGradient>
        <filter id="shadow5" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.3"/>
        </filter>
      </defs>
      
      <circle 
        cx="50" 
        cy="50" 
        r="48" 
        fill="url(#copper5)" 
        stroke="#B8860B" 
        strokeWidth="2"
        filter="url(#shadow5)"
      />
      
      <circle 
        cx="50" 
        cy="50" 
        r="42" 
        fill="none" 
        stroke="#FFD700" 
        strokeWidth="1"
        opacity="0.7"
      />
      
      <text 
        x="50" 
        y="46" 
        textAnchor="middle" 
        fontSize="20" 
        fontWeight="bold" 
        fill="#FFFFFF"
        style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
      >
        5
      </text>
      
      <text 
        x="50" 
        y="62" 
        textAnchor="middle" 
        fontSize="12" 
        fontWeight="bold" 
        fill="#FFFFFF"
        style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
      >
        Kč
      </text>
    </svg>
  );
}

// 10 Kč mince - stříbrná
export function Coin10Kc({ size = 100, className = '' }: CoinSVGProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="silver10" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#C0C0C0" />
          <stop offset="100%" stopColor="#808080" />
        </radialGradient>
        <filter id="shadow10" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.3"/>
        </filter>
      </defs>
      
      <circle 
        cx="50" 
        cy="50" 
        r="48" 
        fill="url(#silver10)" 
        stroke="#A0A0A0" 
        strokeWidth="2"
        filter="url(#shadow10)"
      />
      
      <circle 
        cx="50" 
        cy="50" 
        r="42" 
        fill="none" 
        stroke="#E0E0E0" 
        strokeWidth="1"
        opacity="0.8"
      />
      
      <text 
        x="50" 
        y="46" 
        textAnchor="middle" 
        fontSize="18" 
        fontWeight="bold" 
        fill="#333333"
        style={{ textShadow: "1px 1px 2px rgba(255,255,255,0.8)" }}
      >
        10
      </text>
      
      <text 
        x="50" 
        y="62" 
        textAnchor="middle" 
        fontSize="12" 
        fontWeight="bold" 
        fill="#333333"
        style={{ textShadow: "1px 1px 1px rgba(255,255,255,0.8)" }}
      >
        Kč
      </text>
    </svg>
  );
}

// 20 Kč mince - zlatá
export function Coin20Kc({ size = 100, className = '' }: CoinSVGProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="gold20" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#FFFF99" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFA500" />
        </radialGradient>
        <filter id="shadow20" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.3"/>
        </filter>
      </defs>
      
      <circle 
        cx="50" 
        cy="50" 
        r="48" 
        fill="url(#gold20)" 
        stroke="#DAA520" 
        strokeWidth="2"
        filter="url(#shadow20)"
      />
      
      <circle 
        cx="50" 
        cy="50" 
        r="42" 
        fill="none" 
        stroke="#FFFF66" 
        strokeWidth="1"
        opacity="0.8"
      />
      
      <text 
        x="50" 
        y="46" 
        textAnchor="middle" 
        fontSize="18" 
        fontWeight="bold" 
        fill="#FFFFFF"
        style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
      >
        20
      </text>
      
      <text 
        x="50" 
        y="62" 
        textAnchor="middle" 
        fontSize="12" 
        fontWeight="bold" 
        fill="#FFFFFF"
        style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
      >
        Kč
      </text>
    </svg>
  );
}

// 50 Kč mince - největší, zlatá
export function Coin50Kc({ size = 100, className = '' }: CoinSVGProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="gold50" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#FFFF99" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFA500" />
        </radialGradient>
        <filter id="shadow50" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.4"/>
        </filter>
      </defs>
      
      <circle 
        cx="50" 
        cy="50" 
        r="48" 
        fill="url(#gold50)" 
        stroke="#DAA520" 
        strokeWidth="3"
        filter="url(#shadow50)"
      />
      
      {/* Vnitřní ozdobný kruh */}
      <circle 
        cx="50" 
        cy="50" 
        r="42" 
        fill="none" 
        stroke="#FFFF66" 
        strokeWidth="1"
        opacity="0.8"
      />
      
      {/* Další ozdobný kruh pro největší minci */}
      <circle 
        cx="50" 
        cy="50" 
        r="35" 
        fill="none" 
        stroke="#FFFF33" 
        strokeWidth="0.5"
        opacity="0.6"
      />
      
      <text 
        x="50" 
        y="46" 
        textAnchor="middle" 
        fontSize="18" 
        fontWeight="bold" 
        fill="#FFFFFF"
        style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
      >
        50
      </text>
      
      <text 
        x="50" 
        y="62" 
        textAnchor="middle" 
        fontSize="12" 
        fontWeight="bold" 
        fill="#FFFFFF"
        style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}
      >
        Kč
      </text>
    </svg>
  );
}

// Pomocná funkce pro získání správné komponenty mince
export function getCoinComponent(value: number) {
  switch (value) {
    case 1: return Coin1Kc;
    case 2: return Coin2Kc;
    case 5: return Coin5Kc;
    case 10: return Coin10Kc;
    case 20: return Coin20Kc;
    case 50: return Coin50Kc;
    default: return Coin1Kc;
  }
}

// Všechny mince jako pole pro export
export const CoinComponents = {
  1: Coin1Kc,
  2: Coin2Kc,
  5: Coin5Kc,
  10: Coin10Kc,
  20: Coin20Kc,
  50: Coin50Kc
};