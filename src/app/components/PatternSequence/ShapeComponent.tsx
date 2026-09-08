import React from 'react';
import { PatternElement } from './types';

interface ShapeComponentProps {
  element: PatternElement;
  size: number;
}

export const ShapeComponent: React.FC<ShapeComponentProps> = ({ element, size }) => {
  const renderShape = () => {
    const shapeProps = {
      width: size,
      height: size,
      fill: element.color,
      stroke: 'none',
      strokeWidth: 0
    };
    
    switch (element.shape) {
      case 'circle':
        return <circle cx={size/2} cy={size/2} r={size/2 - 2} {...shapeProps} />;
      case 'square':
        return <rect x={2} y={2} width={size-4} height={size-4} {...shapeProps} />;
      case 'triangle':
        return <polygon points={`${size/2},2 2,${size-2} ${size-2},${size-2}`} {...shapeProps} />;
      default:
        return <circle cx={size/2} cy={size/2} r={size/2 - 2} {...shapeProps} />;
    }
  };

  return (
    <svg width={size} height={size}>
      {renderShape()}
    </svg>
  );
};