import React from 'react';
import { MathTinder } from './MathTinder';

interface MathPracticeGameProps {
  settings?: Record<string, any>;
}

export function MathPracticeGame({ settings }: MathPracticeGameProps) {
  return <MathTinder settings={settings} />;
}