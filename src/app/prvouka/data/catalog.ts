import type { PrvoukaGame, PrvoukaGrade } from './types';
import { hodinyGame } from './games/hodiny';
import { casGame } from './games/cas';
import { ovoceGame } from './games/ovoce';
import { zvirataGame } from './games/zvirata';
import { bezpecnostGame } from './games/bezpecnost';

/** Minihry prvouky v pořadí, jak je ukazuje rozcestník. */
export const PRVOUKA_GAMES: PrvoukaGame[] = [zvirataGame, ovoceGame, hodinyGame, casGame, bezpecnostGame];

export function findPrvoukaGame(id: string | null | undefined): PrvoukaGame | undefined {
  return PRVOUKA_GAMES.find((game) => game.id === id);
}

export function defaultPrvoukaTopics(game: PrvoukaGame, grade: PrvoukaGrade): string[] {
  return game.topics.filter((topic) => topic.defaultGrades.includes(grade)).map((topic) => topic.id);
}

export const PRVOUKA_QUESTION_COUNTS = [5, 10, 15, 20] as const;
