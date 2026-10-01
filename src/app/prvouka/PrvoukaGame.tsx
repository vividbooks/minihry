import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Volume2 } from 'lucide-react';
import { GameResultScreen } from '../components/GameResultScreen';
import { findPrvoukaGame, defaultPrvoukaTopics } from './data/catalog';
import { composeRound, createRandom, shuffle } from './data/random';
import { canSpeak, speakCzech, stopSpeaking } from './data/speech';
import type { PrvoukaChoiceOption, PrvoukaGame as PrvoukaGameData, PrvoukaGrade, PrvoukaQuestion } from './data/types';
import { usePrvoukaIllustrations, type IllustrationLookup } from './illustrations';
import {
  BOX_PALETTES,
  PRVOUKA_COLORS,
  PrvoukaBox,
  PrvoukaClock,
  PrvoukaFeedbackOverlay,
  PrvoukaPictureView,
  PrvoukaProgress,
  useIsMobile,
  type BoxPalette,
} from './PrvoukaKit';
import { PrvoukaBoardView, type BoardItemState } from './PrvoukaBoards';

const MAX_LIVES = 3;

export interface PrvoukaGameProps {
  /** Id hry z `data/catalog.ts` (zvirata, ovoce-zelenina, hodiny, rok-a-den, bezpecnost). */
  prvoukaGameId: string;
  /** Barva plochy, když odkaz nemá nastavení (z registru, stejná jako výchozí v konfigurátoru). */
  defaultBackground?: string;
  settings?: Record<string, any>;
}

function buildRound(game: PrvoukaGameData, grade: PrvoukaGrade, topics: string[], count: number, seed: number): PrvoukaQuestion[] {
  const random = createRandom(seed);
  const pool = game.buildPool({ grade, topics, random });
  return composeRound(pool, count, random).map((question) => {
    if (question.task.kind === 'choice' && (question.task.layout === 'grid' || question.task.layout === 'pictures')) {
      return { ...question, task: { ...question.task, options: shuffle(question.task.options, random) } };
    }
    return question;
  });
}

/** Co se přečte po klepnutí na reproduktor: zadání, popisek a textové možnosti. */
function spokenText(question: PrvoukaQuestion): string {
  const parts = [question.prompt];
  if (question.caption) parts.push(question.caption);
  const { task } = question;
  if (task.kind === 'choice' && task.layout !== 'yesno') {
    const labels = task.options.map((option) => option.label).filter(Boolean);
    if (labels.length > 0) parts.push(labels.join(', nebo '));
  }
  return parts.map((part) => part.replace(/[.?!]+$/, '')).join('. ') + '.';
}

/**
 * Jedna prvouková minihra. Chová se jako Rozřaď čísla: kolo má daný počet úloh,
 * chyba stojí srdíčko (bez opravy, jde se dál), po třech chybách hra končí.
 */
export function PrvoukaGame({ prvoukaGameId, defaultBackground, settings }: PrvoukaGameProps) {
  const game = findPrvoukaGame(prvoukaGameId);
  const grade: PrvoukaGrade = Number(settings?.grade) === 2 ? 2 : 1;
  const rounds = Math.max(3, Math.min(30, Number(settings?.rounds) || 10));
  const backgroundColor = settings?.backgroundColor || defaultBackground || PRVOUKA_COLORS.PAGE_BG;
  const topics: string[] = useMemo(() => {
    if (!game) return [];
    const chosen = Array.isArray(settings?.topics) ? settings.topics.filter((id: string) => game.topics.some((topic) => topic.id === id)) : [];
    return chosen.length > 0 ? chosen : defaultPrvoukaTopics(game, grade);
  }, [game, grade, settings?.topics]);

  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e9));
  const questions = useMemo(() => (game ? buildRound(game, grade, topics, rounds, seed) : []), [game, grade, topics, rounds, seed]);
  const illustrations = usePrvoukaIllustrations();
  const isMobile = useIsMobile();

  const [index, setIndex] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; hint?: string } | null>(null);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState<'success' | 'failure' | null>(null);
  const livesRef = useRef(lives);
  livesRef.current = lives;

  useEffect(() => () => stopSpeaking(), []);
  useEffect(() => stopSpeaking(), [index]);

  const question = questions[index];
  const total = questions.length;

  const answer = useCallback((isCorrect: boolean) => {
    if (locked || !question) return;
    setLocked(true);
    if (!isCorrect) setLives((value) => Math.max(0, value - 1));
    setFeedback({ isCorrect, hint: question.hint });
  }, [locked, question]);

  const afterFeedback = useCallback(() => {
    setFeedback(null);
    const outOfLives = livesRef.current <= 0;
    if (outOfLives || index + 1 >= total) {
      setResult(outOfLives ? 'failure' : 'success');
      return;
    }
    setIndex((value) => value + 1);
    setLocked(false);
  }, [index, total]);

  const restart = () => {
    setSeed(Math.floor(Math.random() * 1e9));
    setIndex(0);
    setLives(MAX_LIVES);
    setFeedback(null);
    setLocked(false);
    setResult(null);
  };

  if (!game || !question) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center p-6 text-center" style={{ backgroundColor, color: PRVOUKA_COLORS.TEXT }}>
        <p className="text-2xl font-bold">Pro zvolená témata tu zatím nejsou žádné úlohy.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col overflow-hidden" style={{ backgroundColor, minHeight: '100svh', color: PRVOUKA_COLORS.TEXT }}>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 sm:gap-6 p-3 sm:p-6 md:p-8 min-h-0" style={{ paddingTop: isMobile ? 24 : 40 }}>
        <div className="flex items-center justify-center gap-3 max-w-4xl text-center">
          <h1 style={{ fontSize: isMobile ? 26 : 40, fontWeight: 700, lineHeight: 1.15, color: PRVOUKA_COLORS.TEXT }}>{question.prompt}</h1>
          {canSpeak() ? (
            <button
              type="button"
              onClick={() => speakCzech(spokenText(question))}
              className="flex-shrink-0 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
              style={{ width: isMobile ? 40 : 52, height: isMobile ? 40 : 52, backgroundColor: '#fff', border: `3px solid ${PRVOUKA_COLORS.CARD_BORDER}`, color: PRVOUKA_COLORS.TEXT }}
              aria-label="Přečíst nahlas"
            >
              <Volume2 size={isMobile ? 20 : 26} />
            </button>
          ) : null}
        </div>

        <QuestionView key={`${seed}:${index}`} question={question} illustrations={illustrations} locked={locked} onAnswer={answer} />

        <PrvoukaProgress current={index + 1} total={total} lives={lives} maxLives={MAX_LIVES} />
      </div>

      <AnimatePresence>
        {feedback ? <PrvoukaFeedbackOverlay isCorrect={feedback.isCorrect} hint={feedback.hint} onComplete={afterFeedback} /> : null}
      </AnimatePresence>

      {result ? (
        <GameResultScreen
          isSuccess={result === 'success'}
          onContinue={restart}
          successText={['Skvělá práce! 🎯', 'Výborně! ⭐', 'Perfektní! 🏆', 'Máš to! 🌟'][seed % 4]}
          failureText={['Zkus to znovu! 🤔', 'Další pokus! 💪', 'Neboj se, zvládneš to! 🌟'][seed % 3]}
          showContinueButton
          displayType="gameComplete"
        />
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ úlohy */

interface QuestionViewProps {
  question: PrvoukaQuestion;
  illustrations: IllustrationLookup;
  locked: boolean;
  onAnswer: (isCorrect: boolean) => void;
}

function QuestionView({ question, illustrations, locked, onAnswer }: QuestionViewProps) {
  const { task } = question;
  if (task.kind === 'choice' && task.layout === 'baskets') {
    return <SortView question={question} options={task.options} illustrations={illustrations} locked={locked} onAnswer={onAnswer} />;
  }
  if (task.kind === 'choice') {
    return <ChoiceView question={question} options={task.options} layout={task.layout} illustrations={illustrations} locked={locked} onAnswer={onAnswer} />;
  }
  if (task.kind === 'clock-set') {
    return <ClockView question={question} hour={task.hour} minute={task.minute} step={task.step} show24={task.show24} illustrations={illustrations} locked={locked} onAnswer={onAnswer} />;
  }
  return <BoardView question={question} illustrations={illustrations} locked={locked} onAnswer={onAnswer} />;
}

/** Bílá kartička s obrázkem a popiskem – jako kartička v Rozřaď čísla. */
function ItemCard({ question, illustrations, size }: { question: PrvoukaQuestion; illustrations: IllustrationLookup; size: number }) {
  if (!question.picture && !question.caption) return null;
  const hasPicture = Boolean(question.picture);
  const isStatement = !hasPicture || question.captionStyle === 'bubble';
  if (isStatement && question.caption) {
    return (
      <div className="flex items-center gap-3 sm:gap-5 max-w-3xl">
        {hasPicture && question.picture ? <PrvoukaPictureView picture={question.picture} illustrations={illustrations} size={size * 0.75} /> : null}
        <div
          className="text-center"
          style={{
            backgroundColor: PRVOUKA_COLORS.CARD_BG,
            border: `3px solid ${PRVOUKA_COLORS.CARD_BORDER}`,
            borderRadius: 24,
            padding: '18px 26px',
            fontSize: size < 150 ? 20 : 28,
            fontWeight: 700,
            lineHeight: 1.3,
          }}
        >
          {question.caption}
        </div>
      </div>
    );
  }
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        width: size,
        minHeight: size,
        backgroundColor: PRVOUKA_COLORS.CARD_BG,
        border: `${size < 100 ? 2 : 3}px solid ${PRVOUKA_COLORS.CARD_BORDER}`,
        borderRadius: size < 100 ? 8 : 12,
        padding: size * 0.06,
        gap: size * 0.03,
      }}
    >
      {question.picture ? <PrvoukaPictureView picture={question.picture} illustrations={illustrations} size={size * (question.caption ? 0.72 : 0.86)} /> : null}
      {question.caption ? (
        <div style={{ fontSize: Math.max(16, size * 0.1), fontWeight: 700, lineHeight: 1.1, textAlign: 'center' }}>{question.caption}</div>
      ) : null}
    </div>
  );
}

const SORT_PALETTES: BoxPalette[] = [BOX_PALETTES.green, BOX_PALETTES.orange, BOX_PALETTES.blue];

/** Třídění: kartička nahoře sjede do zvolené krabice (jako Rozřaď čísla). */
function SortView({ question, options, illustrations, locked, onAnswer }: { question: PrvoukaQuestion; options: PrvoukaChoiceOption[]; illustrations: IllustrationLookup; locked: boolean; onAnswer: (ok: boolean) => void }) {
  const isMobile = useIsMobile();
  const [target, setTarget] = useState<string | null>(null);
  const [sliding, setSliding] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const boxRefs = useRef(new Map<string, HTMLDivElement>());
  const boxSize = isMobile ? (options.length > 2 ? 104 : 140) : options.length > 2 ? 230 : 260;
  const cardSize = isMobile ? 130 : 230;
  const labelLength = Math.max(...options.flatMap((option) => option.label.split(' ').map((word) => word.length)));

  const choose = (option: PrvoukaChoiceOption) => {
    if (locked || target) return;
    setTarget(option.id);
    setTimeout(() => {
      setSliding(true);
      setTimeout(() => onAnswer(option.correct), 700);
    }, 550);
  };

  const offsetX = () => {
    const box = target ? boxRefs.current.get(target) : null;
    const container = containerRef.current;
    if (!box || !container) return 0;
    const boxRect = box.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    return boxRect.left + boxRect.width / 2 - (containerRect.left + containerRect.width / 2);
  };

  return (
    <div ref={containerRef} className="relative flex flex-col items-center w-full max-w-6xl" style={{ gap: isMobile ? 16 : 32 }}>
      <motion.div
        style={{ zIndex: sliding ? 5 : 50 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ x: target ? offsetX() : 0, y: sliding ? (isMobile ? 150 : 300) : 0, scale: sliding ? 0.6 : 1, opacity: sliding ? 0 : 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <ItemCard question={question} illustrations={illustrations} size={cardSize} />
      </motion.div>
      <div className="flex items-end justify-center w-full px-2" style={{ gap: isMobile ? 10 : 48 }}>
        {options.map((option, position) => (
          <div
            key={option.id}
            ref={(element) => {
              if (element) boxRefs.current.set(option.id, element);
              else boxRefs.current.delete(option.id);
            }}
            className="flex-shrink-0"
          >
            <PrvoukaBox
              label={option.label}
              palette={SORT_PALETTES[position % SORT_PALETTES.length]}
              size={boxSize}
              onClick={() => choose(option)}
              isHighlighted={target === option.id}
              labelLength={labelLength}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Výběr odpovědi: velká kartička s obrázkem, pod ní karty s možnostmi. */
function ChoiceView({
  question,
  options,
  layout,
  illustrations,
  locked,
  onAnswer,
}: {
  question: PrvoukaQuestion;
  options: PrvoukaChoiceOption[];
  layout: 'grid' | 'yesno' | 'pictures';
  illustrations: IllustrationLookup;
  locked: boolean;
  onAnswer: (ok: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [chosen, setChosen] = useState<string | null>(null);
  const choose = (option: PrvoukaChoiceOption) => {
    if (locked || chosen) return;
    setChosen(option.id);
    setTimeout(() => onAnswer(option.correct), 350);
  };
  const cardSize = isMobile ? 170 : 260;

  if (layout === 'yesno') {
    return (
      <div className="flex flex-col items-center w-full" style={{ gap: isMobile ? 18 : 32 }}>
        <ItemCard question={question} illustrations={illustrations} size={cardSize} />
        <div className="flex justify-center" style={{ gap: isMobile ? 16 : 40 }}>
          {options.map((option) => {
            const yes = option.id === 'ano';
            const palette = yes ? BOX_PALETTES.green : BOX_PALETTES.pink;
            return (
              <motion.button
                key={option.id}
                type="button"
                onClick={() => choose(option)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{ scale: chosen === option.id ? 1.08 : 1 }}
                className="flex flex-col items-center justify-center"
                style={{
                  width: isMobile ? 130 : 200,
                  height: isMobile ? 120 : 170,
                  borderRadius: 24,
                  backgroundColor: palette.front,
                  border: `4px solid ${palette.border}`,
                  color: palette.border,
                  boxShadow: `0 6px 0 ${palette.border}`,
                }}
              >
                <span style={{ fontSize: isMobile ? 48 : 72, lineHeight: 1, fontWeight: 800 }}>{yes ? '✓' : '✗'}</span>
                <span style={{ fontSize: isMobile ? 24 : 32, fontWeight: 700 }}>{option.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  const pictures = layout === 'pictures';
  return (
    <div className={`flex items-center justify-center w-full ${pictures ? 'flex-col' : 'flex-col lg:flex-row'}`} style={{ gap: isMobile ? 18 : 40 }}>
      {question.picture || question.caption ? <ItemCard question={question} illustrations={illustrations} size={cardSize} /> : null}
      <div
        className="grid w-full"
        style={{
          gap: isMobile ? 10 : 16,
          maxWidth: pictures ? 780 : 520,
          gridTemplateColumns: pictures ? `repeat(${options.length}, minmax(0, 1fr))` : options.length === 4 && !isMobile ? 'repeat(2, minmax(0, 1fr))' : '1fr',
        }}
      >
        {options.map((option) => (
          <motion.button
            key={option.id}
            type="button"
            onClick={() => choose(option)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            animate={{ scale: chosen === option.id ? 1.05 : 1 }}
            className="flex flex-col items-center justify-center text-center"
            style={{
              minHeight: pictures ? undefined : isMobile ? 56 : 72,
              padding: pictures ? 10 : '12px 18px',
              borderRadius: 18,
              backgroundColor: chosen === option.id ? '#FFF4E3' : PRVOUKA_COLORS.CARD_BG,
              border: `3px solid ${chosen === option.id ? PRVOUKA_COLORS.TEXT : PRVOUKA_COLORS.CARD_BORDER}`,
              color: PRVOUKA_COLORS.TEXT,
              fontSize: isMobile ? 20 : 26,
              fontWeight: 700,
              lineHeight: 1.2,
              boxShadow: `0 4px 0 ${PRVOUKA_COLORS.CARD_BORDER}`,
            }}
          >
            {option.picture ? <PrvoukaPictureView picture={option.picture} illustrations={illustrations} size={isMobile ? 80 : 150} /> : null}
            {option.label ? <span style={{ fontSize: pictures ? (isMobile ? 16 : 20) : undefined }}>{option.label}</span> : null}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/** Nastav hodiny: velké hodiny s ručičkami na tažení a kulaté potvrzovací tlačítko. */
function ClockView({
  question,
  hour,
  minute,
  step,
  show24,
  illustrations,
  locked,
  onAnswer,
}: {
  question: PrvoukaQuestion;
  hour: number;
  minute: number;
  step: number;
  show24?: boolean;
  illustrations: IllustrationLookup;
  locked: boolean;
  onAnswer: (ok: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [time, setTime] = useState(() => ({ hour: (hour + 4) % 12, minute: (minute + (step >= 30 ? 30 : 20)) % 60 }));
  const size = isMobile ? 260 : 360;
  return (
    <div className="flex flex-col lg:flex-row items-center justify-center" style={{ gap: isMobile ? 16 : 48 }}>
      {question.picture ? <PrvoukaPictureView picture={question.picture} illustrations={illustrations} size={isMobile ? 160 : 240} /> : null}
      <div className="flex flex-col items-center" style={{ gap: 14 }}>
        <PrvoukaClock
          hour={time.hour}
          minute={time.minute}
          size={size}
          step={step}
          show24={show24}
          onChange={(nextHour, nextMinute) => !locked && setTime({ hour: nextHour, minute: nextMinute })}
        />
        <p style={{ fontSize: isMobile ? 15 : 18, fontWeight: 600, opacity: 0.8 }}>Táhni za ručičky – malá ukazuje hodiny, velká minuty.</p>
      </div>
      <motion.button
        type="button"
        onClick={() => !locked && onAnswer(time.hour % 12 === hour % 12 && time.minute === minute)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="rounded-full flex items-center justify-center text-white"
        style={{ width: isMobile ? 64 : 84, height: isMobile ? 64 : 84, backgroundColor: '#2C3F98', fontSize: isMobile ? 32 : 44, fontWeight: 800, boxShadow: '0 5px 0 #1d2a6b' }}
        aria-label="Hotovo"
      >
        ✓
      </motion.button>
    </div>
  );
}

/** Kruh měsíců, roční období, týden, části dne. */
function BoardView({ question, illustrations, locked, onAnswer }: { question: PrvoukaQuestion; illustrations: IllustrationLookup; locked: boolean; onAnswer: (ok: boolean) => void }) {
  const isMobile = useIsMobile();
  const task = question.task as Extract<PrvoukaQuestion['task'], { kind: 'board' }>;
  const size = task.board === 'months' ? 12 : task.board === 'week' ? 7 : task.board === 'dayparts' ? 6 : 4;
  const multi = task.mode === 'all' && task.correct.length > 1;
  const [selected, setSelected] = useState<number[]>([]);

  const tap = (item: number) => {
    if (locked) return;
    if (!multi) {
      setSelected([item]);
      setTimeout(() => onAnswer(task.correct.includes(item)), 300);
      return;
    }
    setSelected((list) => (list.includes(item) ? list.filter((value) => value !== item) : [...list, item]));
  };

  const confirm = () => {
    if (locked || selected.length === 0) return;
    onAnswer(selected.length === task.correct.length && selected.every((item) => task.correct.includes(item)));
  };

  const states: BoardItemState[] = Array.from({ length: size }, (_, item) => (selected.includes(item) ? 'selected' : 'idle'));
  return (
    <div className="flex flex-col lg:flex-row items-center justify-center w-full" style={{ gap: isMobile ? 16 : 40 }}>
      {question.picture || question.caption ? <ItemCard question={question} illustrations={illustrations} size={isMobile ? 150 : 220} /> : null}
      <div className="flex flex-col items-center w-full" style={{ gap: 16, maxWidth: task.board === 'months' ? 520 : 900 }}>
        <PrvoukaBoardView board={task.board} states={states} onTap={tap} disabled={locked} />
        {multi ? (
          <motion.button
            type="button"
            onClick={confirm}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            disabled={selected.length === 0}
            className="rounded-full flex items-center justify-center text-white disabled:opacity-40"
            style={{ width: 72, height: 72, backgroundColor: '#2C3F98', fontSize: 38, fontWeight: 800, boxShadow: '0 5px 0 #1d2a6b' }}
            aria-label="Hotovo"
          >
            ✓
          </motion.button>
        ) : null}
      </div>
    </div>
  );
}
