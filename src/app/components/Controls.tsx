import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface ControlsProps {
  onMoveForward: () => void;
  onMoveBackward: () => void;
  canMove: boolean;
  stepsToMove: number;
  currentPlayer: number;
  playerPositions: number[];
  playerColors: string[];
  totalSteps: number;
  packagePosition: number | null;
  needsExactMatch: boolean;
}

export function Controls({ 
  onMoveForward,
  onMoveBackward,
  canMove, 
  stepsToMove,
  currentPlayer,
  playerPositions,
  playerColors,
  totalSteps,
  packagePosition,
  needsExactMatch
}: ControlsProps) {
  const currentPlayerColor = playerColors[currentPlayer];
  return (
    <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200 font-visby">
      
      {/* Jednoduché ovládání tam a zpátky */}
      <div className="flex gap-6 justify-center mb-4">
        <Button
          onClick={onMoveBackward}
          disabled={!canMove}
          variant="outline"
          size="lg"
          className="w-28 h-28 rounded-full border-4 shadow-lg hover:shadow-xl transition-all duration-200"
          style={{
            backgroundColor: currentPlayerColor,
            borderColor: currentPlayerColor,
            filter: 'brightness(0.9)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = 'brightness(0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = 'brightness(0.9)';
          }}
        >
          <ChevronLeft className="w-24 h-24 text-white stroke-[6]" />
        </Button>
        
        <Button
          onClick={onMoveForward}
          disabled={!canMove}
          variant="outline"
          size="lg"
          className="w-28 h-28 rounded-full border-4 shadow-lg hover:shadow-xl transition-all duration-200"
          style={{
            backgroundColor: currentPlayerColor,
            borderColor: currentPlayerColor,
            filter: 'brightness(0.9)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = 'brightness(0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = 'brightness(0.9)';
          }}
        >
          <ChevronRight className="w-24 h-24 text-white stroke-[6]" />
        </Button>
      </div>

    </div>
  );
}