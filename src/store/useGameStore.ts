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
  status: 'idle'
};

const defaultModal: ModalState = {
  isOpen: false,
  variant: null
};

type SetState<TState> = (
  partial: TState | Partial<TState> | ((state: TState) => TState | Partial<TState>),
  replace?: boolean
) => void;

type GetState<TState> = () => TState;

const createGameStore = (set: SetState<GameStore>, get: GetState<GameStore>): GameStore => ({
  ...initialSnapshot,
  deck: generateDeck(initialSnapshot.levelId),
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
  reset: () => {
    const { levelId } = get();
    set({
      ...initialSnapshot,
      levelId,
      deck: generateDeck(levelId),
      modal: defaultModal
    });
  }
});

export const useGameStore = create<GameStore>(createGameStore);
