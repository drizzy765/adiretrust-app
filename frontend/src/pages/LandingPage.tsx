import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ResistMotif } from "../components/ResistMotif";

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
    body: "Read the reasons, then ask follow-up questions in English, Yoruba, Hausa, Igbo or Pidgin.",
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
  { title: "Local languages", body: "Chat in English, Yoruba, Hausa, Igbo and Pidgin." },
  { title: "Honest when unsure", body: "It abstains when it is not sure, instead of guessing." },
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
  return (
    <div className="bg-resist text-ink">
      <section className="relative overflow-hidden bg-indigo-ink text-resist">
        <ResistMotif className="pointer-events-none absolute -right-16 -top-10 h-[28rem] w-[28rem] text-white/15" />
        <ResistMotif className="pointer-events-none absolute -bottom-24 -left-20 h-[22rem] w-[22rem] text-gold/15" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pt-28 pb-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pt-32 lg:pb-24">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] text-gold uppercase">Abeokuta cloth check</p>
            <h1 className="mt-4 font-display text-[clamp(2.6rem,6vw,5.1rem)] leading-[0.98] font-medium text-resist">
              Is your Adire hand-dyed, or a factory print?
            </h1>
            <p className="mt-6 max-w-[36rem] text-base leading-relaxed text-resist/80 sm:text-lg">
              Snap one photo. AdireTrust checks it and explains why, so buyers stop overpaying for fakes and makers
              keep their craft alive.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link to="/check" className="btn-primary">
                Check a cloth
              </Link>
              <a href="#how" className="btn-secondary text-resist">
                How it works
              </a>
            </div>
          </div>
          <figure className="photo-frame aspect-[4/5] max-h-[36rem] w-full justify-self-end lg:max-h-none">
            <img
              src="/workshop.jpg"
              alt="Our teammate Paul collecting data at a workshop in Ibadan"
              className="h-full w-full object-cover object-center"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1b2a6b]/90 to-transparent px-5 pt-16 pb-5 text-sm text-resist">
              Our teammate Paul collecting data at a workshop in Ibadan
            </figcaption>
          </figure>
        </div>
      </section>

      <Reveal>
        <section id="news" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-medium tracking-[0.18em] text-indigo-ink/60 uppercase">The problem in the news</p>
            <h2 className="mt-3 max-w-2xl font-display text-[clamp(2rem,4vw,3.4rem)] leading-[1.1] font-medium text-indigo-ink">
              Fake Adire is already in the market.
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {NEWS.map((item) => (
                <article
                  key={item.href}
                  className="shadow-card rounded-2xl border border-cloth/70 bg-[#fffaf3] p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(27,42,107,0.12)]"
                >
                  <q className="font-display block text-xl leading-snug text-indigo-ink">{item.quote}</q>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-block text-sm font-semibold text-indigo-ink underline decoration-gold decoration-2 underline-offset-4"
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
        <section id="how" className="scroll-mt-24 px-5 pb-20 sm:px-8 sm:pb-28">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-medium tracking-[0.18em] text-indigo-ink/60 uppercase">How it works</p>
            <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.4rem)] leading-[1.1] font-medium text-indigo-ink">
              From a single photograph to a reasoned verdict.
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {STEPS.map((step) => (
                <article
                  key={step.n}
                  className="shadow-card rounded-2xl border border-cloth/70 bg-[#fffaf3] p-8 transition duration-300 hover:-translate-y-1"
                >
                  <p className="font-display text-4xl text-gold">{step.n}</p>
                  <h3 className="mt-4 font-display text-2xl font-medium text-indigo-ink">{step.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-muted">{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section id="results" className="relative scroll-mt-24 overflow-hidden bg-indigo-ink px-5 py-20 text-resist sm:px-8 sm:py-28">
          <ResistMotif className="pointer-events-none absolute right-[-4rem] bottom-[-5rem] h-80 w-80 text-white/10" />
          <div className="relative mx-auto max-w-6xl">
            <p className="text-xs font-medium tracking-[0.18em] text-gold uppercase">Held-out test set</p>
            <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.4rem)] leading-[1.1] font-medium">
              Results on our held-out test set
            </h2>
            <StatsGrid />
            <p className="mt-8 max-w-2xl text-sm text-resist/70">
              Small dataset, split by image. See model/EVAL.md in the repo for details.
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section id="features" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-medium tracking-[0.18em] text-indigo-ink/60 uppercase">Built for Nigeria</p>
            <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.4rem)] leading-[1.1] font-medium text-indigo-ink">
              A check, a map, a passport, and a conversation.
            </h2>
            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <article
                  key={feature.title}
                  className="shadow-card rounded-2xl border border-cloth/70 bg-[#fffaf3] p-8 transition duration-300 hover:-translate-y-1"
                >
                  <h3 className="font-display text-2xl font-medium text-indigo-ink">{feature.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-muted">{feature.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section id="story" className="scroll-mt-24 px-5 pb-20 sm:px-8 sm:pb-28">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
            <figure className="photo-frame aspect-[4/5]">
              <img
                src="/workshop.jpg"
                alt="Our teammate Paul collecting data at a workshop in Ibadan"
                className="h-full w-full object-cover object-center"
              />
            </figure>
            <div>
              <p className="text-xs font-medium tracking-[0.18em] text-indigo-ink/60 uppercase">Workshop story</p>
              <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.4rem)] leading-[1.1] font-medium text-indigo-ink">
                Photographed where the cloth is made.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-ink/85">
                Our teammate Paul collected genuine pieces at a workshop in Ibadan, then photographed factory prints
                from the market. That fieldwork sits behind every check.
              </p>
              <Link to="/check" className="btn-primary mt-8">
                Check a cloth
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section id="faq" className="scroll-mt-24 px-5 pb-20 sm:px-8 sm:pb-28">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-medium tracking-[0.18em] text-indigo-ink/60 uppercase">Questions</p>
            <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.4rem)] leading-[1.1] font-medium text-indigo-ink">
              What this is, and what it is not.
            </h2>
            <div className="mt-10 space-y-4">
              {FAQ.map((item) => (
                <details
                  key={item.q}
                  className="shadow-card group rounded-2xl border border-cloth/70 bg-[#fffaf3] px-6 py-5"
                >
                  <summary className="cursor-pointer list-none font-display text-xl font-medium text-indigo-ink marker:hidden">
                    <span className="flex items-center justify-between gap-4">
                      {item.q}
                      <span className="text-gold transition group-open:rotate-45">+</span>
                    </span>
                  </summary>
                  <p className="mt-3 text-base leading-relaxed text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      <footer className="relative overflow-hidden bg-indigo-ink px-5 py-12 text-sm text-resist/80 sm:px-8">
        <ResistMotif className="pointer-events-none absolute right-0 top-0 h-40 w-40 text-white/10" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <p>AdireTrust by team spyders · Ogun Innovate Hackathon 2026</p>
          <Link to="/check" className="font-semibold text-gold">
            Open the app
          </Link>
        </div>
      </footer>
    </div>
  );
}

function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.classList.add("in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.16 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="reveal">
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
    <div ref={ref} className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
      {STATS.map((stat) => (
        <div key={stat.label} className="border-t border-white/20 pt-5">
          <p className="font-display text-5xl leading-none font-medium text-gold sm:text-6xl">
            <CountUp target={stat.n} active={active} />
          </p>
          <p className="mt-3 text-sm leading-snug text-resist/80">{stat.label}</p>
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
