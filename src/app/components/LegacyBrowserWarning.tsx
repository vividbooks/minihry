import React, { useEffect, useState } from 'react';
import { isLegacyBrowser } from '../utils/legacySupport';

/**
 * Komponenta zobrazující varování pro staré prohlížeče
 * Zobrazuje se pouze jednou při prvním načtení
 */
export const LegacyBrowserWarning: React.FC = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Kontrola, zda už bylo varování zobrazeno v této session
    const warningDismissed = sessionStorage.getItem('legacy-warning-dismissed');
    
    if (!warningDismissed && isLegacyBrowser()) {
      setShowWarning(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    setShowWarning(false);
    sessionStorage.setItem('legacy-warning-dismissed', 'true');
  };

  if (!showWarning || dismissed) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-yellow-50 border-b-2 border-yellow-300 p-4 shadow-md">
      <div className="max-w-4xl mx-auto flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <svg 
            className="w-6 h-6 text-yellow-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-yellow-800 mb-1" style={{ fontWeight: 600 }}>
            Starší zařízení detekováno
          </h3>
          <p className="text-yellow-700 text-sm mb-2">
            Používáte starší verzi prohlížeče. Aplikace by měla fungovat, ale některé funkce 
            mohou být omezené. Pro nejlepší zážitek doporučujeme aktualizovat váš prohlížeč nebo iOS.
          </p>
          <button
            onClick={handleDismiss}
            className="text-yellow-800 text-sm px-3 py-1 bg-yellow-100 hover:bg-yellow-200 rounded transition-colors"
            style={{ fontWeight: 500 }}
          >
            Rozumím
          </button>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-yellow-600 hover:text-yellow-800 p-1"
          aria-label="Zavřít"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
