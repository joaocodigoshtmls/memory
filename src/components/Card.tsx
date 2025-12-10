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
      <span className="text-xl font-semibold tracking-wide">
        {isRevealed || isMatched ? card.value : '•'}
      </span>
      {/* Future: render mnemonic cues and loci overlays driven by card.metadata */}
    </button>
  );
}
