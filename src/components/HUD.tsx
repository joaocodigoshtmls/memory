import type { GameStatus } from '@/types/memory';

type HUDProps = {
  levelName: string;
  moves: number;
  elapsedSeconds: number;
  status: GameStatus;
  onPauseToggle: () => void;
  onReset: () => void;
};

export function HUD({
  levelName,
  moves,
  elapsedSeconds,
  status,
  onPauseToggle,
  onReset,
}: HUDProps) {
  const minutes = Math.floor(elapsedSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(elapsedSeconds % 60)
    .toString()
    .padStart(2, '0');

  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">Nível atual</p>
        <p className="text-lg font-semibold text-white">{levelName}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">Movimentos</p>
        <p className="text-lg font-semibold text-white">{moves}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">Tempo</p>
        <p className="text-lg font-semibold text-white">
          {minutes}:{seconds}
        </p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">Estado</p>
        <p className="text-lg font-semibold capitalize text-white">
          {status.replace('-', ' ')}
        </p>
      </div>
      <button
        type="button"
        className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
        onClick={onPauseToggle}
      >
        {status === 'paused' ? 'Retomar' : 'Pausar'}
      </button>
      <button
        type="button"
        className="rounded-full bg-red-500/80 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
        onClick={onReset}
      >
        Tentar novamente
      </button>
      {/* Future: inject adaptive feedback indicators and confidence sliders here. */}
    </section>
  );
}
