import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-sm font-semibold text-brand-600">404</p>
      <h1 className="mt-2 text-2xl font-bold text-ink-900">Page introuvable</h1>
      <p className="mt-2 text-ink-500">Cette page n&apos;existe pas ou n&apos;est pas encore disponible.</p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-ink-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-ink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
