import { create } from 'zustand';
import type { CardData, GameSnapshot, GameStatus, LevelConfig } from '@/types/memory';
import { generateDeck } from '@/lib/deckGenerator';

type ModalState = {
  isOpen: boolean;
  variant: 'pause' | 'summary' | 'onboarding' | null;
  payload?: unknown;
};

type GameStore = GameSnapshot & {
  deck: CardData[];
  modal: ModalState;
  initializeLevel: (config: LevelConfig) => void;
  setStatus: (status: GameStatus) => void;
  setModal: (modal: ModalState) => void;
  recordReveal: (cardId: string) => void;
  recordMatch: (pairId: string) => void;
  reset: () => void;
};

const initialSnapshot: GameSnapshot = {
  levelId: 'focus-start',
  revealedCardIds: [],
  matchedPairs: new Set<string>(),
  moves: 0,
  elapsedSeconds: 0,
  status: 'idle',
};

const defaultModal: ModalState = {
  isOpen: false,
  variant: null,
};

/**
 * Generates a placeholder deck for testing and development purposes.
 * This is a temporary implementation that creates simple stimulus cards.
 * 
 * @todo Replace with actual content-based deck generator that uses:
 * - Scientific concepts for cognitive training
 * - Real mnemonic cues and visual hints
 * - Proper spaced repetition metadata
 * - Category-based grouping with meaningful content
 * 
 * @param config - Level configuration specifying card pairs and difficulty hooks
 * @returns Array of CardData representing the shuffled deck
 */
const generatePlaceholderDeck = (config: LevelConfig): CardData[] => {
  return Array.from({ length: config.cardPairs }, (_, pairIndex) => {
    const pairId = `${config.id}-pair-${pairIndex}`;
    const baseCard: CardData = {
      id: `${pairId}-a`,
      value: `Stimulus ${pairIndex + 1}`,
      pairId,
      category: config.difficultyHooks.includes('categorical-grouping')
        ? `category-${pairIndex % 4}`
        : 'neutral',
      metadata: {
        cues: {
          // Future: bind mnemonic cues, e.g., loci imagery or rhymes.
          mnemonicStrategy: config.difficultyHooks.includes('mnemonic-cue')
            ? 'placeholder-mnemonic'
            : undefined,
          visualHint: config.difficultyHooks.includes('loci-environment')
            ? 'placeholder-visual-loci'
            : undefined,
        },
        tags: ['concept'],
        rehearsalHistory: [],
      },
    };

    const mirroredCard: CardData = {
      ...baseCard,
      id: `${pairId}-b`,
    };

    return [baseCard, mirroredCard];
  }).flat();
};

type SetState<TState> = (
  partial: TState | Partial<TState> | ((state: TState) => TState | Partial<TState>),
  replace?: boolean
) => void;

type GetState<TState> = () => TState;

const createGameStore = (
  set: SetState<GameStore>,
  get: GetState<GameStore>
): GameStore => ({
  ...initialSnapshot,
  deck: generatePlaceholderDeck({
    id: initialSnapshot.levelId,
    name: 'Placeholder',
    description: 'Placeholder',
    cardPairs: 8,
    difficultyHooks: ['mnemonic-cue'],
    objectives: ['placeholder'],
  }),
  modal: defaultModal,
  initializeLevel: (config: LevelConfig) => {
    const deck = generateDeck(config.id);

    set({
      levelId: config.id,
      deck,
      revealedCardIds: [],
      matchedPairs: new Set<string>(),
      moves: 0,
      elapsedSeconds: 0,
      status: 'countdown',
    });
  },
  setStatus: (status: GameStatus) => set({ status }),
  setModal: (modal: ModalState) => set({ modal }),
  recordReveal: (cardId: string) => {
    const { revealedCardIds } = get();
    set({
      revealedCardIds: revealedCardIds.includes(cardId)
        ? revealedCardIds
        : [...revealedCardIds, cardId],
    });
  },
  recordMatch: (pairId: string) => {
    const { matchedPairs, moves } = get();
    const nextMatches = new Set(matchedPairs);
    nextMatches.add(pairId);

    set({
      matchedPairs: nextMatches,
      moves: moves + 1,
    });
  },
  reset: () =>
    // Preserves current deck to allow replay of the same card positions.
    // For a fresh shuffle, call initializeLevel() instead.
    set({
      ...initialSnapshot,
      levelId,
      deck: generateDeck(levelId),
      modal: defaultModal,
    });
  },
      deck: get().deck,
      modal: defaultModal,
    }),
});

export const useGameStore = create<GameStore>(createGameStore);
