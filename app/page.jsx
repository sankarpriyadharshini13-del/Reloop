import Link from 'next/link';
import { Camera, Cpu, Globe, MapPin, Recycle, ShieldCheck, Trophy, Zap } from 'lucide-react';
import ewasteData from '@/data/ewasteData.json';
import { formatKg, treeDaysFor } from '@/lib/impact';

const STEPS = [
  {
    icon: Camera,
    title: 'Snap it',
    text: 'Take a photo of an old phone, charger, laptop or any other electronic item. Or upload one you already have.',
  },
  {
    icon: Cpu,
    title: 'AI names it',
    text: 'An image model identifies the item, then we look up what it contains, whether it is recyclable and how to prepare it.',
  },
  {
    icon: MapPin,
    title: 'Drop it off',
    text: 'See the CO₂ you save, collect Green Score points and find recycling centers near you on the map.',
  },
];

export default function HomePage() {
  const topItems = Object.values(ewasteData)
    .sort((a, b) => b.co2 - a.co2)
    .slice(0, 7);
  const maxCo2 = topItems[0].co2;
  const phoneTonnes = Math.round((ewasteData['cell phone'].co2 * 1_000_000) / 1000);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-clip pb-24 pt-32 sm:pt-40">
        <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -left-24 top-20 h-96 w-96 animate-blob rounded-full bg-green-500/25 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-24 top-64 h-96 w-96 animate-blob rounded-full bg-emerald-400/15 blur-3xl [animation-delay:-6s]"
          aria-hidden="true"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-green-400/25 bg-green-500/10 px-4 py-1.5 text-sm font-medium text-green-300">
              <Globe className="h-4 w-4" aria-hidden="true" />
              Tech for a better tomorrow, worldwide
            </p>

            <h1 className="animate-fade-up mt-6 text-5xl font-extrabold leading-[1.02] text-white [animation-delay:80ms] sm:text-6xl lg:text-7xl">
              <span className="sr-only">ReLoop: </span>
              One Photo Can Save The Planet
            </h1>

            <p className="animate-fade-up mt-6 max-w-xl text-lg leading-relaxed text-slate-300 [animation-delay:160ms] sm:text-xl">
              Point your camera at an old phone, charger or laptop. ReLoop&apos;s AI tells you what it is, whether it can
              be recycled, how much CO₂ you save and where to drop it off.
            </p>

            <div className="animate-fade-up mt-9 flex flex-col gap-3 [animation-delay:240ms] sm:flex-row">
              <Link href="/scan" className="btn-primary !px-7 !py-4 text-lg">
                <Camera className="h-5 w-5" aria-hidden="true" />
                Scan Your E-Waste Now
              </Link>
              <a href="#how-it-works" className="btn-ghost !px-7 !py-4 text-lg">
                See how it works
              </a>
            </div>

            <p className="animate-fade-up mt-5 text-sm text-slate-400 [animation-delay:320ms]">
              Free, no sign-up, and we never save your photos.
            </p>
          </div>

          <ScanDemo />
        </div>
      </section>

      {/* STATS */}
      <section className="relative z-10 mx-auto -mt-6 max-w-6xl px-4 sm:px-6" aria-label="The e-waste problem">
        <div className="glass-strong grid divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">
          <div className="p-6 sm:p-8">
            <p className="font-display text-5xl font-extrabold text-white sm:text-6xl">
              50M <span className="text-3xl font-bold text-slate-400 sm:text-4xl">Tons</span>
            </p>
            <p className="mt-3 max-w-[16rem] text-slate-400">of electronics are thrown away around the world every year.</p>
          </div>

          <div className="flex items-center gap-5 p-6 sm:p-8">
            <div
              className="grid shrink-0 grid-cols-10 gap-[3px]"
              role="img"
              aria-label="Chart: 80 of every 100 items are not recycled"
            >
              {Array.from({ length: 100 }, (_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-[2px] ${i < 20 ? 'bg-green-500' : 'bg-slate-600'}`}
                />
              ))}
            </div>
            <div>
              <p className="font-display text-5xl font-extrabold text-white sm:text-6xl">80%</p>
              <p className="mt-1 text-slate-400">Not Recycled</p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <p className="font-display text-5xl font-extrabold text-gradient sm:text-6xl">1 Photo</p>
            <p className="mt-3 max-w-[16rem] text-slate-400">Can Change where a dead gadget ends up.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="scroll-mt-16 bg-mint-50 py-24 text-ink sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-extrabold sm:text-5xl">From photo to drop-off in three steps</h2>
            <p className="mt-4 text-lg text-slate-600">
              Most people don&apos;t recycle electronics because they don&apos;t know how. ReLoop answers that in one
              screen.
            </p>
          </div>

          <ol className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <li
                key={title}
                className={`glass-light relative p-7 ${index === 1 ? 'md:-translate-y-4' : ''}`}
              >
                <span
                  className="absolute right-6 top-4 font-display text-7xl font-extrabold text-green-600/10"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-600/30">
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-2xl font-bold">{title}</h3>
                <p className="mt-2 leading-relaxed text-slate-600">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* IMPACT */}
      <section id="impact" className="relative scroll-mt-16 overflow-clip py-24 sm:py-32">
        <div
          className="pointer-events-none absolute -right-40 top-10 h-[28rem] w-[28rem] rounded-full bg-green-500/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-6xl gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl">Every device has a footprint</h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-400">
              Recycling recovers metals that would otherwise be mined, and keeps lead, mercury and other toxins out of
              soil and water. This is what one item saves on average when it is recycled properly.
            </p>

            <ul className="mt-10 space-y-5">
              {topItems.map((item) => (
                <li key={item.name}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium text-white">
                      <span aria-hidden="true">{item.emoji}</span> {item.name}
                    </span>
                    <span className="text-slate-400">
                      {formatKg(item.co2)} kg CO₂, about {treeDaysFor(item.co2)} tree-days
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-300"
                      style={{ width: `${(item.co2 / maxCo2) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-slate-500">
              Approximate averages for recycling instead of landfilling. Real savings vary by model and recycling
              process.
            </p>
          </div>

          <div className="space-y-4 lg:pt-6">
            <div className="glass-strong p-7">
              <p className="font-display text-4xl font-extrabold text-white sm:text-5xl">
                {phoneTonnes} <span className="text-2xl text-slate-400">tonnes of CO₂</span>
              </p>
              <p className="mt-3 text-slate-400">
                is what one million recycled phones would save at ReLoop&apos;s estimate of{' '}
                {formatKg(ewasteData['cell phone'].co2)} kg each. Small items add up.
              </p>
            </div>

            {[
              {
                icon: ShieldCheck,
                title: 'Toxins stay contained',
                text: 'Batteries, screens and circuit boards hold lead, mercury, cadmium and lithium. In a landfill they leach. At a certified center they are captured.',
              },
              {
                icon: Zap,
                title: 'Metals get a second life',
                text: 'Copper, gold, silver and aluminium recovered from old devices replace freshly mined material.',
              },
              {
                icon: Trophy,
                title: 'You keep score',
                text: 'Every scan earns Green Score points and adds to your personal CO₂ total, saved on your own device.',
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="glass flex gap-4 p-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-green-500/15 text-green-400">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24 sm:px-6 sm:pb-32">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 to-green-600 px-6 py-14 text-center shadow-glow sm:px-12 sm:py-20">
          <div
            className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/15 blur-2xl"
            aria-hidden="true"
          />
          <h2 className="relative text-3xl font-extrabold text-white sm:text-5xl">Got a dead gadget in a drawer?</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-green-50">
            One photo is all it takes to find out what to do with it.
          </p>
          <div className="relative mt-8">
            <Link href="/scan" className="btn-white !px-8 !py-4 text-lg">
              <Camera className="h-5 w-5" aria-hidden="true" />
              Scan Your E-Waste Now
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-green-500 to-green-600">
                <Recycle className="h-5 w-5 text-white" aria-hidden="true" />
              </span>
              <span className="font-display text-xl font-bold text-white">
                ReLoop <span aria-hidden="true">♻️</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Turning old electronics into a greener tomorrow, one photo at a time. Built for the Tech for Better
              Tomorrow challenge.
            </p>
          </div>

          <nav aria-label="Footer" className="flex gap-12 text-sm">
            <ul className="space-y-3">
              <li>
                <Link href="/scan" className="text-slate-300 hover:text-white">
                  Scan e-waste
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="text-slate-300 hover:text-white">
                  How it works
                </a>
              </li>
              <li>
                <a href="#impact" className="text-slate-300 hover:text-white">
                  Impact
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <p className="mx-auto mt-10 max-w-6xl px-4 text-xs text-slate-500 sm:px-6">
          © {new Date().getFullYear()} ReLoop. Item detection is AI-based and can be wrong, so check local rules before
          disposing of hazardous items such as batteries.
        </p>
      </footer>
    </>
  );
}

/** Decorative, looping mock of the scan experience. */
function ScanDemo() {
  const laptop = ewasteData.laptop;
  return (
    <div className="animate-fade-up relative mx-auto w-full max-w-sm [animation-delay:200ms]" aria-hidden="true">
      <div className="absolute -inset-6 rounded-[3rem] bg-green-500/20 blur-3xl" />

      <div className="glass-strong relative rounded-[2rem] p-3">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-gradient-to-b from-ink-soft to-ink-deep">
          <div className="absolute inset-0 grid place-items-center text-[9rem] leading-none drop-shadow-2xl">💻</div>

          <span className="absolute left-5 top-5 h-8 w-8 rounded-tl-xl border-l-2 border-t-2 border-green-400" />
          <span className="absolute right-5 top-5 h-8 w-8 rounded-tr-xl border-r-2 border-t-2 border-green-400" />
          <span className="absolute bottom-5 left-5 h-8 w-8 rounded-bl-xl border-b-2 border-l-2 border-green-400" />
          <span className="absolute bottom-5 right-5 h-8 w-8 rounded-br-xl border-b-2 border-r-2 border-green-400" />

          <div className="absolute inset-x-5 h-0.5 animate-scan bg-green-400 shadow-[0_0_24px_6px_rgba(34,197,94,0.7)] motion-reduce:hidden" />

          <div className="absolute inset-x-3 bottom-3 animate-reveal rounded-2xl border border-white/15 bg-ink/85 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <p className="font-display text-xl font-bold text-white">{laptop.name}</p>
              <span className="rounded-full bg-green-500 px-2.5 py-0.5 text-xs font-semibold text-white">Recyclable</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-white/[0.06] px-3 py-2">
                <p className="text-xs text-slate-400">CO₂ saved</p>
                <p className="font-semibold text-white">{formatKg(laptop.co2)} kg</p>
              </div>
              <div className="rounded-xl bg-white/[0.06] px-3 py-2">
                <p className="text-xs text-slate-400">Tree equivalent</p>
                <p className="font-semibold text-white">{treeDaysFor(laptop.co2)} days</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass absolute -right-3 -top-5 animate-float px-3.5 py-2 text-sm font-semibold text-green-300 sm:-right-8">
        +10 Green Score
      </div>
    </div>
  );
}
