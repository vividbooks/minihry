export const isTouchDevice = (): boolean => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
};

export type ScreenSize = 'mobile' | 'tablet' | 'desktop';

export const getScreenSize = (): ScreenSize => {
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

export const updateScreenSize = (callback: (size: ScreenSize) => void) => {
  const updateSize = () => callback(getScreenSize());
  updateSize();
  window.addEventListener('resize', updateSize);
  return () => window.removeEventListener('resize', updateSize);
};