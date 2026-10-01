import type { PrvoukaChoiceOption, PrvoukaGame, PrvoukaQuestion } from '../types';

/** 2. pád řadové číslovky v ženském rodě: půl osmé. */
const HALF_ORDINAL = ['', 'jedné', 'druhé', 'třetí', 'čtvrté', 'páté', 'šesté', 'sedmé', 'osmé', 'deváté', 'desáté', 'jedenácté', 'dvanácté'];
/** 4. pád základní číslovky: čtvrt na osm, čtvrt na jednu. */
const QUARTER_TARGET = ['', 'jednu', 'dvě', 'tři', 'čtyři', 'pět', 'šest', 'sedm', 'osm', 'devět', 'deset', 'jedenáct', 'dvanáct'];

function twelve(hour: number): number {
  const h = hour % 12;
  return h === 0 ? 12 : h;
}

function next(hour: number): number {
  return twelve(twelve(hour) + 1);
}

export function hoursWord(hour: number): string {
  if (hour === 1) return '1 hodina';
  if (hour >= 2 && hour <= 4) return `${hour} hodiny`;
  return `${hour} hodin`;
}

/** Čas slovy tak, jak ho čte žák 1. a 2. ročníku. */
export function timeInWords(hour: number, minute: number): string {
  const h = twelve(hour);
  if (minute === 0) return hoursWord(h);
  if (minute === 30) return `půl ${HALF_ORDINAL[next(h)]}`;
  if (minute === 15) return `čtvrt na ${QUARTER_TARGET[next(h)]}`;
  if (minute === 45) return `tři čtvrtě na ${QUARTER_TARGET[next(h)]}`;
  return `${h}:${String(minute).padStart(2, '0')}`;
}

export function digital(hour: number, minute: number): string {
  return `${hour}:${String(minute).padStart(2, '0')}`;
}

function wordOptions(hour: number, minute: number): PrvoukaChoiceOption[] {
  const h = twelve(hour);
  const correct = timeInWords(h, minute);
  const candidates = new Set<string>();
  // Typické záměny: půl osmé × půl sedmé, čtvrt na osm × čtvrt na sedm, ručičky prohozené.
  if (minute === 0) {
    candidates.add(hoursWord(next(h)));
    candidates.add(hoursWord(twelve(h + 11)));
    candidates.add(`půl ${HALF_ORDINAL[next(h)]}`);
  } else if (minute === 30) {
    candidates.add(`půl ${HALF_ORDINAL[h]}`);
    candidates.add(hoursWord(h));
    candidates.add(hoursWord(next(h)));
  } else {
    const other = minute === 15 ? 45 : 15;
    candidates.add(timeInWords(h, other));
    candidates.add(minute === 15 ? `čtvrt na ${QUARTER_TARGET[h]}` : `tři čtvrtě na ${QUARTER_TARGET[h]}`);
    candidates.add(`půl ${HALF_ORDINAL[next(h)]}`);
  }
  candidates.delete(correct);
  const wrong = [...candidates].slice(0, 2);
  return [correct, ...wrong].map((label) => ({ id: label, label, correct: label === correct }));
}

function digitalOptions(hour24: number, minute: number): PrvoukaChoiceOption[] {
  const correct = digital(hour24, minute);
  const candidates = new Set<string>([
    digital((hour24 + 1) % 24, minute),
    digital(hour24, minute === 30 ? 0 : 30),
    // O hodinu méně: malá ručička je při „půl“ ještě před další hodinou.
    digital(hour24 >= 12 ? (hour24 + 11) % 24 : (hour24 + 23) % 24, minute),
  ]);
  candidates.delete(correct);
  return [correct, ...[...candidates].slice(0, 2)].map((label) => ({ id: label, label, correct: label === correct }));
}

const DAY_PARTS_24: Array<{ from: number; to: number; label: string }> = [
  { from: 5, to: 9, label: 'ráno' },
  { from: 9, to: 12, label: 'dopoledne' },
  { from: 12, to: 13, label: 'v poledne' },
  { from: 13, to: 18, label: 'odpoledne' },
  { from: 18, to: 22, label: 'večer' },
  { from: 22, to: 24, label: 'v noci' },
  { from: 0, to: 5, label: 'v noci' },
];

function dayPartLabel(hour24: number): string {
  return DAY_PARTS_24.find((part) => hour24 >= part.from && hour24 < part.to)?.label ?? '';
}

function minutesFor(topic: string): number[] {
  if (topic === 'cele') return [0];
  if (topic === 'pul') return [30];
  if (topic === 'ctvrt') return [15, 45];
  return [0, 15, 30, 45];
}

export const hodinyGame: PrvoukaGame = {
  id: 'hodiny',
  name: 'Hodiny',
  tagline: 'Kolik je hodin? Nastav ručičky.',
  accent: '#2c3f98',
  surface: '#e2f0ff',
  titleColor: '#4e2bf3',
  cover: { kind: 'clock', hour: 7, minute: 30 },
  topics: [
    { id: 'cele', label: 'Celé hodiny', defaultGrades: [1, 2], pages: '1/1/33' },
    { id: 'pul', label: 'Půl hodiny', defaultGrades: [1, 2], pages: '1/1/33' },
    { id: 'ctvrt', label: 'Čtvrt a tři čtvrtě', defaultGrades: [2], pages: '2/1/39' },
    { id: 'digitalni', label: 'Digitální hodiny', defaultGrades: [2], pages: '2/1/39–40' },
  ],
  buildPool: ({ grade, topics }) => {
    const pool: PrvoukaQuestion[] = [];
    // Nastavování ručiček: v 1. ročníku skáče velká ručička po půlhodinách, ve 2. po pěti minutách.
    const step = grade === 1 ? 30 : 5;
    for (const topic of topics) {
      if (topic === 'digitalni') {
        for (let hour24 = 6; hour24 <= 21; hour24 += 1) {
          for (const minute of [0, 30, 15, 45]) {
            if (grade === 1 && (minute === 15 || minute === 45)) continue;
            const text = digital(hour24, minute);
            const note = dayPartLabel(hour24);
            pool.push({
              key: `digitalni:cti:${text}`,
              prompt: 'Které digitální hodiny ukazují stejný čas?',
              icons: ['pozoruj'],
              picture: { kind: 'clock', hour: hour24, minute, show24: true },
              caption: note ? `Je ${note}.` : undefined,
              task: { kind: 'choice', layout: 'grid', options: digitalOptions(hour24, minute) },
              hint: `Malá ručička ukazuje hodiny, velká minuty. ${note ? `Je ${note}, proto ${text}.` : ''}`,
            });
            pool.push({
              key: `digitalni:nastav:${text}`,
              prompt: 'Nastav ručičky podle digitálních hodin.',
              icons: ['modeluj'],
              picture: { kind: 'digital', text, note },
              task: { kind: 'clock-set', hour: hour24 % 12, minute, step: minute % 15 === 0 && grade === 1 ? 30 : step, show24: true },
              hint: `${text} je ${timeInWords(hour24, minute)}.`,
            });
          }
        }
        continue;
      }
      for (const minute of minutesFor(topic)) {
        for (let hour = 1; hour <= 12; hour += 1) {
          const words = timeInWords(hour, minute);
          pool.push({
            key: `${topic}:cti:${hour}:${minute}`,
            prompt: 'Kolik je hodin?',
            icons: ['pozoruj'],
            picture: { kind: 'clock', hour, minute },
            task: { kind: 'choice', layout: 'grid', options: wordOptions(hour, minute) },
            hint: minute === 0
              ? 'Velká ručička je nahoře na dvanáctce, malá ukazuje hodinu.'
              : minute === 30
                ? 'Velká ručička je dole na šestce. Malá je napůl cesty k další hodině – proto „půl“ té další.'
                : 'Velká ručička na trojce je čtvrt, na devítce tři čtvrtě – vždy „na“ další hodinu.',
          });
          pool.push({
            key: `${topic}:nastav:${hour}:${minute}`,
            prompt: `Nastav na hodinách: ${words}.`,
            icons: ['modeluj'],
            task: { kind: 'clock-set', hour: hour % 12, minute, step: Math.min(step, minute === 0 ? 30 : minute % 30 === 0 ? 30 : 15) },
            hint: `${words} = ${digital(hour, minute)}.`,
          });
        }
      }
    }
    return pool;
  },
};
