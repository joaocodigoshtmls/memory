import type { CardData } from '@/types/memory';
import { generatePreRoundSummary } from '@/lib/mnemonicHints';

type MnemonicHintPanelProps = {
  deck: CardData[];
  isVisible: boolean;
  onDismiss: () => void;
};

export function MnemonicHintPanel({ deck, isVisible, onDismiss }: MnemonicHintPanelProps) {
  if (!isVisible) return null;

  const summary = generatePreRoundSummary(deck);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="max-w-2xl rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900 to-slate-800 p-8 shadow-2xl">
        <h2 className="mb-4 text-2xl font-bold text-white">
          🧠 Dicas Mnemônicas
        </h2>
        
        <p className="mb-6 text-slate-300">
          {summary.mnemonicSuggestion}
        </p>

        {summary.categoryGroups.length > 0 && (
          <div className="mb-6 space-y-4">
            <h3 className="text-lg font-semibold text-primary-300">
              Grupos por Categoria
            </h3>
            <div className="space-y-3">
              {summary.categoryGroups.map((group) => (
                <div
                  key={group.category}
                  className={`rounded-lg border-2 p-4 ${group.color}`}
                >
                  <p className="mb-2 text-sm font-semibold text-white">{group.hint}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.cards.map((card, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-white/10 px-3 py-1 text-lg"
                      >
                        {card}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-lg bg-blue-500/10 p-4 text-sm text-blue-200">
          <p>
            💡 <strong>Dica:</strong> Pares da mesma categoria dão bônus de +5 pontos!
          </p>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="mt-6 w-full rounded-lg bg-primary-500 px-6 py-3 font-semibold text-white transition hover:bg-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
        >
          Começar Jogo
        </button>
      </div>
    </div>
  );
}
