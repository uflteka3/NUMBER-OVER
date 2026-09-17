import { Wordmark } from "@/components/layout/wordmark";

/**
 * Page temporaire — phase 2.
 * Aucun catalogue, prix ou numéro n'est affiché ici.
 */
export default function UnderConstructionPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 sm:px-10">
      <section
        aria-labelledby="titre-principal"
        className="w-full max-w-xl rounded-3xl border border-ink-300/30 bg-white px-6 py-12 text-center shadow-[0_20px_60px_-30px_rgba(11,18,32,0.35)] sm:px-12 sm:py-16"
      >
        <Wordmark />
        <h1 id="titre-principal" className="mt-8 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          NUMBER OVER
        </h1>
        <p className="mt-3 text-base text-ink-500 sm:text-lg">
          Plateforme de numéros virtuels — En construction
        </p>
        <div className="mt-10 flex items-center justify-center gap-3" role="status" aria-live="polite">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-500" />
          </span>
          <span className="text-sm font-medium text-ink-700">Ouverture prochaine</span>
        </div>
      </section>
      <footer className="mt-10 text-xs text-ink-500">
        © {new Date().getFullYear()} NUMBER OVER
      </footer>
    </main>
  );
}
