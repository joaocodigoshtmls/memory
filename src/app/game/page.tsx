'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { GameBoard } from '@/components/GameBoard';
import { HUD } from '@/components/HUD';
import { Modal } from '@/components/Modal';
import { MnemonicHintPanel } from '@/components/MnemonicHintPanel';
import { levelsConfig } from '@/lib/levelsConfig';
import { useGameStore } from '@/store/useGameStore';
import type { CardData } from '@/types/memory';

/**
 * Duration in milliseconds for the countdown phase before game starts.
 */
const COUNTDOWN_DURATION = 2000;

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
  const isChecking = useGameStore((state) => state.isChecking);
  const timerStarted = useGameStore((state) => state.timerStarted);
  const feedbackMessages = useGameStore((state) => state.feedbackMessages);
  const score = useGameStore((state) => state.score);
  const categoryBonusCount = useGameStore((state) => state.categoryBonusCount);
  const initializeLevel = useGameStore((state) => state.initializeLevel);
  const setStatus = useGameStore((state) => state.setStatus);
  const setModal = useGameStore((state) => state.setModal);
  const selectCard = useGameStore((state) => state.selectCard);
  const incrementTimer = useGameStore((state) => state.incrementTimer);
  const reset = useGameStore((state) => state.reset);

  const [showMnemonicHints, setShowMnemonicHints] = useState(false);

  useEffect(() => {
    initializeLevel(level);
    // Show mnemonic hints if level uses mnemonic-cue or categorical-grouping
    const showHints =
      level.difficultyHooks.includes('mnemonic-cue') ||
      level.difficultyHooks.includes('categorical-grouping');
    setShowMnemonicHints(showHints);
  }, [initializeLevel, level]);

  useEffect(() => {
    // Transition from countdown to in-progress after a brief delay
    // Don't auto-transition if mnemonic hints are showing
    if (status === 'countdown' && !showMnemonicHints) {
      const timer = setTimeout(() => {
        setStatus('in-progress');
      }, COUNTDOWN_DURATION);

      return () => clearTimeout(timer);
    }
  }, [status, setStatus, showMnemonicHints]);

  const handleDismissMnemonicHints = useCallback(() => {
    setShowMnemonicHints(false);
    setStatus('in-progress');
  }, [setStatus]);

  useEffect(() => {
    // Timer: increment elapsed seconds when game is in-progress and timer has started
    if (status === 'in-progress' && timerStarted) {
      const interval = setInterval(() => {
        incrementTimer();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [status, timerStarted, incrementTimer]);

  const handleCardSelect = useCallback(
    (card: CardData) => {
      // Prevent card selection during checking or when game is not in progress
      if (isChecking || status !== 'in-progress') {
        return;
      }

      selectCard(card.id);
      // Future: plug adaptive difficulty and cue suggestions before matching evaluation.
    },
    [selectCard, isChecking, status]
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

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  const handlePlayAgain = useCallback(() => {
    setModal({ isOpen: false, variant: null });
    reset();
  }, [reset, setModal]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Apply loci theme based on level
  const lociThemeClass = `loci-theme-${level.id}`;

  return (
    <main
      className={`mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-10 transition-colors duration-1000 ${lociThemeClass}`}
    >
      <HUD
        elapsedSeconds={elapsedSeconds}
        levelName={level.name}
        moves={moves}
        onPauseToggle={handlePauseToggle}
        onReset={handleReset}
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
            Acompanhe suas conquistas e receba dicas personalizadas durante o treino.
          </p>

          {/* Score Display */}
          <div className="rounded-lg bg-gradient-to-r from-primary-500/20 to-purple-500/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Pontuação</p>
                <p className="text-2xl font-bold text-white">{score}</p>
              </div>
              {categoryBonusCount > 0 && (
                <div className="text-right">
                  <p className="text-xs text-slate-400">Bônus de categoria</p>
                  <p className="text-lg font-semibold text-primary-300">
                    {categoryBonusCount}x 🎯
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Loci Environment Description */}
          <div className="rounded-lg bg-white/5 p-4">
            <h3 className="mb-2 text-sm font-semibold text-primary-300">
              🏛️ Ambiente espacial
            </h3>
            <p className="text-xs text-slate-400">
              {level.id === 'focus-start' &&
                'Quarto sereno: Associe cada carta a um objeto no espaço ao seu redor.'}
              {level.id === 'adaptive-loop' &&
                'Floresta encantada: Visualize cada carta em um local específico da natureza.'}
              {level.id === 'loci-journey' &&
                'Palácio da memória: Navegue por salas conectadas, cada uma com suas cartas.'}
            </p>
          </div>
          
          <ul className="space-y-2 text-sm text-slate-200">
            {level.objectives.map((objective) => (
              <li key={objective} className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-primary-500" />
                {objective}
              </li>
            ))}
          </ul>
          
          {feedbackMessages.length > 0 && (
            <div className="space-y-3 border-t border-white/10 pt-4">
              <h3 className="text-sm font-semibold text-white">Feedback cognitivo</h3>
              {feedbackMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-lg p-3 text-sm ${
                    msg.type === 'success'
                      ? 'bg-green-500/10 text-green-200'
                      : msg.type === 'tip'
                        ? 'bg-blue-500/10 text-blue-200'
                        : 'bg-purple-500/10 text-purple-200'
                  }`}
                >
                  <span className="mr-2">
                    {msg.type === 'success' ? '✨' : msg.type === 'tip' ? '💡' : '💪'}
                  </span>
                  {msg.text}
                </div>
              ))}
            </div>
          )}
        </aside>
      </section>

      <Modal
        description={
          modal.variant === 'summary'
            ? 'Parabéns! Você completou todos os pares com sucesso.'
            : 'Respire fundo e visualize seu caminho. Você poderá retomar quando estiver pronto.'
        }
        isOpen={modal.isOpen}
        primaryAction={
          modal.variant === 'summary'
            ? {
                label: 'Jogar novamente',
                onSelect: handlePlayAgain,
              }
            : {
                label: 'Continuar',
                onSelect: () => {
                  setStatus('in-progress');
                  setModal({ isOpen: false, variant: null });
                },
              }
        }
        secondaryAction={{
          label: 'Voltar à seleção',
          onSelect: () => {
            setModal({ isOpen: false, variant: null });
          },
        }}
        title={modal.variant === 'pause' ? 'Pausa consciente' : 'Vitória! 🎉'}
      >
        {modal.variant === 'summary' && modal.payload ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-white/5 p-4">
              <dl className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">
                    Tempo total
                  </dt>
                  <dd className="mt-1 text-2xl font-bold text-primary-400">
                    {formatTime((modal.payload as any).elapsedSeconds)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">
                    Tentativas
                  </dt>
                  <dd className="mt-1 text-2xl font-bold text-primary-400">
                    {(modal.payload as any).moves}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">
                    Pontuação
                  </dt>
                  <dd className="mt-1 text-2xl font-bold text-primary-400">
                    {(modal.payload as any).score}
                  </dd>
                </div>
              </dl>
            </div>
            {(modal.payload as any).categoryBonusCount > 0 && (
              <div className="rounded-lg bg-primary-500/10 p-3 text-center text-sm text-primary-200">
                🎯 Você ganhou {(modal.payload as any).categoryBonusCount} bônus de categoria!
              </div>
            )}
          </div>
        ) : null}
        {/* Future: embed spaced repetition schedule previews and loci environment snapshots here. */}
      </Modal>

      <MnemonicHintPanel
        deck={deck}
        isVisible={showMnemonicHints}
        onDismiss={handleDismissMnemonicHints}
      />
    </main>
  );
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-white">Carregando...</p>
        </div>
      }
    >
      <GameContent />
    </Suspense>
  );
}
