import React from 'react';
import { useDrop } from 'react-dnd';
import { PatternElement } from './types';
import { ShapeComponent } from './ShapeComponent';
import { COLORS } from '../../constants/patternSequenceConstants';

interface DropSlotProps {
  slotKey: string;
  element: PatternElement | null;
  expectedElement: PatternElement;
  onDrop: (slotKey: string, element: PatternElement, originalIndex: number) => void;
  onRemove: (slotKey: string) => void;
  size: number;
  isComplete: boolean;
}

export const DropSlot: React.FC<DropSlotProps> = ({ slotKey, element, expectedElement, onDrop, onRemove, size, isComplete }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'pattern',
    drop: (item: { element: PatternElement; originalIndex: number }) => {
      onDrop(slotKey, item.element, item.originalIndex);
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  }));
  
  const isEmpty = element === null;
  const isCorrect = element && expectedElement && 
    element.shape === expectedElement.shape && 
    element.color === expectedElement.color;
  
  // Symboly se označí zeleně pouze po dokončení hry
  const showCorrect = isCorrect && isComplete;
  const showIncorrect = !isEmpty && !isCorrect;
  
  const backgroundColor = isEmpty ? 
    (isOver ? COLORS.HOVER_BG : COLORS.SLOT_BG) : 
    (showCorrect ? COLORS.FILLED_BG : showIncorrect ? '#FFE4E1' : COLORS.SLOT_BG);
  
  const border = isEmpty ? 
    `3px dashed ${COLORS.SLOT_LINE}` : 
    (showCorrect ? `3px solid ${COLORS.FILLED_BORDER}` : 
     showIncorrect ? `3px solid ${COLORS.RED}` : 
     `3px solid ${COLORS.SLOT_LINE}`);
  
  return (
    <div
      ref={drop}
      className="flex items-center justify-center transition-all cursor-pointer"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor,
        border,
        borderRadius: '12px',
        boxShadow: isEmpty ? 'none' : '0 2px 4px rgba(0,0,0,0.1)'
      }}
      onClick={() => {
        if (element) {
          onRemove(slotKey);
        }
      }}
    >
      {element ? (
        <ShapeComponent element={element} size={Math.floor(size * 0.8)} />
      ) : (
        <span style={{ color: COLORS.GRAY, fontSize: `${Math.floor(size * 0.3)}px` }}>?</span>
      )}
    </div>
  );
};