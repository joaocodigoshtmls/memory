import { create } from 'zustand';
import type { CardData, GameSnapshot, GameStatus, LevelConfig } from '@/types/memory';
import { generateDeck } from '@/lib/deckGenerator';
import {
  recordFailedPair,
  markPairReviewed,
  getDuePairs,
} from '@/lib/spacedRepetition';

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

type FeedbackMessage = {
  id: string;
  text: string;
  type: 'encouragement' | 'tip' | 'success';
  timestamp: number;
};

type GameStore = GameSnapshot & {
  deck: CardData[];
  modal: ModalState;
  selectedCards: string[];
  isChecking: boolean;
  checkTimeoutId: NodeJS.Timeout | null;
  timerStarted: boolean;
  failedPairs: Map<string, number>;
  feedbackMessages: FeedbackMessage[];
  initializeLevel: (config: LevelConfig) => void;
  setStatus: (status: GameStatus) => void;
  setModal: (modal: ModalState) => void;
  selectCard: (cardId: string) => void;
  clearSelection: () => void;
  incrementTimer: () => void;
  addFeedbackMessage: (message: Omit<FeedbackMessage, 'id' | 'timestamp'>) => void;
  reset: () => void;
};

const initialSnapshot: GameSnapshot = {
  levelId: 'focus-start',
  revealedCardIds: [],
  matchedPairs: new Set<string>(),
  moves: 0,
  elapsedSeconds: 0,
  status: 'idle',
  score: 0,
  categoryBonusCount: 0,
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
  timerStarted: false,
  failedPairs: new Map(),
  feedbackMessages: [],
  initializeLevel: (config: LevelConfig) => {
    const { checkTimeoutId } = get();

    // Clear any existing timeout to prevent memory leaks
    if (checkTimeoutId) {
      clearTimeout(checkTimeoutId);
    }

    const deck = generateDeck(config.id);

    // Load spaced repetition pairs if this level uses spaced repetition
    const hasSpacedRepetition = config.difficultyHooks.includes('spaced-repetition');
    let duePairs: Array<{ pairId: string; value: string }> = [];
    
    if (hasSpacedRepetition) {
      const duePairsData = getDuePairs();
      duePairs = duePairsData.map((p) => ({ pairId: p.pairId, value: p.value }));
    }

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
      timerStarted: false,
      failedPairs: new Map(),
      feedbackMessages: [],
      score: 0,
      categoryBonusCount: 0,
    });

    // Show feedback about due pairs
    if (duePairs.length > 0) {
      const { addFeedbackMessage } = get();
      addFeedbackMessage({
        text: `📚 ${duePairs.length} pares anteriores para revisar!`,
        type: 'tip',
      });
    }
  },
  setStatus: (status: GameStatus) => set({ status }),
  setModal: (modal: ModalState) => set({ modal }),
  selectCard: (cardId: string) => {
    const {
      selectedCards,
      isChecking,
      deck,
      matchedPairs,
      moves,
      checkTimeoutId,
      timerStarted,
    } = get();

    // Prevent selection during checking or if already selected
    if (isChecking || selectedCards.includes(cardId)) {
      return;
    }

    const newSelectedCards = [...selectedCards, cardId];

    // Start timer on first card click
    const updates: Partial<GameStore> = {
      selectedCards: newSelectedCards,
      revealedCardIds: newSelectedCards,
    };

    if (!timerStarted) {
      updates.timerStarted = true;
    }

    set(updates);

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

        const totalPairs = deck.length / 2;
        const allMatched = nextMatches.size === totalPairs;

        // Calculate score and category bonus
        const { score, categoryBonusCount, addFeedbackMessage } = get();
        let baseScore = 10;
        let bonusScore = 0;
        let newCategoryBonusCount = categoryBonusCount;

        // Check if both cards are in same category (and not neutral)
        if (
          firstCard.category !== 'neutral' &&
          firstCard.category === secondCard.category
        ) {
          bonusScore = 5;
          newCategoryBonusCount += 1;
          addFeedbackMessage({
            text: `🎯 Bônus de categoria! +${bonusScore} pontos`,
            type: 'success',
          });
        }

        const newScore = score + baseScore + bonusScore;

        // Mark as reviewed in spaced repetition if applicable
        markPairReviewed(firstCard.pairId, true);

        set({
          matchedPairs: nextMatches,
          moves: moves + 1,
          selectedCards: [],
          isChecking: false,
          checkTimeoutId: null,
          status: allMatched ? 'completed' : get().status,
          score: newScore,
          categoryBonusCount: newCategoryBonusCount,
        });

        // Show victory modal if all pairs are matched
        if (allMatched) {
          addFeedbackMessage({
            text: 'Excelente! Você completou todos os pares!',
            type: 'success',
          });
          
          set({
            modal: {
              isOpen: true,
              variant: 'summary',
              payload: {
                elapsedSeconds: get().elapsedSeconds,
                moves: moves + 1,
                score: newScore,
                categoryBonusCount: newCategoryBonusCount,
              },
            },
          });
        }
      } else {
        // No match - show cards briefly then hide them
        const { failedPairs, addFeedbackMessage } = get();
        
        // Track failed attempts for adaptive difficulty
        const pairKey = [firstCard?.pairId, secondCard?.pairId].sort().join('-');
        const failCount = (failedPairs.get(pairKey) || 0) + 1;
        const newFailedPairs = new Map(failedPairs);
        newFailedPairs.set(pairKey, failCount);

        // Record failed pairs for spaced repetition (record each distinct pair once)
        if (firstCard && failCount >= 2) {
          recordFailedPair(firstCard.pairId, firstCard.value, firstCard.category, 2);
        }
        // Only record secondCard if it's a different pair than firstCard
        if (secondCard && secondCard.pairId !== firstCard?.pairId && failCount >= 2) {
          recordFailedPair(secondCard.pairId, secondCard.value, secondCard.category, 2);
        }
        
        // Provide cognitive feedback based on performance
        if (failCount === 3) {
          addFeedbackMessage({
            text: 'Tente criar uma imagem mental dessas cartas!',
            type: 'tip',
          });
        } else if (moves > 0 && moves % 10 === 0) {
          addFeedbackMessage({
            text: 'Continue focado! Cada tentativa fortalece sua memória.',
            type: 'encouragement',
          });
        }
        
        const timeoutId = setTimeout(() => {
          set({
            revealedCardIds: [],
            selectedCards: [],
            moves: moves + 1,
            isChecking: false,
            checkTimeoutId: null,
            failedPairs: newFailedPairs,
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
  incrementTimer: () => {
    const { elapsedSeconds } = get();
    set({ elapsedSeconds: elapsedSeconds + 1 });
  },
  addFeedbackMessage: (message: Omit<FeedbackMessage, 'id' | 'timestamp'>) => {
    const { feedbackMessages } = get();
    const newMessage: FeedbackMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };
    
    // Keep only the last 3 messages
    const updatedMessages = [...feedbackMessages, newMessage].slice(-3);
    set({ feedbackMessages: updatedMessages });
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
      timerStarted: false,
      failedPairs: new Map(),
      feedbackMessages: [],
      status: 'countdown',
      score: 0,
      categoryBonusCount: 0,
    });
  },
});

export const useGameStore = create<GameStore>(createGameStore);
