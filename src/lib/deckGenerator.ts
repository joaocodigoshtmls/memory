import type { CardData, LevelConfig } from '@/types/memory';
import { levelsConfig } from './levelsConfig';

/**
 * Symbol pools organized by complexity tiers.
 * Each tier can be expanded with domain-specific icons/emojis.
 */
const SYMBOL_POOLS = {
  basic: ['🌟', '🎯', '🔥', '💎', '🌸', '🍎', '🎨', '⚡'],
  intermediate: ['🦋', '🌊', '🎭', '🎪', '🎬', '🎸', '🎮', '🎲', '🏆', '🔮', '🌈', '🚀'],
  advanced: [
    '🦄',
    '🐉',
    '🦅',
    '🦊',
    '🐺',
    '🦁',
    '🐯',
    '🐘',
    '🦒',
    '🦜',
    '🦩',
    '🦚',
    '🦢',
    '🦫',
    '🦦',
    '🦥',
  ],
};

/**
 * Category labels for cognitive grouping hooks.
 */
const CATEGORY_LABELS = ['animals', 'nature', 'objects', 'abstract'];

/**
 * Fisher-Yates shuffle algorithm for randomization.
 */
function fisherYatesShuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Selects symbol pool based on level difficulty.
 */
function selectSymbolPool(levelId: string): string[] {
  if (levelId === 'focus-start') return SYMBOL_POOLS.basic;
  if (levelId === 'adaptive-loop') return SYMBOL_POOLS.intermediate;
  if (levelId === 'loci-journey') return SYMBOL_POOLS.advanced;
  return SYMBOL_POOLS.basic;
}

/**
 * Generates a shuffled deck of cards with metadata based on level configuration.
 *
 * @param levelId - The ID of the level to generate the deck for
 * @returns An array of CardData with all necessary metadata
 */
export function generateDeck(levelId: string): CardData[] {
  const config = levelsConfig.find((lvl) => lvl.id === levelId);

  if (!config) {
    throw new Error(`Level configuration not found for levelId: ${levelId}`);
  }

  const symbolPool = selectSymbolPool(levelId);
  const requiredSymbols = config.cardPairs;

  if (requiredSymbols > symbolPool.length) {
    throw new Error(
      `Not enough symbols in pool (${symbolPool.length}) for ${requiredSymbols} pairs`
    );
  }

  const selectedSymbols = symbolPool.slice(0, requiredSymbols);

  const hasCategoricalGrouping = config.difficultyHooks.includes('categorical-grouping');
  const hasMnemonicCue = config.difficultyHooks.includes('mnemonic-cue');
  const hasLociEnvironment = config.difficultyHooks.includes('loci-environment');
  const hasSpacedRepetition = config.difficultyHooks.includes('spaced-repetition');

  const cards: CardData[] = selectedSymbols.flatMap((symbol, pairIndex) => {
    const pairId = `${levelId}-pair-${pairIndex}`;
    const category = hasCategoricalGrouping
      ? CATEGORY_LABELS[pairIndex % CATEGORY_LABELS.length]
      : 'neutral';

    const baseCard: CardData = {
      id: `${pairId}-a`,
      value: symbol,
      pairId,
      category,
      metadata: {
        cues: {
          mnemonicStrategy: hasMnemonicCue
            ? `mnemonic-${symbol}-${pairIndex}`
            : undefined,
          visualHint: hasLociEnvironment ? `loci-position-${pairIndex}` : undefined,
          auditoryHint: undefined,
        },
        tags: inferCardTags(symbol),
        rehearsalHistory: hasSpacedRepetition ? [] : undefined,
      },
    };

    const mirrorCard: CardData = {
      ...baseCard,
      id: `${pairId}-b`,
    };

    return [baseCard, mirrorCard];
  });

  return fisherYatesShuffle(cards);
}

/**
 * Infers semantic tags from symbol for future cognitive hooks.
 */
function inferCardTags(
  symbol: string
): Array<'symbol' | 'color' | 'sound' | 'location' | 'concept'> {
  const tags: Array<'symbol' | 'color' | 'sound' | 'location' | 'concept'> = ['symbol'];

  const animalEmojis = [
    '🦋',
    '🐉',
    '🦅',
    '🦊',
    '🐺',
    '🦁',
    '🐯',
    '🐘',
    '🦒',
    '🦜',
    '🦩',
    '🦚',
    '🦢',
    '🦫',
    '🦦',
    '🦥',
  ];
  const natureEmojis = ['🌟', '🌸', '🌊', '🌈'];
  const objectEmojis = [
    '🎯',
    '💎',
    '🍎',
    '🎨',
    '🎭',
    '🎪',
    '🎬',
    '🎸',
    '🎮',
    '🎲',
    '🏆',
    '🔮',
    '🚀',
  ];

  if (animalEmojis.includes(symbol)) {
    tags.push('concept');
  } else if (natureEmojis.includes(symbol)) {
    tags.push('color', 'concept');
  } else if (objectEmojis.includes(symbol)) {
    tags.push('concept');
  }

  return tags;
}
