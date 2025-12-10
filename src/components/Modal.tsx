import type { ReactNode } from 'react';

type ModalAction = {
  label: string;
  onSelect: () => void;
};

type ModalProps = {
  isOpen: boolean;
  title: string;
  description?: string;
  primaryAction?: ModalAction;
  secondaryAction?: ModalAction;
  children?: ReactNode;
};

export function Modal({
  isOpen,
  title,
  description,
  primaryAction,
  secondaryAction,
  children
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-6">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl shadow-black/40">
        <header className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          {description ? <p className="text-sm text-slate-300">{description}</p> : null}
        </header>

        <div className="text-sm text-slate-200">{children}</div>

        <footer className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          {secondaryAction ? (
            <button
              type="button"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40"
              onClick={secondaryAction.onSelect}
            >
              {secondaryAction.label}
            </button>
          ) : null}
          {primaryAction ? (
            <button
              type="button"
              className="rounded-full bg-primary-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
              onClick={primaryAction.onSelect}
            >
              {primaryAction.label}
            </button>
          ) : null}
        </footer>
        {/* Future: dynamic content for spaced repetition scheduling and loci visualization overlays. */}
      </div>
    </div>
  );
}
