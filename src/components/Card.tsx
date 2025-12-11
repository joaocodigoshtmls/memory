import type { CardData } from '@/types/memory';

type CardProps = {
  card: CardData;
  isRevealed: boolean;
  isMatched: boolean;
  onSelect: (card: CardData) => void;
};

export function Card({ card, isMatched, isRevealed, onSelect }: CardProps) {
  const handleClick = () => {
    if (!isMatched && !isRevealed) {
      onSelect(card);
    }
  };

  // Extract loci position hint from metadata
  const lociHint = card.metadata?.cues?.visualHint;
  const hasLociEnvironment = lociHint?.includes('loci-position');

  return (
    <button
      type="button"
      className={`relative flex h-32 items-center justify-center rounded-xl border border-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
        isMatched
          ? 'bg-primary-500/60 text-white'
          : isRevealed
            ? 'bg-white/20 text-primary-50'
            : 'bg-white/5 text-white/0 hover:bg-white/10'
      }`}
      onClick={handleClick}
    >
      {/* Loci spatial indicator - subtle visual cue for position */}
      {hasLociEnvironment && !isMatched && (
        <span className="absolute left-1 top-1 text-[8px] font-mono text-white/20">
          {lociHint?.split('-').pop()}
        </span>
      )}
      
      <span className="text-xl font-semibold tracking-wide">
        {isRevealed || isMatched ? card.value : '•'}
      </span>
      
      {/* Category indicator for categorical grouping */}
      {card.category !== 'neutral' && !isMatched && (
        <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-white/10" />
      )}
    </button>
  );
}
