/**
 * Mnemonic Hints System
 * 
 * Provides cognitive cues and grouping suggestions to help players
 * create mental associations and improve memory encoding.
 */

import type { CardData } from '@/types/memory';

export type MnemonicHint = {
  text: string;
  type: 'visual' | 'story' | 'association' | 'category';
};

export type CategoryGroup = {
  category: string;
  cards: string[];
  hint: string;
  color: string;
};

/**
 * Category-specific colors for visual grouping.
 */
export const CATEGORY_COLORS: Record<string, string> = {
  animals: 'border-amber-400 bg-amber-500/10',
  nature: 'border-green-400 bg-green-500/10',
  objects: 'border-blue-400 bg-blue-500/10',
  abstract: 'border-purple-400 bg-purple-500/10',
  neutral: 'border-white/20 bg-white/5',
};

/**
 * Generates mnemonic hints for a given symbol/value.
 */
export function generateMnemonicHint(symbol: string, category: string): MnemonicHint {
  // Animal-related hints
  const animalHints: Record<string, string> = {
    '🦋': 'Imagine a butterfly dancing in your memory palace',
    '🐉': 'Picture a dragon guarding this card in your mind',
    '🦅': 'Visualize an eagle soaring to remember this position',
    '🦊': 'Think of a clever fox hiding in this location',
    '🐺': 'A wolf howling at the moon marks this spot',
    '🦁': 'A majestic lion stands guard here',
    '🐯': 'A tiger prowls through this mental space',
    '🐘': 'An elephant never forgets - place it here mentally',
  };

  // Nature-related hints
  const natureHints: Record<string, string> = {
    '🌟': 'A bright star illuminates this memory point',
    '🌸': 'A flower blooms in this corner of your mind',
    '🌊': 'Ocean waves wash over this location',
    '🌈': 'A rainbow arcs across this mental position',
  };

  // Object-related hints
  const objectHints: Record<string, string> = {
    '🎯': 'Target locked on this memory location',
    '💎': 'A precious gem marks this valuable spot',
    '🍎': 'A crisp apple sits at this position',
    '🎨': 'Paint this location with vivid colors',
    '🎭': 'Drama unfolds at this memory stage',
    '🏆': 'A trophy stands proudly in this place',
    '🔮': 'Crystal ball reveals this position',
    '🚀': 'Launch into memory from this point',
  };

  const allHints = { ...animalHints, ...natureHints, ...objectHints };
  const hintText = allHints[symbol];

  if (hintText) {
    return {
      text: hintText,
      type: category === 'animals' ? 'visual' : category === 'nature' ? 'story' : 'association',
    };
  }

  // Fallback generic hint
  return {
    text: `Associate ${symbol} with a memorable location or story`,
    type: 'association',
  };
}

/**
 * Groups cards by category and generates grouping hints.
 */
export function generateCategoryGroups(deck: CardData[]): CategoryGroup[] {
  const categoryMap = new Map<string, CardData[]>();

  // Group cards by category
  deck.forEach((card) => {
    const category = card.category || 'neutral';
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(card);
  });

  // Generate hints for each category
  const categoryHints: Record<string, string> = {
    animals: '🐾 Grupo Animais: Crie uma história conectando esses seres vivos',
    nature: '🌿 Grupo Natureza: Visualize um ambiente natural unindo esses elementos',
    objects: '🎁 Grupo Objetos: Imagine esses itens em um mesmo local físico',
    abstract: '✨ Grupo Abstrato: Conecte esses símbolos através de uma emoção',
    neutral: '⚪ Itens Variados: Use técnicas diversas para memorizar',
  };

  const groups: CategoryGroup[] = [];
  categoryMap.forEach((cards, category) => {
    // Only include groups with multiple pairs
    if (cards.length >= 2) {
      groups.push({
        category,
        cards: cards.map((c) => c.value),
        hint: categoryHints[category] || categoryHints.neutral,
        color: CATEGORY_COLORS[category] || CATEGORY_COLORS.neutral,
      });
    }
  });

  return groups;
}

/**
 * Generates a pre-round summary with all mnemonic cues.
 */
export function generatePreRoundSummary(deck: CardData[]): {
  categoryGroups: CategoryGroup[];
  totalPairs: number;
  mnemonicSuggestion: string;
} {
  const categoryGroups = generateCategoryGroups(deck);
  const totalPairs = deck.length / 2;

  // Generate overall mnemonic strategy suggestion
  let mnemonicSuggestion = '';
  if (categoryGroups.length > 1) {
    mnemonicSuggestion =
      'Dica: Agrupe mentalmente as cartas por categoria para facilitar a memorização. Cada grupo tem uma cor de borda diferente!';
  } else {
    mnemonicSuggestion =
      'Dica: Crie uma história ou jornada mental conectando todos os símbolos em uma sequência memorável.';
  }

  return {
    categoryGroups,
    totalPairs,
    mnemonicSuggestion,
  };
}
