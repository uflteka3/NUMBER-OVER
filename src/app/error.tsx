"use client";

/**
 * Frontière d'erreur globale.
 * N'affiche JAMAIS le message technique ni la pile : uniquement un message générique.
 * Le détail est disponible côté serveur (et via un outil de monitoring en phase 17).
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="text-2xl font-bold text-ink-900">Une erreur est survenue</h1>
      <p className="mt-2 max-w-md text-ink-500">
        Nous n&apos;avons pas pu afficher cette page. Veuillez réessayer dans un instant.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-xl bg-ink-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-ink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        Réessayer
      </button>
    </main>
  );
}
