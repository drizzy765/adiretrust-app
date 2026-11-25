import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

const NEWS = [
  {
    quote:
      "the 'fake adire' has flooded local markets, threatening the survival of local producers and their centuries-old craft.",
    href: "https://punchng.com/adire-makers-decry-govt-inaction-as-chinese-fakes-flood-market/",
    source: "Punch, 2025",
  },
  {
    quote: "It costs 3,300 naira (around $2.20), half the price of a locally produced fabric.",
    href: "https://www.vanguardngr.com/2024/06/nigerias-adire-traders-feel-heat-from-china-inflation/",
    source: "Vanguard (AFP), 2024",
  },
  {
    quote: "since the influx of Chinese adire in the Nigeria market, many local producers have closed shop.",
    href: "https://guardian.ng/art/revue/nigerian-adire-going-going/",
    source: "The Guardian Nigeria, 2023",
  },
] as const;

const STEPS = [
  {
    n: "01",
    title: "Snap",
    body: "Photograph the front, the reverse, and a close edge or resist line.",
  },
  {
    n: "02",
    title: "Check",
    body: 'A DINOv2 vision model scores genuine hand-dyed vs factory print, or says "uncertain" instead of guessing.',
  },
  {
    n: "03",
    title: "Trust",
    body: "Get reasons, find artisans on the map, and give verified pieces a QR passport.",
  },
] as const;

const STATS = [
  { n: 27, label: "test images" },
  { n: 27, label: "correct" },
  { n: 0, label: "prints called genuine" },
  { n: 181, label: "real photos (81 genuine, 100 prints)" },
] as const;

const FEATURES = [
  { title: "Photo check", body: "Verdict, confidence and plain-language reasons." },
  { title: "Artisan map", body: "Find makers near you." },
  { title: "QR passport", body: "A shareable record for verified pieces." },
  { title: "Local languages", body: "Chat and voice in English, Yoruba, Hausa, Igbo and Pidgin." },
] as const;

const FAQ = [
  {
    q: "Is this a certificate?",
    a: "No. It's a decision aid with a confidence score, and it abstains when unsure.",
  },
  {
    q: "Where did the data come from?",
    a: "Our teammate photographed genuine pieces at a workshop in Ibadan, alongside factory prints from the market.",
  },
  {
    q: "What's next?",
    a: "More artisans and pieces, naira price guidance, and partnerships with cooperatives.",
  },
] as const;

export function LandingPage() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="bg-resist text-ink pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
      <section className="bg-resist-pattern px-[6vw] pt-10 pb-16 text-resist sm:pt-14 sm:pb-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h1 className="font-display text-[clamp(2.25rem,5vw,4rem)] leading-[1.05] font-semibold text-white">
              Is your Adire <em className="text-gold not-italic">hand-dyed</em> or a factory print?
            </h1>
            <p className="mt-5 max-w-[560px] text-lg leading-relaxed text-white/85 sm:text-xl">
              Snap one photo. AdireTrust checks it, explains why, and connects you to real artisans, so buyers stop
              overpaying for fakes and makers keep their craft alive.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/check"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-gold px-6 py-3 text-base font-bold text-indigo-ink transition hover:-translate-y-0.5"
              >
                Check a cloth
              </Link>
              <a
                href="#how"
                className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-white px-6 py-3 text-base font-bold text-white transition hover:-translate-y-0.5"
              >
                How it works
              </a>
            </div>
          </div>
          <div className="adire-viewfinder relative aspect-[4/5] overflow-hidden rounded-[18px]">
            <img
              src="/workshop.jpg"
              alt="Our teammate Paul collecting data at a workshop in Ibadan"
              className="h-full w-full object-cover object-center"
            />
            <div className="adire-scan-line absolute right-[18px] left-[18px] h-[3px] bg-gold shadow-[0_0_18px_#e0a82e]" />
            <p className="absolute bottom-3.5 left-3.5 rounded-lg bg-[rgba(15,27,61,0.8)] px-3 py-1.5 text-[13px] text-white">
              Our teammate Paul collecting data at a workshop in Ibadan
            </p>
          </div>
        </div>
      </section>

      <Reveal>
        <section className="px-[6vw] py-[70px]">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-7 font-display text-[clamp(1.75rem,3.5vw,2.625rem)] font-semibold text-indigo-ink">
              The problem is real
            </h2>
            <div className="grid gap-5 md:grid-cols-3">
              {NEWS.map((item) => (
                <article
                  key={item.href}
                  className="rounded-[14px] border-l-[6px] border-indigo-dye bg-white p-6 shadow-[0_6px_24px_rgba(0,0,0,0.06)]"
                >
                  <q className="mb-3.5 block text-[17px] leading-relaxed">{item.quote}</q>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-indigo-dye"
                  >
                    {item.source}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section id="how" className="px-[6vw] pb-[70px]">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-7 font-display text-[clamp(1.75rem,3.5vw,2.625rem)] font-semibold text-indigo-ink">
              How it works
            </h2>
            <div className="grid gap-5 md:grid-cols-3">
              {STEPS.map((step, index) => {
                const on = activeStep === index;
                return (
                  <button
                    key={step.n}
                    type="button"
                    onClick={() => setActiveStep(index)}
                    className={
                      "rounded-[14px] border-2 bg-white p-7 text-left transition " +
                      (on
                        ? "border-gold -translate-y-1"
                        : "border-transparent hover:border-gold hover:-translate-y-1")
                    }
                  >
                    <div className="text-[40px] leading-none font-extrabold text-gold">{step.n}</div>
                    <h3 className="mt-2 font-display text-xl font-semibold text-indigo-ink">{step.title}</h3>
                    <p className="mt-1 text-base leading-relaxed text-ink/75">{step.body}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="bg-resist-pattern px-[6vw] py-[70px] text-white">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-7 font-display text-[clamp(1.75rem,3.5vw,2.625rem)] font-semibold text-white">
              Results on our held-out test set
            </h2>
            <StatsGrid />
            <p className="mt-3.5 text-[13px] text-white/70">
              Small dataset, split by image. See model/EVAL.md in the repo for details.
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="px-[6vw] py-[70px]">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-7 font-display text-[clamp(1.75rem,3.5vw,2.625rem)] font-semibold text-indigo-ink">
              Built for Nigeria
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => (
                <article key={feature.title} className="rounded-xl bg-white p-[22px]">
                  <h3 className="mb-1.5 font-semibold text-indigo-dye">{feature.title}</h3>
                  <p className="text-base leading-relaxed text-ink/80">{feature.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="px-[6vw] pb-[70px]">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-7 font-display text-[clamp(1.75rem,3.5vw,2.625rem)] font-semibold text-indigo-ink">
              Questions
            </h2>
            {FAQ.map((item) => (
              <details key={item.q} className="mb-3 rounded-xl bg-white px-[22px] py-[18px]">
                <summary className="cursor-pointer font-bold text-indigo-ink">{item.q}</summary>
                <p className="mt-2.5 text-base leading-relaxed text-ink/80">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </Reveal>

      <footer className="bg-resist-pattern px-[6vw] py-[30px] text-sm text-white/90">
        AdireTrust by team spyders · Ogun Innovate Hackathon 2026 ·{" "}
        <Link to="/check" className="font-semibold text-gold">
          Open the app
        </Link>
      </footer>
    </div>
  );
}

function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={visible ? "translate-y-0 opacity-100 transition duration-700" : "translate-y-6 opacity-0 transition duration-700"}
    >
      {children}
    </div>
  );
}

function StatsGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(true);
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid gap-5 text-center sm:grid-cols-2 lg:grid-cols-4">
      {STATS.map((stat) => (
        <div key={stat.label}>
          <b className="block font-display text-[46px] leading-none font-semibold text-gold">
            <CountUp target={stat.n} active={active} />
          </b>
          <span className="mt-2 block text-base text-white">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}

function CountUp({ target, active }: { target: number; active: boolean }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || target === 0) {
      setValue(target);
      return;
    }
    const step = Math.max(1, Math.ceil(target / 40));
    let current = 0;
    const id = window.setInterval(() => {
      current = Math.min(target, current + step);
      setValue(current);
      if (current >= target) window.clearInterval(id);
    }, 30);
    return () => window.clearInterval(id);
  }, [active, target]);

  return <>{value}</>;
}
