import { Button } from "./ui/button";

export interface Level {
  id: number;
  name: string;
  description: string;
  icon: string;
  totalSteps: number;
  pathType: 'straight' | 'circle';
  diceCount: 1 | 2;
  packagesToWin: number;
}

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "Level 1",
    description: "Rovná cesta s 10 poli",
    icon: "➡️",
    totalSteps: 10,
    pathType: 'straight',
    diceCount: 1,
    packagesToWin: 3
  }
];

export interface LevelSelectorProps {
  selectedLevel: Level;
  onLevelSelect: (level: Level) => void;
  allowLevelChange?: boolean;
}

export function LevelSelector({ selectedLevel, onLevelSelect, allowLevelChange = true }: LevelSelectorProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-gray-200 font-visby">
      <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
        🎯 {allowLevelChange ? 'Vyber level' : 'Nastaven level'}
      </h2>
      
      {allowLevelChange ? (
        <div className="grid grid-cols-1 gap-3">
          {LEVELS.map((level) => (
            <Button
              key={level.id}
              onClick={() => onLevelSelect(level)}
              variant={selectedLevel.id === level.id ? "default" : "outline"}
              className={`p-6 h-auto flex flex-col items-center gap-2 text-left transition-all duration-200 ${
                selectedLevel.id === level.id 
                  ? 'bg-blue-500 text-white border-blue-600 shadow-lg' 
                  : 'hover:bg-blue-50 hover:border-blue-300'
              }`}
            >
              <div className="text-3xl">{level.icon}</div>
              <div>
                <div className="font-bold text-lg">{level.name}</div>
                <div className={`text-sm ${selectedLevel.id === level.id ? 'text-blue-100' : 'text-gray-600'}`}>
                  {level.description}
                </div>
                <div className={`text-xs mt-1 ${selectedLevel.id === level.id ? 'text-blue-200' : 'text-gray-500'}`}>
                  Cíl: {level.packagesToWin} balíčků
                </div>
              </div>
            </Button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-6 bg-blue-500 text-white border-blue-600 shadow-lg rounded-lg text-center">
            <div className="text-4xl mb-3">{selectedLevel.icon}</div>
            <div className="font-bold text-xl mb-2">{selectedLevel.name}</div>
            <div className="text-blue-100 text-sm mb-1">{selectedLevel.description}</div>
            <div className="text-blue-200 text-xs">Cíl: {selectedLevel.packagesToWin} balíčků</div>
          </div>
          
          <Button
            onClick={() => onLevelSelect(selectedLevel)}
            className="w-full bg-green-500 hover:bg-green-600 text-white text-xl py-4"
          >
            🎮 Začít hrát
          </Button>
        </div>
      )}
    </div>
  );
}