import { create } from 'zustand';
import type { CardData, GameSnapshot, GameStatus, LevelConfig } from '@/types/memory';
import { generateDeck } from '@/lib/deckGenerator';

/**
 * Duration in milliseconds to display mismatched cards before hiding them.
 * This allows users to memorize the card positions.
 */
const MISMATCH_DISPLAY_DURATION = 1200;

type ModalState = {
  isOpen: boolean;
  variant: 'pause' | 'summary' | 'onboarding' | null;
  payload?: unknown;
};

type GameStore = GameSnapshot & {
  deck: CardData[];
  modal: ModalState;
  selectedCards: string[];
  isChecking: boolean;
  checkTimeoutId: NodeJS.Timeout | null;
  initializeLevel: (config: LevelConfig) => void;
  setStatus: (status: GameStatus) => void;
  setModal: (modal: ModalState) => void;
  selectCard: (cardId: string) => void;
  clearSelection: () => void;
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
  selectedCards: [],
  isChecking: false,
  checkTimeoutId: null,
  initializeLevel: (config: LevelConfig) => {
    const { checkTimeoutId } = get();
    
    // Clear any existing timeout to prevent memory leaks
    if (checkTimeoutId) {
      clearTimeout(checkTimeoutId);
    }

    const deck = generateDeck(config.id);

    set({
      levelId: config.id,
      deck,
      revealedCardIds: [],
      matchedPairs: new Set<string>(),
      moves: 0,
      elapsedSeconds: 0,
      status: 'countdown',
      selectedCards: [],
      isChecking: false,
      checkTimeoutId: null,
    });
  },
  setStatus: (status: GameStatus) => set({ status }),
  setModal: (modal: ModalState) => set({ modal }),
  selectCard: (cardId: string) => {
    const { selectedCards, isChecking, deck, matchedPairs, moves, checkTimeoutId } = get();
    
    // Prevent selection during checking or if already selected
    if (isChecking || selectedCards.includes(cardId)) {
      return;
    }

    const newSelectedCards = [...selectedCards, cardId];
    
    // Update revealed cards to show the newly selected card
    set({
      selectedCards: newSelectedCards,
      revealedCardIds: newSelectedCards,
    });

    // If two cards are now selected, check for a match
    if (newSelectedCards.length === 2) {
      set({ isChecking: true });

      const [firstCardId, secondCardId] = newSelectedCards;
      const firstCard = deck.find((card) => card.id === firstCardId);
      const secondCard = deck.find((card) => card.id === secondCardId);

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        // Match found - mark as matched immediately
        const nextMatches = new Set(matchedPairs);
        nextMatches.add(firstCard.pairId);

        set({
          matchedPairs: nextMatches,
          moves: moves + 1,
          selectedCards: [],
          isChecking: false,
          checkTimeoutId: null,
        });
      } else {
        // No match - show cards briefly then hide them
        const timeoutId = setTimeout(() => {
          set({
            revealedCardIds: [],
            selectedCards: [],
            moves: moves + 1,
            isChecking: false,
            checkTimeoutId: null,
          });
        }, MISMATCH_DISPLAY_DURATION);
        
        set({ checkTimeoutId: timeoutId });
      }
    }
  },
  clearSelection: () => {
    const { checkTimeoutId } = get();
    
    // Clear any existing timeout
    if (checkTimeoutId) {
      clearTimeout(checkTimeoutId);
    }
    
    set({
      selectedCards: [],
      revealedCardIds: [],
      checkTimeoutId: null,
    });
  },
  reset: () => {
    // Resets game state while generating a fresh shuffled deck.
    // This allows players to retry the level with a new card layout.
    const { levelId, checkTimeoutId } = get();
    
    // Clear any existing timeout to prevent memory leaks
    if (checkTimeoutId) {
      clearTimeout(checkTimeoutId);
    }
    
    set({
      ...initialSnapshot,
      levelId,
      deck: generateDeck(levelId),
      modal: defaultModal,
      selectedCards: [],
      isChecking: false,
      checkTimeoutId: null,
    });
  },
});

export const useGameStore = create<GameStore>(createGameStore);
