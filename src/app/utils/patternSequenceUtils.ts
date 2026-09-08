import { DifficultyLevel, PatternElement, PatternSpec } from '../components/PatternSequence/types';
import { SHAPES, COLOR_GROUPS, SHAPE_COLORS, PATTERN_CONFIGS } from '../constants/patternSequenceConstants';

// Inteligentní výběr barev podle dokumentace
export const selectDiverseColors = (count: number): number[] => {
  const colorGroupKeys = Object.keys(COLOR_GROUPS);
  const selectedColors: number[] = [];
  const usedGroups = new Set<string>();
  
  // Nejprve vybere z různých skupin
  while (selectedColors.length < count && usedGroups.size < colorGroupKeys.length) {
    for (const groupKey of colorGroupKeys) {
      if (usedGroups.has(groupKey) || selectedColors.length >= count) continue;
      
      const groupColors = COLOR_GROUPS[groupKey as keyof typeof COLOR_GROUPS];
      const randomColorFromGroup = groupColors[Math.floor(Math.random() * groupColors.length)];
      const colorIndex = SHAPE_COLORS.findIndex(color => color === randomColorFromGroup);
      
      if (colorIndex !== -1 && !selectedColors.includes(colorIndex)) {
        selectedColors.push(colorIndex);
        usedGroups.add(groupKey);
      }
    }
  }
  
  // Doplnění dalších barev pokud je třeba
  while (selectedColors.length < count) {
    const randomIndex = Math.floor(Math.random() * SHAPE_COLORS.length);
    if (!selectedColors.includes(randomIndex)) {
      selectedColors.push(randomIndex);
    }
  }
  
  return selectedColors.slice(0, count);
};

// Parsování vlastních vzorů
export const parseCustomPattern = (patternString: string): { pattern: string; elements: any[] } | null => {
  if (!patternString.trim()) return null;
  
  const pattern = patternString.trim().toUpperCase();
  const uniqueChars = [...new Set(pattern.split(''))];
  
  if (uniqueChars.length > 3) {
    console.warn('Vlastní vzor může mít maximálně 3 různé znaky');
    return null;
  }
  
  const selectedShapes = [...SHAPES].sort(() => Math.random() - 0.5).slice(0, uniqueChars.length);
  const selectedColors = selectDiverseColors(uniqueChars.length);
  
  const elements = uniqueChars.map((char, index) => ({
    shape: selectedShapes[index],
    color: selectedColors[index]
  }));
  
  return { pattern, elements };
};

// Generování vzoru podle obtížnosti
export const generatePatternVariant = (difficulty: DifficultyLevel = 'easy', customPatterns: string = '', patternTypes: string[] = []): PatternSpec => {
  try {
    // Pokud jsou zadány vlastní vzory, použij je
    if (customPatterns) {
      const patterns = customPatterns.split(',').map(p => p.trim()).filter(p => p);
      if (patterns.length > 0) {
        const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
        const parsed = parseCustomPattern(randomPattern);
        
        if (parsed) {
          const { pattern, elements } = parsed;
          
          // Určení délky podle obtížnosti
          let totalLength: number;
          switch (difficulty) {
            case 'easy':
              totalLength = 12 + Math.floor(Math.random() * 5); // 12-16
              break;
            case 'medium':
            case 'hard':
              totalLength = 16 + Math.floor(Math.random() * 5); // 16-20
              break;
          }
          
          // Vytvoření vzoru
          const generatedPattern: PatternElement[][] = [];
          
          if (difficulty === 'easy') {
            // Jeden řádek pro easy
            const row: PatternElement[] = [];
            for (let i = 0; i < totalLength; i++) {
              const charIndex = i % pattern.length;
              const char = pattern[charIndex];
              const elementIndex = [...new Set(pattern.split(''))].indexOf(char);
              const baseElement = elements[elementIndex];
              
              row.push({
                id: `${i}-${Math.random().toString(36).substr(2, 9)}`,
                shape: baseElement.shape as 'circle' | 'square' | 'triangle',
                color: SHAPE_COLORS[baseElement.color]
              });
            }
            generatedPattern.push(row);
          } else {
            // Dva řádky pro medium/hard
            const row1: PatternElement[] = [];
            const row2: PatternElement[] = [];
            
            for (let i = 0; i < Math.ceil(totalLength / 2); i++) {
              const charIndex1 = i % pattern.length;
              const char1 = pattern[charIndex1];
              const elementIndex1 = [...new Set(pattern.split(''))].indexOf(char1);
              const baseElement1 = elements[elementIndex1];
              
              row1.push({
                id: `0-${i}-${Math.random().toString(36).substr(2, 9)}`,
                shape: baseElement1.shape as 'circle' | 'square' | 'triangle',
                color: SHAPE_COLORS[baseElement1.color]
              });
              
              if (i < Math.floor(totalLength / 2)) {
                const charIndex2 = difficulty === 'medium' ? 
                  (i + 1) % pattern.length : // Posunutý vzor
                  (pattern.length - 1 - (i % pattern.length)); // Zrcadlový vzor
                const char2 = pattern[charIndex2];
                const elementIndex2 = [...new Set(pattern.split(''))].indexOf(char2);
                const baseElement2 = elements[elementIndex2];
                
                row2.push({
                  id: `1-${i}-${Math.random().toString(36).substr(2, 9)}`,
                  shape: baseElement2.shape as 'circle' | 'square' | 'triangle',
                  color: SHAPE_COLORS[baseElement2.color]
                });
              }
            }
            
            generatedPattern.push(row1, row2);
          }
          
          // Chytrá logika chybějících prvků - garantuje rozmanitost typů
          const missing: Array<{row: number, col: number}> = [];
          
          // Najít všechny unikátní typy prvků ve vzoru
          const uniqueElementTypes = new Set<string>();
          generatedPattern.forEach(row => {
            row.forEach(element => {
              uniqueElementTypes.add(`${element.shape}-${element.color}`);
            });
          });
          
          const uniqueTypesArray = Array.from(uniqueElementTypes);
          
          if (difficulty === 'easy') {
            const row = generatedPattern[0];
            const patternUnit = pattern.length;
            
            const visibleStart = Math.min(patternUnit + 1, row.length - 6);
            const visibleEnd = Math.max(row.length - 3, visibleStart + 6);
            
            // KROK 1: Garantovat alespoň jeden chybějící prvek od každého typu
            const missingByType = new Map<string, number>();
            uniqueTypesArray.forEach(type => missingByType.set(type, 0));
            
            // Najít pozice pro každý typ v rozsahu
            const positionsByType = new Map<string, number[]>();
            for (let i = visibleStart; i < visibleEnd; i++) {
              const element = row[i];
              const elementType = `${element.shape}-${element.color}`;
              if (!positionsByType.has(elementType)) {
                positionsByType.set(elementType, []);
              }
              positionsByType.get(elementType)!.push(i);
            }
            
            // Pro každý typ vybrat alespoň jednu pozici k odstranění
            uniqueTypesArray.forEach(type => {
              const positions = positionsByType.get(type) || [];
              if (positions.length > 0) {
                // Vybrat náhodnou pozici z tohoto typu
                const randomPos = positions[Math.floor(Math.random() * positions.length)];
                if (!missing.some(pos => pos.col === randomPos)) {
                  missing.push({ row: 0, col: randomPos });
                  missingByType.set(type, (missingByType.get(type) || 0) + 1);
                }
              }
            });
            
            // KROK 2: Doplnit další chybějící prvky náhodně do cílového počtu
            const targetMissingCount = Math.max(4, Math.min(uniqueTypesArray.length + 2, Math.floor(row.length * 0.3)));
            
            while (missing.length < targetMissingCount && missing.length < visibleEnd - visibleStart - 2) {
              const randomIndex = visibleStart + Math.floor(Math.random() * (visibleEnd - visibleStart));
              if (!missing.some(pos => pos.col === randomIndex)) {
                missing.push({ row: 0, col: randomIndex });
              }
            }
          } else {
            const totalElements = generatedPattern.reduce((sum, row) => sum + row.length, 0);
            
            // KROK 1: Garantovat alespoň jeden chybějící prvek od každého typu
            const missingByType = new Map<string, number>();
            uniqueTypesArray.forEach(type => missingByType.set(type, 0));
            
            // Najít všechny pozice pro každý typ
            const positionsByType = new Map<string, Array<{row: number, col: number}>>();
            generatedPattern.forEach((row, rowIndex) => {
              row.forEach((element, colIndex) => {
                const elementType = `${element.shape}-${element.color}`;
                if (!positionsByType.has(elementType)) {
                  positionsByType.set(elementType, []);
                }
                positionsByType.get(elementType)!.push({row: rowIndex, col: colIndex});
              });
            });
            
            // Pro každý typ vybrat alespoň jednu pozici k odstranění
            uniqueTypesArray.forEach(type => {
              const positions = positionsByType.get(type) || [];
              if (positions.length > 0) {
                // Vybrat náhodnou pozici z tohoto typu
                const randomPos = positions[Math.floor(Math.random() * positions.length)];
                if (!missing.some(pos => pos.row === randomPos.row && pos.col === randomPos.col)) {
                  missing.push(randomPos);
                  missingByType.set(type, (missingByType.get(type) || 0) + 1);
                }
              }
            });
            
            // KROK 2: Doplnit další chybějící prvky náhodně do cílového počtu
            const targetMissingCount = Math.max(uniqueTypesArray.length + 3, Math.min(8, Math.floor(totalElements * 0.4)));
            
            while (missing.length < targetMissingCount) {
              const row = Math.floor(Math.random() * generatedPattern.length);
              const col = Math.floor(Math.random() * generatedPattern[row].length);
              
              if (!missing.some(pos => pos.row === row && pos.col === col)) {
                missing.push({ row, col });
              }
            }
          }
          
          return {
            pattern: generatedPattern,
            missing,
            title: `Vlastní vzor: ${randomPattern}`,
            description: `Doplň chybějící prvky ve vzoru ${randomPattern}`,
            difficulty
          };
        }
      }
    }
    
    // Standardní generování pokud nejsou vlastní vzory
    let patterns = PATTERN_CONFIGS[difficulty];
    
    // Aplikace filtru podle nastavení patternTypes
    if (patternTypes && patternTypes.length > 0) {
      const availablePatterns: any[] = [];
      
      // Projde všechny obtížnosti a najde vzory odpovídající nastavení
      Object.entries(PATTERN_CONFIGS).forEach(([difficultyLevel, difficultyPatterns]) => {
        difficultyPatterns.forEach(pattern => {
          if (patternTypes.includes(pattern.type)) {
            availablePatterns.push(pattern);
          }
        });
      });
      
      // Pokud jsou k dispozici vzory odpovídající nastavení, použij je
      if (availablePatterns.length > 0) {
        patterns = availablePatterns;
      }
    }
    
    const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
    
    // Výběr tvarů a barev
    const selectedShapes = [...SHAPES].sort(() => Math.random() - 0.5).slice(0, 3);
    const selectedColors = selectDiverseColors(3);
    
    const { pattern, elements } = selectedPattern.generate(selectedShapes, selectedColors);
    
    // Určení délky podle obtížnosti
    let totalLength: number;
    switch (difficulty) {
      case 'easy':
        totalLength = 12 + Math.floor(Math.random() * 5); // 12-16
        break;
      case 'medium':
      case 'hard':
        totalLength = 16 + Math.floor(Math.random() * 5); // 16-20
        break;
    }
    
    // Vytvoření vzoru
    const generatedPattern: PatternElement[][] = [];
    
    if (difficulty === 'easy') {
      // Jeden řádek pro easy
      const row: PatternElement[] = [];
      for (let i = 0; i < totalLength; i++) {
        const baseElement = elements[i % elements.length];
        row.push({
          id: `${i}-${Math.random().toString(36).substr(2, 9)}`,
          shape: baseElement.shape as 'circle' | 'square' | 'triangle',
          color: SHAPE_COLORS[baseElement.color]
        });
      }
      generatedPattern.push(row);
    } else {
      // Dva řádky pro medium/hard
      const row1: PatternElement[] = [];
      const row2: PatternElement[] = [];
      
      for (let i = 0; i < Math.ceil(totalLength / 2); i++) {
        const baseElement1 = elements[i % elements.length];
        row1.push({
          id: `0-${i}-${Math.random().toString(36).substr(2, 9)}`,
          shape: baseElement1.shape as 'circle' | 'square' | 'triangle',
          color: SHAPE_COLORS[baseElement1.color]
        });
        
        // Pro druhý řádek jiná logika podle obtížnosti
        const baseElement2 = difficulty === 'medium' ? 
          elements[(i + 1) % elements.length] : // Posunutý vzor
          elements[(elements.length - 1 - (i % elements.length))] // Zrcadlový vzor
        
        if (i < Math.floor(totalLength / 2)) {
          row2.push({
            id: `1-${i}-${Math.random().toString(36).substr(2, 9)}`,
            shape: baseElement2.shape as 'circle' | 'square' | 'triangle',
            color: SHAPE_COLORS[baseElement2.color]
          });
        }
      }
      
      generatedPattern.push(row1, row2);
    }
    
    // Chytrá logika chybějících prvků - garantuje rozmanitost typů
    const missing: Array<{row: number, col: number}> = [];
    
    // Najít všechny unikátní typy prvků ve vzoru
    const uniqueElementTypes = new Set<string>();
    generatedPattern.forEach(row => {
      row.forEach(element => {
        uniqueElementTypes.add(`${element.shape}-${element.color}`);
      });
    });
    
    const uniqueTypesArray = Array.from(uniqueElementTypes);
    
    if (difficulty === 'easy') {
      // Pro lehkou úroveň - jeden řádek
      const row = generatedPattern[0];
      const patternUnit = elements.length;
      
      // Vždy ponechá viditelný začátek vzoru
      const visibleStart = Math.min(patternUnit + 1, row.length - 6);
      // Vždy ponechá viditelný konec vzoru  
      const visibleEnd = Math.max(row.length - 3, visibleStart + 6);
      
      // KROK 1: Garantovat alespoň jeden chybějící prvek od každého typu
      const missingByType = new Map<string, number>();
      uniqueTypesArray.forEach(type => missingByType.set(type, 0));
      
      // Najít pozice pro každý typ v rozsahu
      const positionsByType = new Map<string, number[]>();
      for (let i = visibleStart; i < visibleEnd; i++) {
        const element = row[i];
        const elementType = `${element.shape}-${element.color}`;
        if (!positionsByType.has(elementType)) {
          positionsByType.set(elementType, []);
        }
        positionsByType.get(elementType)!.push(i);
      }
      
      // Pro každý typ vybrat alespoň jednu pozici k odstranění
      uniqueTypesArray.forEach(type => {
        const positions = positionsByType.get(type) || [];
        if (positions.length > 0) {
          // Vybrat náhodnou pozici z tohoto typu
          const randomPos = positions[Math.floor(Math.random() * positions.length)];
          if (!missing.some(pos => pos.col === randomPos)) {
            missing.push({ row: 0, col: randomPos });
            missingByType.set(type, (missingByType.get(type) || 0) + 1);
          }
        }
      });
      
      // KROK 2: Doplnit další chybějící prvky náhodně do cílového počtu
      const targetMissingCount = Math.max(4, Math.min(uniqueTypesArray.length + 2, Math.floor(row.length * 0.3)));
      
      while (missing.length < targetMissingCount && missing.length < visibleEnd - visibleStart - 2) {
        const randomIndex = visibleStart + Math.floor(Math.random() * (visibleEnd - visibleStart));
        if (!missing.some(pos => pos.col === randomIndex)) {
          missing.push({ row: 0, col: randomIndex });
        }
      }
    } else {
      // Pro střední a těžkou úroveň - dva řádky
      const totalElements = generatedPattern.reduce((sum, row) => sum + row.length, 0);
      
      // KROK 1: Garantovat alespoň jeden chybějící prvek od každého typu
      const missingByType = new Map<string, number>();
      uniqueTypesArray.forEach(type => missingByType.set(type, 0));
      
      // Najít všechny pozice pro každý typ
      const positionsByType = new Map<string, Array<{row: number, col: number}>>();
      generatedPattern.forEach((row, rowIndex) => {
        row.forEach((element, colIndex) => {
          const elementType = `${element.shape}-${element.color}`;
          if (!positionsByType.has(elementType)) {
            positionsByType.set(elementType, []);
          }
          positionsByType.get(elementType)!.push({row: rowIndex, col: colIndex});
        });
      });
      
      // Pro každý typ vybrat alespoň jednu pozici k odstranění
      uniqueTypesArray.forEach(type => {
        const positions = positionsByType.get(type) || [];
        if (positions.length > 0) {
          // Vybrat náhodnou pozici z tohoto typu
          const randomPos = positions[Math.floor(Math.random() * positions.length)];
          if (!missing.some(pos => pos.row === randomPos.row && pos.col === randomPos.col)) {
            missing.push(randomPos);
            missingByType.set(type, (missingByType.get(type) || 0) + 1);
          }
        }
      });
      
      // KROK 2: Doplnit další chybějící prvky náhodně do cílového počtu
      const targetMissingCount = Math.max(uniqueTypesArray.length + 3, Math.min(8, Math.floor(totalElements * 0.4)));
      
      while (missing.length < targetMissingCount) {
        const row = Math.floor(Math.random() * generatedPattern.length);
        const col = Math.floor(Math.random() * generatedPattern[row].length);
        
        if (!missing.some(pos => pos.row === row && pos.col === col)) {
          missing.push({ row, col });
        }
      }
    }
    
    return {
      pattern: generatedPattern,
      missing,
      title: selectedPattern.title,
      description: selectedPattern.description,
      difficulty
    };
  } catch (error) {
    console.warn('Fallback to default pattern:', error);
    // Fallback pattern
    return {
      pattern: [[
        { id: '1', shape: 'circle', color: SHAPE_COLORS[0] },
        { id: '2', shape: 'square', color: SHAPE_COLORS[1] }
      ]],
      missing: [],
      title: 'Základní vzor',
      description: 'Jednoduchý vzor',
      difficulty: 'easy'
    };
  }
};