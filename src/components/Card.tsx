import type { CardData } from '@/types/memory';
import { CATEGORY_COLORS } from '@/lib/mnemonicHints';

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

  // Get category-specific border color
  const categoryColor = CATEGORY_COLORS[card.category] || CATEGORY_COLORS.neutral;
  const borderClass = card.category !== 'neutral' ? categoryColor.split(' ')[0] : 'border-white/10';

  return (
    <button
      type="button"
      className={`relative flex h-32 items-center justify-center rounded-xl border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${borderClass} ${
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
        <span className={`absolute bottom-1 right-1 h-3 w-3 rounded-full ${categoryColor.split(' ')[1]}`} />
      )}
    </button>
  );
}
