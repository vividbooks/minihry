import React from 'react';
import { useDrag } from 'react-dnd';
import { PatternElement } from './types';
import { ShapeComponent } from './ShapeComponent';
import { COLORS } from '../../constants/patternSequenceConstants';

interface DraggablePatternProps {
  element: PatternElement;
  originalIndex: number;
  onDrop: () => void;
  style: React.CSSProperties;
  size: number;
}

export const DraggablePattern: React.FC<DraggablePatternProps> = ({ element, originalIndex, onDrop, style, size }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'pattern',
    item: { element: {...element}, originalIndex },
    end: (item, monitor) => {
      if (monitor.didDrop()) onDrop();
    },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }), [element, originalIndex]);
  
  const containerSize = Math.floor(size * 1.8);
  
  return (
    <div 
      ref={drag} 
      className="cursor-move select-none transition-all transform active:scale-95 absolute z-30 flex items-center justify-center" 
      style={{
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: COLORS.DRAGGABLE_BG,
        border: `3px solid ${COLORS.DRAGGABLE_BORDER}`,
        borderRadius: '16px',
        width: `${containerSize}px`,
        height: `${containerSize}px`,
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        ...style
      }}
    >
      <ShapeComponent element={element} size={size} />
    </div>
  );
};