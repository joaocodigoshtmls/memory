import type { LevelConfig } from '@/types/memory';

export const levelsConfig: LevelConfig[] = [
  {
    id: 'focus-start',
    name: 'Nível 1 · Atenção Focal',
    description:
      'Introduz pares simples com ritmo lento para iniciar formação de padrões e atenção seletiva.',
    cardPairs: 8,
    baseTimeLimitSec: 180,
    difficultyHooks: ['mnemonic-cue'],
    objectives: ['15 acertos', '0 dicas'],
  },
  {
    id: 'adaptive-loop',
    name: 'Nível 2 · Repetição Espaçada',
    description:
      'Reintroduz pares vistos anteriormente com intervalos graduais para reforço de curto prazo.',
    cardPairs: 12,
    baseTimeLimitSec: 210,
    difficultyHooks: ['spaced-repetition', 'categorical-grouping'],
    objectives: ['18 acertos', '-10% tempo'],
  },
  {
    id: 'loci-journey',
    name: 'Nível 3 · Jornada dos Loci',
    description: 'Simula ambientes visuais para treino de memória espacial e narrativa.',
    cardPairs: 16,
    baseTimeLimitSec: 240,
    difficultyHooks: ['loci-environment', 'adaptive-difficulty'],
    objectives: ['Mapa completo', 'feedback em tempo real'],
  },
];
