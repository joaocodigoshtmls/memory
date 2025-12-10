import type { CardData } from '@/types/memory';

type CardProps = {
  card: CardData;
  isRevealed: boolean;
  isMatched: boolean;
  isLocked: boolean;
  onSelect: (card: CardData) => void;
};

export function Card({ card, isMatched, isRevealed, isLocked, onSelect }: CardProps) {
  const handleClick = () => {
    // Prevent clicking if card is already matched, revealed, or the board is locked
    if (isMatched || isRevealed || isLocked) {
      return;
    }
    onSelect(card);
  };

  return (
    <button
      type="button"
      disabled={isMatched || isRevealed || isLocked}
      className={`group relative flex h-32 items-center justify-center rounded-xl border border-white/10 transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
        isMatched
          ? 'bg-primary-500/60 text-white scale-105'
          : isRevealed
            ? 'bg-white/20 text-primary-50 rotate-y-180'
            : 'bg-white/5 text-white/0 hover:bg-white/10 hover:scale-105 cursor-pointer'
      } ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
      style={{
        transformStyle: 'preserve-3d',
        transform: isRevealed || isMatched ? 'rotateY(0deg)' : 'rotateY(0deg)'
      }}
      onClick={handleClick}
    >
      <span className="text-xl font-semibold tracking-wide transition-opacity duration-300">
        {isRevealed || isMatched ? card.value : '•'}
      </span>
      {/* Future: render mnemonic cues and loci overlays driven by card.metadata */}
    </button>
  );
}
