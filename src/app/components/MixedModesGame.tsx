import React, { useState, useEffect, useCallback } from 'react';
import { CountdownOverlay } from './CountdownOverlay';
import { GameResultScreen } from './GameResultScreen';
import { QuantityComparisonGame } from './QuantityComparisonGame';
import { ClickMoreGame } from './ClickMoreGame';
import { ClickLessGame } from './ClickLessGame';

interface MixedModesGameProps {
  settings?: Record<string, any>;
  onChangeSettings?: () => void;
}

export function MixedModesGame({ settings, onChangeSettings }: MixedModesGameProps) {
  const gameModes = settings?.gameModes || ['quantityComparison'];
  const totalRounds = settings?.totalRounds || 15;
  const maxLives = settings?.maxLives || 3;
  const timeBasedGame = settings?.timeBasedGame !== false;

  const [currentRound, setCurrentRound] = useState(1);
  const [currentMode, setCurrentMode] = useState<string>(gameModes[0]);
  const [lives, setLives] = useState(maxLives);
  const [score, setScore] = useState(0);
  const [showCountdown, setShowCountdown] = useState(timeBasedGame);
  const [gamePhase, setGamePhase] = useState<'countdown' | 'playing' | 'roundComplete' | 'gameComplete'>('countdown');
  const [roundResult, setRoundResult] = useState<{ isSuccess: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!timeBasedGame) {
      setShowCountdown(false);
      setGamePhase('playing');
    }
  }, [timeBasedGame]);

  const selectRandomMode = useCallback(() => {
    if (gameModes.length === 1) {
      return gameModes[0];
    }
    
    let availableModes = gameModes.filter((mode: string) => mode !== currentMode);
    if (availableModes.length === 0) {
      availableModes = gameModes;
    }
    
    return availableModes[Math.floor(Math.random() * availableModes.length)];
  }, [gameModes, currentMode]);

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    setGamePhase('playing');
  }, []);

  const handleRoundComplete = useCallback((roundScore: number, remainingLives: number) => {
    setScore(prev => prev + roundScore);
    setLives(remainingLives);
    
    if (remainingLives <= 0) {
      setGamePhase('gameComplete');
      return;
    }

    if (currentRound >= totalRounds) {
      setGamePhase('gameComplete');
      return;
    }

    // Prepare next round
    setCurrentRound(prev => prev + 1);
    setCurrentMode(selectRandomMode());
    
    // Show brief success message then continue
    setRoundResult({ 
      isSuccess: roundScore > 0, 
      message: roundScore > 0 ? 'Správně!' : 'Zkus to znovu!' 
    });
    setGamePhase('roundComplete');
    
    // Auto-continue after short delay
    setTimeout(() => {
      setRoundResult(null);
      if (timeBasedGame) {
        setShowCountdown(true);
        setGamePhase('countdown');
      } else {
        setGamePhase('playing');
      }
    }, 1500);
  }, [currentRound, totalRounds, selectRandomMode, timeBasedGame]);

  const handlePlayAgain = useCallback(() => {
    setCurrentRound(1);
    setCurrentMode(gameModes[0]);
    setLives(maxLives);
    setScore(0);
    setRoundResult(null);
    
    if (timeBasedGame) {
      setShowCountdown(true);
      setGamePhase('countdown');
    } else {
      setGamePhase('playing');
    }
  }, [gameModes, maxLives, timeBasedGame]);

  const gameSettings = {
    ...settings,
    currentRound,
    totalRounds,
    maxLives,
    backgroundColor: '#F5E6D0' // Béžové pozadí podle specifikace
  };

  // Countdown overlay
  if (showCountdown && gamePhase === 'countdown') {
    return (
      <CountdownOverlay
        isVisible={true}
        onComplete={handleCountdownComplete}
        countdownDuration={3}
      />
    );
  }

  // Round result overlay
  if (gamePhase === 'roundComplete' && roundResult) {
    return (
      <GameResultScreen
        isSuccess={roundResult.isSuccess}
        successText={roundResult.message}
        failureText={roundResult.message}
        displayType="roundResult"
      />
    );
  }

  // Game complete screen
  if (gamePhase === 'gameComplete') {
    const finalScore = Math.round((score / totalRounds) * 100);
    const isSuccess = lives > 0 && score > 0;
    
    return (
      <GameResultScreen
        isSuccess={isSuccess}
        successText={`Hra dokončena! Skóre: ${finalScore}%`}
        failureText="Hra skončila! Zkus to znovu."
        displayType="gameComplete"
        onContinue={handlePlayAgain}
        onChangeSettings={onChangeSettings}
        onPlayAgainWithSettings={handlePlayAgain}
        customContent={
          <div className="text-center space-y-2">
            <div className="text-lg">🎯 Dokončeno kol: {currentRound - 1}/{totalRounds}</div>
            <div className="text-lg">💙 Zbývající životy: {lives}</div>
            <div className="text-lg">⭐ Celkové skóre: {score}</div>
          </div>
        }
      />
    );
  }

  // Active game rendering
  if (gamePhase === 'playing') {
    switch (currentMode) {
      case 'quantityComparison':
        return (
          <QuantityComparisonGame
            settings={gameSettings}
            onGameComplete={handleRoundComplete}
          />
        );
      
      case 'clickMore':
        return (
          <ClickMoreGame
            settings={gameSettings}
            onGameComplete={handleRoundComplete}
          />
        );
      
      case 'clickLess':
        return (
          <ClickLessGame
            settings={gameSettings}
            onGameComplete={handleRoundComplete}
          />
        );
      
      default:
        return (
          <QuantityComparisonGame
            settings={gameSettings}
            onGameComplete={handleRoundComplete}
          />
        );
    }
  }

  return null;
}