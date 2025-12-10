import { create } from 'zustand';
import type { CardData, GameSnapshot, GameStatus, LevelConfig } from '@/types/memory';

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
  clearRevealed: () => void;
  reset: () => void;
};

const initialSnapshot: GameSnapshot = {
  levelId: 'focus-start',
  revealedCardIds: [],
  matchedPairs: new Set<string>(),
  moves: 0,
  elapsedSeconds: 0,
  status: 'idle'
};

const defaultModal: ModalState = {
  isOpen: false,
  variant: null
};

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
            : undefined
        },
        tags: ['concept'],
        rehearsalHistory: []
      }
    };

    const mirroredCard: CardData = {
      ...baseCard,
      id: `${pairId}-b`
    };

    return [baseCard, mirroredCard];
  }).flat();
};

type SetState<TState> = (
  partial: TState | Partial<TState> | ((state: TState) => TState | Partial<TState>),
  replace?: boolean
) => void;

type GetState<TState> = () => TState;

const createGameStore = (set: SetState<GameStore>, get: GetState<GameStore>): GameStore => ({
  ...initialSnapshot,
  deck: generatePlaceholderDeck({
    id: initialSnapshot.levelId,
    name: 'Placeholder',
    description: 'Placeholder',
    cardPairs: 8,
    difficultyHooks: ['mnemonic-cue'],
    objectives: ['placeholder']
  }),
  modal: defaultModal,
  initializeLevel: (config: LevelConfig) => {
    const placeholderDeck = generatePlaceholderDeck(config);

    set({
      levelId: config.id,
      deck: placeholderDeck,
      revealedCardIds: [],
      matchedPairs: new Set<string>(),
      moves: 0,
      elapsedSeconds: 0,
      status: 'countdown'
    });
  },
  setStatus: (status: GameStatus) => set({ status }),
  setModal: (modal: ModalState) => set({ modal }),
  recordReveal: (cardId: string) => {
    const { revealedCardIds } = get();
    set({
      revealedCardIds: revealedCardIds.includes(cardId)
        ? revealedCardIds
        : [...revealedCardIds, cardId]
    });
  },
  recordMatch: (pairId: string) => {
    const { matchedPairs, moves } = get();
    const nextMatches = new Set(matchedPairs);
    nextMatches.add(pairId);

    set({
      matchedPairs: nextMatches,
      moves: moves + 1
    });
  },
  clearRevealed: () => {
    set({ revealedCardIds: [] });
  },
  reset: () =>
    set({
    ...initialSnapshot,
    deck: get().deck,
    modal: defaultModal
    })
});

export const useGameStore = create<GameStore>(createGameStore);
