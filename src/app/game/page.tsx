'use client';

import { useCallback, useEffect, useMemo, Suspense } from 'react';
import { Suspense, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { GameBoard } from '@/components/GameBoard';
import { HUD } from '@/components/HUD';
import { Modal } from '@/components/Modal';
import { levelsConfig } from '@/lib/levelsConfig';
import { useGameStore } from '@/store/useGameStore';
import type { CardData } from '@/types/memory';

function GameContent() {
  const searchParams = useSearchParams();
  const requestedLevelId = searchParams.get('level');

  const level = useMemo(() => {
    return levelsConfig.find((item) => item.id === requestedLevelId) ?? levelsConfig[0];
  }, [requestedLevelId]);

  const deck = useGameStore((state) => state.deck);
  const revealedCardIds = useGameStore((state) => state.revealedCardIds);
  const matchedPairs = useGameStore((state) => state.matchedPairs);
  const moves = useGameStore((state) => state.moves);
  const elapsedSeconds = useGameStore((state) => state.elapsedSeconds);
  const status = useGameStore((state) => state.status);
  const modal = useGameStore((state) => state.modal);
  const initializeLevel = useGameStore((state) => state.initializeLevel);
  const setStatus = useGameStore((state) => state.setStatus);
  const setModal = useGameStore((state) => state.setModal);
  const recordReveal = useGameStore((state) => state.recordReveal);
  const recordMatch = useGameStore((state) => state.recordMatch);

  useEffect(() => {
    initializeLevel(level);
    // Future: wire countdown, spaced repetition scheduler, and loci environment bootstrap here.
  }, [initializeLevel, level]);

  const handleCardSelect = useCallback(
    (card: CardData) => {
      recordReveal(card.id);
      // Future: plug adaptive difficulty and cue suggestions before matching evaluation.

      const matchingCard = deck.find(
        (candidate) => candidate.id !== card.id && candidate.pairId === card.pairId
      );
      if (matchingCard && revealedCardIds.includes(matchingCard.id)) {
        recordMatch(card.pairId);
      }
    },
    [deck, recordMatch, recordReveal, revealedCardIds]
  );

  const handlePauseToggle = () => {
    const nextStatus = status === 'paused' ? 'in-progress' : 'paused';
    setStatus(nextStatus);
    setModal({
      isOpen: nextStatus === 'paused',
      variant: nextStatus === 'paused' ? 'pause' : null,
      payload: { levelId: level.id },
    });
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10">
      <HUD
        elapsedSeconds={elapsedSeconds}
        levelName={level.name}
        moves={moves}
        onPauseToggle={handlePauseToggle}
        status={status}
      />

      <section className="flex flex-1 flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <GameBoard
            deck={deck}
            matchedPairs={matchedPairs}
            onCardSelect={handleCardSelect}
            revealedCardIds={revealedCardIds}
          />
        </div>
        <aside className="w-full max-w-sm space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white">Missão cognitiva</h2>
          <p className="text-sm text-slate-300">
            As próximas interações habilitarão dicas visuais, revisitações espaçadas e
            feedback adaptativo. Utilize esta área para acompanhar insights
            personalizados.
          </p>
          <ul className="space-y-2 text-sm text-slate-200">
            {level.objectives.map((objective) => (
              <li key={objective} className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-primary-500" />
                {objective}
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <Modal
        description="Respire fundo e visualize seu caminho. Você poderá retomar quando estiver pronto."
        isOpen={modal.isOpen}
        primaryAction={{
          label: 'Continuar',
          onSelect: () => {
            setStatus('in-progress');
            setModal({ isOpen: false, variant: null });
          },
        }}
        secondaryAction={{
          label: 'Voltar à seleção',
          onSelect: () => {
            setModal({ isOpen: false, variant: null });
          },
        }}
        title={modal.variant === 'pause' ? 'Pausa consciente' : 'Resumo de sessão'}
      >
        {/* Future: embed spaced repetition schedule previews and loci environment snapshots here. */}
      </Modal>
    </main>
  );
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-white">
          Carregando...
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-white">Carregando...</p>
        </div>
      }
    >
      <GameContent />
    </Suspense>
  );
}
