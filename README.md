# Neuro Memory Trainer

Projeto Next.js (App Router) com TypeScript orientado para treinos de memória baseados em evidências científicas. O objetivo é preparar uma fundação sólida para integrar mecânicas como repetição espaçada, pistas mnemônicas, método dos loci e dificuldade adaptativa.

## Tecnologias

- Next.js 14 com App Router
- TypeScript com paths `@/*`
- Tailwind CSS
- Zustand para estado global
- ESLint + Prettier

## Estrutura principal

```
src/
  app/
    page.tsx            # Seleção de níveis
    game/page.tsx       # Tela do tabuleiro
    globals.css         # Tailwind + estilos de plano de fundo
    layout.tsx          # Layout raiz
  components/
    Card.tsx            # Carta individual com ganchos para pistas visuais
    GameBoard.tsx       # Grid de cartas com placeholders para agrupamentos
    HUD.tsx             # Painel de status e feedback adaptativo
    Modal.tsx           # Diálogos para pausa e resumos
  lib/
    levelsConfig.ts     # Configurações dos níveis e hooks cognitivos
  store/
    useGameStore.ts     # Estado global preparado para mecânicas cognitivas
  types/
    memory.ts           # Tipagens com metadata extensível
```

## Próximos passos sugeridos

1. Implementar geração real de deck com base em conteúdos científicos.
2. Sincronizar cronômetro e lógica de virada de cartas com algoritmos de repetição espaçada.
3. Integrar camadas visuais (loci, pistas) e feedback adaptativo no HUD.
4. Adicionar testes unitários para garantir evolução segura das mecânicas.

## Scripts

- `npm run dev` – inicia o ambiente de desenvolvimento.
- `npm run build` – gera a versão de produção.
- `npm run start` – executa a build.
- `npm run lint` – roda ESLint.
- `npm run format` – verifica formatação com Prettier.
- `npm run format:fix` – corrige formatação automaticamente.

## Configuração inicial

1. Instale as dependências: `npm install`.
2. Rode `npm run dev` para iniciar o servidor em desenvolvimento.
3. Acesse `http://localhost:3000` para utilizar o jogo.
