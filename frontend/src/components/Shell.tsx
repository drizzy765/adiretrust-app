import { useEffect, useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { getHealth } from "../lib/api";
import { cn } from "../lib/format";
import { ChatIcon, CheckIcon, MapIcon, TicketIcon } from "./Icons";

const links = [
  { to: "/", label: "Check", icon: CheckIcon, end: true },
  { to: "/sellers", label: "Sellers", icon: MapIcon, end: false },
  { to: "/passport", label: "Passport", icon: TicketIcon, end: false },
  { to: "/chat", label: "Chat", icon: ChatIcon, end: false },
];

export function Shell({ children }: { children: ReactNode }) {
  const [health, setHealth] = useState<"mock" | "ok" | "down" | "loading">("loading");

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
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-resist focus:px-4 focus:py-2 focus:text-indigo-ink"
      >
        Skip to content
      </a>
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-cloth bg-resist/95 px-4 backdrop-blur-sm">
        <div className="min-w-0">
          <p className="font-display text-lg leading-none font-semibold text-indigo-ink">AdireTrust</p>
          <p className="mt-1 text-[11px] leading-none text-muted">Abeokuta cloth check</p>
        </div>
        {healthLabel ? (
          <p className="text-[13px] leading-none text-muted" role="status">
            {healthLabel}
          </p>
        ) : null}
      </header>
      <main id="main" className="pt-14">
        {children}
      </main>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-cloth bg-resist/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm"
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
                    isActive ? "text-indigo-dye" : "text-muted",
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
