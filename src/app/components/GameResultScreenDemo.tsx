import React, { useState } from 'react';
import { GameResultScreen } from './GameResultScreen';
import { Button } from './ui/button';

export function GameResultScreenDemo() {
  const [showResult, setShowResult] = useState(false);
  const [isSuccess, setIsSuccess] = useState(true);
  const [displayType, setDisplayType] = useState<'gameComplete' | 'correctAnswer'>('gameComplete');

  const handleShowSuccess = (type: 'gameComplete' | 'correctAnswer' = 'gameComplete') => {
    setIsSuccess(true);
    setDisplayType(type);
    setShowResult(true);
  };

  const handleShowFailure = (type: 'gameComplete' | 'correctAnswer' = 'gameComplete') => {
    setIsSuccess(false);
    setDisplayType(type);
    setShowResult(true);
  };

  const handleContinue = () => {
    setShowResult(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl mb-4">Demo výsledkových obrazovek</h1>
        <p className="text-gray-600 mb-6">
          Klikněte na tlačítka níže pro zobrazení různých variant výsledkových obrazovek.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h3 className="text-lg mb-2">Dokončení celé hry:</h3>
          <Button 
            onClick={() => handleShowSuccess('gameComplete')}
            className="w-64 h-12 bg-green-500 hover:bg-green-600 text-white"
          >
            Úspěch - s náhodným videem
          </Button>
          
          <Button 
            onClick={() => handleShowFailure('gameComplete')}
            className="w-64 h-12 bg-red-500 hover:bg-red-600 text-white"
          >
            Neúspěch - bez videa
          </Button>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg mb-2">Potvrzení v průběhu hry:</h3>
          <Button 
            onClick={() => handleShowSuccess('correctAnswer')}
            className="w-64 h-12 bg-blue-500 hover:bg-blue-600 text-white"
          >
            Správně! - jen text
          </Button>
          
          <Button 
            onClick={() => handleShowFailure('correctAnswer')}
            className="w-64 h-12 bg-orange-500 hover:bg-orange-600 text-white"
          >
            Špatně! - jen text
          </Button>
        </div>
      </div>

      <div className="mt-8 p-4 bg-white rounded-lg shadow max-w-4xl">
        <h3 className="text-lg mb-4">Vlastnosti komponenty:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Dokončení celé hry (gameComplete):</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Používá CelebrationVideo komponentu</li>
              <li>• Náhodný výběr ze 4 oslavných videí</li>
              <li>• Každé video má vlastní barvu pozadí</li>
              <li>• Video responzivní: 416px → 500px → 584px</li>
              <li>• Video v dolní části s paddingem</li>
              <li>• Tlačítko "Pokračovat" zobrazeno</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Potvrzení v průběhu (correctAnswer):</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Používá CorrectAnswerOverlay komponentu</li>
              <li>• Pouze animované slovo bez pozadí</li>
              <li>• Průhledný overlay - neblokuje hru</li>
              <li>• Rotační animace s scaling efektem</li>
              <li>• Automatické zmizení po animaci</li>
              <li>• Text shadow pro lepší čitelnost</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Dostupná videa a pozadí:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Video 1: oslava_1.mp4 (#FEF4E8 - světle béžová)</li>
              <li>• Video 2: oslava_2.mp4 (#FEFEFE - bílá)</li>
              <li>• Video 3: oslava_3.mp4 (#FAF3CF - světle žlutá)</li>
              <li>• Video 4: oslava_4.mp4 (#FCF4E9 - krémová)</li>
            </ul>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Architektura komponent:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• GameResultScreen - hlavní komponenta s logikou</li>
              <li>• CorrectAnswerOverlay - overlay pro rychlou zpětnou vazbu</li>
              <li>• CelebrationVideo - komponenta pro oslavná videa</li>
              <li>• celebrationVideos.ts - konstanty a helper funkce</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Výsledková obrazovka */}
      {showResult && (
        <GameResultScreen
          isSuccess={isSuccess}
          onContinue={handleContinue}
          showContinueButton={displayType === 'gameComplete'}
          displayType={displayType}
          autoHideDuration={displayType === 'correctAnswer' ? 2 : undefined}
        />
      )}
    </div>
  );
}