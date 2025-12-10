import { useMemo } from 'react';
import { Card } from '@/components/Card';
import type { CardData } from '@/types/memory';

type GameBoardProps = {
  deck: CardData[];
  revealedCardIds: string[];
  matchedPairs: Set<string>;
  onCardSelect: (card: CardData) => void;
};

export function GameBoard({
  deck,
  revealedCardIds,
  matchedPairs,
  onCardSelect,
}: GameBoardProps) {
  const gridColumns = useMemo(() => {
    const cardCount = deck.length;
    if (cardCount <= 16) return 'grid-cols-4';
    if (cardCount <= 24) return 'grid-cols-6';
    return 'grid-cols-8';
  }, [deck.length]);

  return (
    <div className={`grid gap-4 ${gridColumns}`}>
      {deck.map((card) => (
        <Card
          key={card.id}
          card={card}
          isMatched={matchedPairs.has(card.pairId)}
          isRevealed={revealedCardIds.includes(card.id)}
          onSelect={onCardSelect}
        />
      ))}
      {/* Future: dynamic grouping overlays for categorical clustering and loci pathways. */}
    </div>
  );
}
