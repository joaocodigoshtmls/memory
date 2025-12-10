import Link from 'next/link';
import { levelsConfig } from '@/lib/levelsConfig';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-12 px-6 py-16">
      <header className="space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary-50">
          Neuro Memory Trainer
        </h1>
        <p className="mx-auto max-w-2xl text-base text-slate-300">
          Escolha um nível para praticar sua memória com técnicas baseadas em evidências.
          Cada etapa irá introduzir estímulos progressivos, repetição espaçada e suporte
          visual planejado para futuras atualizações.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {levelsConfig.map((level) => (
          <article
            key={level.id}
            className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-primary-500/10 transition hover:border-primary-500/60"
          >
            <h2 className="text-2xl font-semibold text-primary-50">{level.name}</h2>
            <p className="mt-2 text-sm text-slate-300">{level.description}</p>
            <dl className="mt-4 space-y-1 text-xs uppercase tracking-wide text-slate-400">
              <div className="flex justify-between">
                <dt>Cartas</dt>
                <dd>{level.cardPairs * 2}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Objetivos</dt>
                <dd>{level.objectives.join(' • ')}</dd>
              </div>
            </dl>
            <Link
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
              href={`/game?level=${level.id}`}
            >
              Iniciar treino
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
