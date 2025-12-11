/**
 * Spaced Repetition System for Memory Trainer
 * 
 * Implements a simple spaced repetition algorithm to track and schedule
 * difficult pairs for reintroduction in future sessions.
 */

export type DifficultPair = {
  pairId: string;
  value: string;
  category: string;
  failureCount: number;
  lastFailureTimestamp: number;
  nextReviewTimestamp: number;
  rehearsalCount: number;
};

export type SpacedRepetitionData = {
  difficultPairs: DifficultPair[];
  lastUpdated: number;
};

const STORAGE_KEY = 'memory-trainer-spaced-repetition';

/**
 * Calculates the next review timestamp based on rehearsal count.
 * Uses exponential backoff: 5 min, 1 hour, 1 day, 3 days, 7 days
 */
export function calculateNextReview(rehearsalCount: number, currentTimestamp: number): number {
  const intervals = [
    5 * 60 * 1000, // 5 minutes
    60 * 60 * 1000, // 1 hour
    24 * 60 * 60 * 1000, // 1 day
    3 * 24 * 60 * 60 * 1000, // 3 days
    7 * 24 * 60 * 60 * 1000, // 7 days
  ];

  const intervalIndex = Math.min(rehearsalCount, intervals.length - 1);
  return currentTimestamp + intervals[intervalIndex];
}

/**
 * Loads spaced repetition data from localStorage.
 */
export function loadSpacedRepetitionData(): SpacedRepetitionData {
  if (typeof window === 'undefined') {
    return { difficultPairs: [], lastUpdated: Date.now() };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { difficultPairs: [], lastUpdated: Date.now() };
    }

    const data = JSON.parse(stored) as SpacedRepetitionData;
    return data;
  } catch (error) {
    console.error('Failed to load spaced repetition data:', error);
    return { difficultPairs: [], lastUpdated: Date.now() };
  }
}

/**
 * Saves spaced repetition data to localStorage.
 */
export function saveSpacedRepetitionData(data: SpacedRepetitionData): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save spaced repetition data:', error);
  }
}

/**
 * Records a failed pair attempt.
 * Only saves to localStorage when the total failure count meets the threshold.
 */
export function recordFailedPair(
  pairId: string,
  value: string,
  category: string,
  currentFailureCount: number,
  failureThreshold: number = 2
): void {
  // Don't record until threshold is met
  if (currentFailureCount < failureThreshold) {
    return;
  }

  const data = loadSpacedRepetitionData();
  const now = Date.now();

  const existingPairIndex = data.difficultPairs.findIndex((p) => p.pairId === pairId);

  if (existingPairIndex >= 0) {
    // Update existing pair
    const pair = data.difficultPairs[existingPairIndex];
    pair.failureCount = currentFailureCount;
    pair.lastFailureTimestamp = now;
    pair.nextReviewTimestamp = calculateNextReview(pair.rehearsalCount, now);
  } else {
    // Add new difficult pair
    const newPair: DifficultPair = {
      pairId,
      value,
      category,
      failureCount: currentFailureCount,
      lastFailureTimestamp: now,
      nextReviewTimestamp: calculateNextReview(0, now),
      rehearsalCount: 0,
    };
    data.difficultPairs.push(newPair);
  }

  data.lastUpdated = now;
  saveSpacedRepetitionData(data);
}

/**
 * Gets pairs that are due for review based on current timestamp.
 */
export function getDuePairs(currentTimestamp: number = Date.now()): DifficultPair[] {
  const data = loadSpacedRepetitionData();
  return data.difficultPairs.filter((pair) => pair.nextReviewTimestamp <= currentTimestamp);
}

/**
 * Marks a pair as successfully reviewed, incrementing rehearsal count.
 */
export function markPairReviewed(pairId: string, success: boolean): void {
  const data = loadSpacedRepetitionData();
  const pairIndex = data.difficultPairs.findIndex((p) => p.pairId === pairId);

  if (pairIndex >= 0) {
    const pair = data.difficultPairs[pairIndex];
    const now = Date.now();

    if (success) {
      pair.rehearsalCount += 1;
      pair.nextReviewTimestamp = calculateNextReview(pair.rehearsalCount, now);

      // Remove pair if rehearsed successfully enough times (graduated)
      if (pair.rehearsalCount >= 5) {
        data.difficultPairs.splice(pairIndex, 1);
      }
    } else {
      // Reset progress on failure
      pair.rehearsalCount = 0;
      pair.failureCount += 1;
      pair.lastFailureTimestamp = now;
      pair.nextReviewTimestamp = calculateNextReview(0, now);
    }

    data.lastUpdated = now;
    saveSpacedRepetitionData(data);
  }
}

/**
 * Clears all spaced repetition data.
 */
export function clearSpacedRepetitionData(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear spaced repetition data:', error);
  }
}
