import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { getHealth } from "../lib/api";
import { cn } from "../lib/format";
import { getLiveCapabilities, type LiveCapabilities } from "../lib/live";

const ALL_LINKS = [
  { to: "/check", label: "Check", end: true, key: "check" as const },
  { to: "/sellers", label: "Sellers", end: false, key: "sellers" as const },
  { to: "/passport", label: "Passport", end: false, key: "passport" as const },
  { to: "/chat", label: "Chat", end: false, key: "chat" as const },
];

export function Shell({ children }: { children: ReactNode }) {
  const [health, setHealth] = useState<"mock" | "ok" | "down" | "loading">("loading");
  const [caps, setCaps] = useState<LiveCapabilities | null>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const onLanding = location.pathname === "/";

  useEffect(() => {
    const pending = window.setTimeout(() => {
      void getHealth().then(setHealth);
      void getLiveCapabilities().then(setCaps);
    }, 0);
    return () => window.clearTimeout(pending);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const light = onLanding && !scrolled && !open;
  const healthLabel =
    health === "mock" ? "Demo data" : health === "ok" ? "API connected" : health === "down" ? "API unreachable" : "";

  const links = ALL_LINKS.filter((link) => {
    if (!caps) return link.key === "check" || link.key === "chat";
    if (link.key === "check") return true;
    if (link.key === "chat") return caps.chat;
    if (link.key === "sellers") return caps.sellers;
    if (link.key === "passport") return caps.passport;
    return false;
  });

  return (
    <div className="min-h-dvh bg-resist text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-indigo-ink"
      >
        Skip to content
      </a>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md transition-colors duration-300",
          light ? "border-white/10 bg-[#1b2a6b]/40 text-white" : "border-cloth/80 bg-resist/80 text-indigo-ink",
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link to="/" className="font-display text-[1.35rem] leading-none font-semibold tracking-tight">
            AdireTrust
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn("text-sm font-medium transition-opacity hover:opacity-100", isActive ? "opacity-100" : "opacity-70")
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {healthLabel ? (
              <p className="hidden text-[11px] tracking-wide opacity-70 lg:block" role="status">
                {healthLabel}
              </p>
            ) : null}
            <span className="hidden sm:inline-flex">
              <Link to="/check" className="btn-primary min-h-10 px-4 text-sm">
                Check a cloth
              </Link>
            </span>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full md:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((value) => !value)}
            >
              <span className="sr-only">Menu</span>
              <span aria-hidden="true" className="flex flex-col gap-1.5">
                <span className={cn("block h-px w-4 bg-current transition", open && "translate-y-1 rotate-45")} />
                <span className={cn("block h-px w-4 bg-current transition", open && "opacity-0")} />
                <span className={cn("block h-px w-4 bg-current transition", open && "-translate-y-1 -rotate-45")} />
              </span>
            </button>
          </div>
        </div>
        {open ? (
          <div id="mobile-nav" className="border-t border-cloth/80 bg-resist px-5 py-4 text-indigo-ink md:hidden">
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    cn("rounded-2xl px-3 py-3 text-base font-medium", isActive ? "bg-indigo-mist text-indigo-ink" : "")
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        ) : null}
      </header>
      <main id="main" className={onLanding ? "" : "pt-16"}>
        {children}
      </main>
    </div>
  );
}
