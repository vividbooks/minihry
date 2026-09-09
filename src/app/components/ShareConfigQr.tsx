import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Maximize2, X } from 'lucide-react';

type ShareConfigQrProps = {
  /** Kanonická play URL z generateGameURL — ne window.location. */
  url: string;
};

function overlayQrSize(): number {
  if (typeof window === 'undefined') return 420;
  return Math.round(Math.min(window.innerWidth * 0.8, window.innerHeight * 0.68, 620));
}

export function ShareQrOverlay({ url, onClose }: { url: string; onClose: () => void }) {
  const [qrSize, setQrSize] = useState(overlayQrSize);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const onResize = () => setQrSize(overlayQrSize());
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [onClose]);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="QR kód minihry"
      onClick={onClose}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-8 bg-white p-8"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Zavřít"
        className="absolute right-6 top-6 rounded-full p-3 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
      >
        <X className="h-8 w-8" />
      </button>
      <div onClick={(event) => event.stopPropagation()} className="flex flex-col items-center gap-8">
        <QRCodeSVG value={url} size={qrSize} level="M" />
        <p className="max-w-xl text-center text-xl text-slate-500">
          Naskenujte — žáci spustí tuhle hru
        </p>
      </div>
    </div>,
    window.document.body,
  );
}

export function ShareConfigQr({ url }: ShareConfigQrProps) {
  const [zoomed, setZoomed] = useState(false);

  if (!url) return null;

  return (
    <>
      <div className="flex flex-col items-center rounded-xl bg-white p-4 text-center">
        <p className="mb-3 text-sm font-medium text-slate-600">
          Naskenujte — žáci spustí tuhle hru
        </p>
        <button
          type="button"
          onClick={() => setZoomed(true)}
          className="rounded-xl bg-white p-2 transition-all hover:ring-4 hover:ring-orange-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-300"
          title="Zvětšit QR kód přes celou obrazovku"
          aria-label="Zvětšit QR kód přes celou obrazovku"
        >
          <QRCodeSVG value={url} size={196} level="M" />
        </button>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500">
          <Maximize2 className="h-3.5 w-3.5" />
          Klikni pro zvětšení
        </p>
      </div>
      {zoomed ? <ShareQrOverlay url={url} onClose={() => setZoomed(false)} /> : null}
    </>
  );
}
