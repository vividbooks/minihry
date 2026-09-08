import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Cell } from '../utils/gameLogic';
import { APP_COLORS } from '../constants/gameData';

interface ResultDisplayProps {
  rightGrid: Record<string, Cell>;
}

export function ResultDisplay({ rightGrid }: ResultDisplayProps) {
  const cells = Object.values(rightGrid);
  const correctCells = cells.filter(cell => cell.isCorrect === true).length;
  const incorrectCells = cells.filter(cell => cell.isCorrect === false).length;
  const totalCells = cells.length;
  
  const isComplete = correctCells === totalCells && totalCells > 0;
  const percentage = totalCells > 0 ? Math.round((correctCells / totalCells) * 100) : 0;

  return (
    <div 
      className="text-center p-4 rounded-lg border-2 max-w-md mx-auto"
      style={{ 
        backgroundColor: APP_COLORS.GRID_BACKGROUND,
        borderColor: APP_COLORS.GRID_LINES 
      }}
    >
      <h3 className="mb-4" style={{ color: APP_COLORS.TASK_TEXT }}>
        📊 Výsledek
      </h3>
      
      {isComplete ? (
        <div className="text-center">
          <div className="text-4xl mb-2">🎉</div>
          <p style={{ color: '#4CAF50' }}>Perfektní! Dokončil jsi úkol správně!</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-center items-center gap-4">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span style={{ color: '#4CAF50' }}>{correctCells} správně</span>
            </div>
            {incorrectCells > 0 && (
              <div className="flex items-center gap-1">
                <XCircle className="w-5 h-5 text-red-600" />
                <span style={{ color: '#FF4D6D' }}>{incorrectCells} špatně</span>
              </div>
            )}
          </div>
          <div className="text-lg" style={{ color: APP_COLORS.TASK_TEXT }}>
            Úspěšnost: {percentage}%
          </div>
          {percentage >= 80 ? (
            <p style={{ color: '#4CAF50' }}>Skvělá práce! 👍</p>
          ) : percentage >= 50 ? (
            <p style={{ color: '#F7A800' }}>Dobře, můžeš to zkusit znovu! 💪</p>
          ) : (
            <p style={{ color: '#FF4D6D' }}>Zkus to znovu, jde to! 🔄</p>
          )}
        </div>
      )}
    </div>
  );
}