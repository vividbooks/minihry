/** Semínkový generátor (mulberry32) — stejné semínko dá stejné kolo. */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)];
}

/** Vybere `count` různých prvků (méně, když jich tolik není). */
export function pickMany<T>(items: readonly T[], count: number, random: () => number): T[] {
  return shuffle(items, random).slice(0, count);
}

/**
 * Sestaví kolo ze zásobníku: zamíchá, střídá témata (podle prefixu klíče před `:`)
 * a nic neopakuje, dokud zásobník stačí.
 */
export function composeRound<T extends { key: string }>(pool: readonly T[], count: number, random: () => number): T[] {
  const byTopic = new Map<string, T[]>();
  for (const item of shuffle(pool, random)) {
    const topic = item.key.split(':')[0];
    const list = byTopic.get(topic) ?? [];
    list.push(item);
    byTopic.set(topic, list);
  }
  const topics = shuffle([...byTopic.keys()], random);
  const round: T[] = [];
  while (round.length < count && topics.some((topic) => (byTopic.get(topic)?.length ?? 0) > 0)) {
    for (const topic of topics) {
      const next = byTopic.get(topic)?.shift();
      if (next) round.push(next);
      if (round.length >= count) break;
    }
  }
  // Témata jsou zastoupená rovnoměrně, ale pořadí v kole nemá být předvídatelné.
  return shuffle(round, random);
}
