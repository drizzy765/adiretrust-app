import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { getHealth } from "../lib/api";
import { cn } from "../lib/format";
import { ChatIcon, CheckIcon, MapIcon, TicketIcon } from "./Icons";

const links = [
  { to: "/check", label: "Check", icon: CheckIcon, end: true },
  { to: "/sellers", label: "Sellers", icon: MapIcon, end: false },
  { to: "/passport", label: "Passport", icon: TicketIcon, end: false },
  { to: "/chat", label: "Chat", icon: ChatIcon, end: false },
];

export function Shell({ children }: { children: ReactNode }) {
  const [health, setHealth] = useState<"mock" | "ok" | "down" | "loading">("loading");
  const location = useLocation();
  const onLanding = location.pathname === "/";

  useEffect(() => {
    const pending = window.setTimeout(() => {
      void getHealth().then(setHealth);
    }, 0);
    return () => window.clearTimeout(pending);
  }, []);

  const healthLabel =
    health === "mock" ? "Demo data" : health === "ok" ? "API connected" : health === "down" ? "API unreachable" : "";

  return (
    <div className="min-h-dvh bg-resist text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-indigo-ink"
      >
        Skip to content
      </a>
      <header className="bg-resist-pattern fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 px-4 text-white">
        <Link to="/" className="min-w-0">
          <p className="font-display text-lg leading-none font-semibold">
            Adire<span className="text-gold">Trust</span>
          </p>
          {onLanding ? null : <p className="mt-1 text-[11px] leading-none text-white/70">Abeokuta cloth check</p>}
        </Link>
        <div className="flex items-center gap-3">
          {healthLabel ? (
            <p className="hidden text-[13px] leading-none text-white/70 sm:block" role="status">
              {healthLabel}
            </p>
          ) : null}
          {onLanding ? (
            <Link
              to="/check"
              className="inline-flex min-h-9 items-center rounded-full bg-gold px-4 text-sm font-bold text-indigo-ink"
            >
              Open the app
            </Link>
          ) : null}
        </div>
      </header>
      <main id="main" className="pt-14">
        {children}
      </main>
      <nav
        aria-label="Primary"
        className="bg-resist-pattern fixed inset-x-0 bottom-0 z-40 border-t border-white/10 pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="mx-auto grid h-16 max-w-lg grid-cols-4">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    "flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium",
                    isActive ? "text-gold" : "text-white/70",
                  )
                }
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
