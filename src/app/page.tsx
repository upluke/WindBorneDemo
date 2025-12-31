import Link from 'next/link';
import HeroGlobe from './globe/components/HeroGlobe';

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Globe background */}
      <div className="absolute inset-0 opacity-40">
        <HeroGlobe />
      </div>

      {/* Overlay content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="text-center space-y-6 px-6">
          <h1 className="text-4xl font-bold">
            WindBorne Atlas
          </h1>

          <p className="text-zinc-300 max-w-xl mx-auto">
            A live, time-based globe for exploring atmospheric balloon data
            from the last 24 hours, enriched with real-world weather context.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              href="/globe"
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 transition font-medium"
            >
              Enter Globe →
            </Link>

            <a
              href="https://github.com/upluke/WindBorneDemo"
              className="px-6 py-3 rounded-lg border border-zinc-700 hover:bg-zinc-900 transition"
            >
              View Code
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}