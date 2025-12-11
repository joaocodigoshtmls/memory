export type CognitiveHook =
  | 'spaced-repetition'
  | 'mnemonic-cue'
  | 'loci-environment'
  | 'categorical-grouping'
  | 'adaptive-difficulty';

export type CardTag = 'symbol' | 'color' | 'sound' | 'location' | 'concept';

export type CardMetadata = {
  /** Placeholder for future visual/audio cues aligned with mnemonic strategies. */
  cues?: {
    visualHint?: string;
    auditoryHint?: string;
    mnemonicStrategy?: string;
  };
  /** Supports grouping logic for categorical clustering and loci mapping. */
  tags?: CardTag[];
  /** Tracks exposure history for repetition spacing algorithms. */
  rehearsalHistory?: Array<{ timestamp: number; outcome: 'success' | 'failure' }>;
};

export type CardData = {
  id: string;
  value: string;
  pairId: string;
  category: string;
  metadata?: CardMetadata;
};

export type LevelConfig = {
  id: string;
  name: string;
  description: string;
  cardPairs: number;
  baseTimeLimitSec?: number;
  difficultyHooks: CognitiveHook[];
  objectives: string[];
};

export type GameStatus = 'idle' | 'countdown' | 'in-progress' | 'paused' | 'completed';

export type GameSnapshot = {
  levelId: string;
  revealedCardIds: string[];
  matchedPairs: Set<string>;
  moves: number;
  elapsedSeconds: number;
  status: GameStatus;
  score: number;
  categoryBonusCount: number;
};
