import React from 'react';
import { motion } from 'motion/react';
import type { PrvoukaBoard } from './data/types';
import { DAY_PARTS, MONTHS, SEASONS, WEEK_DAYS, seasonOfMonth } from './data/games/cas';
import { BOX_PALETTES, PRVOUKA_COLORS, useIsMobile, type BoxPalette } from './PrvoukaKit';

export type BoardItemState = 'idle' | 'selected';

/** Barvy ročních období = pastelové krabice z Miniher: jaro zelená, léto žlutá, podzim oranžová, zima modrá. */
const SEASON_PALETTES: BoxPalette[] = [BOX_PALETTES.green, BOX_PALETTES.yellow, BOX_PALETTES.orange, BOX_PALETTES.blue];
const SEASON_ICON = ['🌷', '☀️', '🍂', '❄️'];

const DAYPART_SKY = [
  { sky: 'linear-gradient(180deg, #ffd7b0, #fff2c9)', sunX: 22, sunY: 78, sun: '#ffb54a' },
  { sky: 'linear-gradient(180deg, #a9dcff, #e4f4ff)', sunX: 35, sunY: 45, sun: '#ffd23f' },
  { sky: 'linear-gradient(180deg, #7cc8ff, #d2ecff)', sunX: 50, sunY: 25, sun: '#ffd23f' },
  { sky: 'linear-gradient(180deg, #a9dcff, #fff1c4)', sunX: 68, sunY: 45, sun: '#ffd23f' },
  { sky: 'linear-gradient(180deg, #ff9f7a, #ffd2a1)', sunX: 80, sunY: 82, sun: '#ff7a3d' },
  { sky: 'linear-gradient(180deg, #1d2a6b, #3a4aa0)', sunX: 62, sunY: 40, sun: '#f6f1c7' },
];

export function PrvoukaBoardView({ board, states, onTap, disabled }: { board: PrvoukaBoard; states: BoardItemState[]; onTap: (index: number) => void; disabled: boolean }) {
  const isMobile = useIsMobile();
  if (board === 'months') return <MonthWheel states={states} onTap={onTap} disabled={disabled} />;

  if (board === 'seasons') {
    return (
      <div className="grid w-full" style={{ gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))', gap: isMobile ? 10 : 20 }}>
        {SEASONS.map((season, index) => (
          <CardButton key={season} palette={SEASON_PALETTES[index]} selected={states[index] === 'selected'} onClick={() => onTap(index)} disabled={disabled} height={isMobile ? 120 : 170}>
            <span style={{ fontSize: isMobile ? 40 : 56, lineHeight: 1 }}>{SEASON_ICON[index]}</span>
            <span style={{ fontSize: isMobile ? 22 : 30, fontWeight: 700 }}>{season}</span>
          </CardButton>
        ))}
      </div>
    );
  }

  if (board === 'week') {
    return (
      <div className="grid w-full" style={{ gridTemplateColumns: isMobile ? 'repeat(4, minmax(0, 1fr))' : 'repeat(7, minmax(0, 1fr))', gap: isMobile ? 8 : 12 }}>
        {WEEK_DAYS.map((day, index) => (
          <CardButton
            key={day}
            palette={index >= 5 ? BOX_PALETTES.orange : BOX_PALETTES.blue}
            selected={states[index] === 'selected'}
            onClick={() => onTap(index)}
            disabled={disabled}
            height={isMobile ? 84 : 120}
          >
            <span style={{ fontSize: isMobile ? 24 : 34, fontWeight: 800, textTransform: 'uppercase' }}>{day.slice(0, 2)}</span>
            {!isMobile ? <span style={{ fontSize: 15, fontWeight: 700 }}>{day}</span> : null}
          </CardButton>
        ))}
      </div>
    );
  }

  return (
    <div className="grid w-full" style={{ gridTemplateColumns: isMobile ? 'repeat(3, minmax(0, 1fr))' : 'repeat(6, minmax(0, 1fr))', gap: isMobile ? 8 : 12 }}>
      {DAY_PARTS.map((part, index) => {
        const sky = DAYPART_SKY[index];
        const selected = states[index] === 'selected';
        return (
          <motion.button
            key={part}
            type="button"
            onClick={() => onTap(index)}
            disabled={disabled}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
            animate={{ scale: selected ? 1.06 : 1 }}
            className="flex flex-col overflow-hidden"
            style={{
              borderRadius: 18,
              backgroundColor: PRVOUKA_COLORS.CARD_BG,
              border: `3px solid ${selected ? PRVOUKA_COLORS.TEXT : PRVOUKA_COLORS.CARD_BORDER}`,
              boxShadow: `0 4px 0 ${PRVOUKA_COLORS.CARD_BORDER}`,
            }}
          >
            <span className="relative block" style={{ height: isMobile ? 60 : 90, background: sky.sky }}>
              <span
                className="absolute rounded-full"
                style={{ left: `${sky.sunX}%`, top: `${sky.sunY}%`, width: isMobile ? 22 : 30, height: isMobile ? 22 : 30, background: sky.sun, transform: 'translate(-50%, -50%)', boxShadow: `0 0 0 6px ${sky.sun}44` }}
              />
            </span>
            <span style={{ padding: '8px 4px 10px', fontSize: isMobile ? 16 : 20, fontWeight: 700, color: PRVOUKA_COLORS.TEXT, backgroundColor: selected ? '#FFF4E3' : undefined }}>{part}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

function CardButton({ palette, selected, onClick, disabled, height, children }: { palette: BoxPalette; selected: boolean; onClick: () => void; disabled: boolean; height: number; children: React.ReactNode }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.95 }}
      animate={{ scale: selected ? 1.06 : 1 }}
      className="flex flex-col items-center justify-center"
      style={{
        height,
        gap: 4,
        borderRadius: 20,
        backgroundColor: selected ? palette.back : palette.front,
        border: `4px solid ${palette.border}`,
        color: selected ? '#fff' : palette.border,
        boxShadow: `0 5px 0 ${palette.border}`,
      }}
    >
      {children}
    </motion.button>
  );
}

function polar(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: 180 + radius * Math.cos(rad), y: 180 + radius * Math.sin(rad) };
}

function wedgePath(index: number, outer: number, inner: number) {
  const start = index * 30 - 15;
  const end = start + 30;
  const a = polar(start, outer);
  const b = polar(end, outer);
  const c = polar(end, inner);
  const d = polar(start, inner);
  return `M${a.x},${a.y} A${outer},${outer} 0 0 1 ${b.x},${b.y} L${c.x},${c.y} A${inner},${inner} 0 0 0 ${d.x},${d.y} Z`;
}

/** Kolečko roku: leden nahoře, výseče v barvách ročních období. */
function MonthWheel({ states, onTap, disabled }: { states: BoardItemState[]; onTap: (index: number) => void; disabled: boolean }) {
  return (
    <svg viewBox="0 0 360 360" style={{ width: 'min(100%, 30rem, 56vh)', userSelect: 'none' }} role="group" aria-label="Měsíce v roce">
      {MONTHS.map((month, index) => {
        const palette = SEASON_PALETTES[seasonOfMonth(index)];
        const selected = states[index] === 'selected';
        const label = polar(index * 30, 124);
        return (
          <g
            key={month}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label={month}
            style={{ cursor: disabled ? 'default' : 'pointer', outline: 'none' }}
            onClick={() => !disabled && onTap(index)}
            onKeyDown={(event) => {
              if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
                event.preventDefault();
                onTap(index);
              }
            }}
          >
            <path d={wedgePath(index, 172, 72)} fill={selected ? palette.back : palette.front} stroke={palette.border} strokeWidth={selected ? 4 : 2.5} />
            <text x={label.x} y={label.y} fill={selected ? '#fff' : palette.border} fontSize="15" fontWeight="700" textAnchor="middle" dominantBaseline="central" style={{ pointerEvents: 'none' }}>
              {month}
            </text>
          </g>
        );
      })}
      <circle cx="180" cy="180" r="66" fill="#fff" stroke={PRVOUKA_COLORS.CARD_BORDER} strokeWidth="3" />
      {SEASON_ICON.map((icon, season) => {
        const p = polar([90, 180, 270, 0][season], 36);
        return (
          <text key={icon} x={p.x} y={p.y} fontSize="26" textAnchor="middle" dominantBaseline="central">
            {icon}
          </text>
        );
      })}
    </svg>
  );
}
