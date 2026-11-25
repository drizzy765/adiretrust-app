export function ResistMotif({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 480" className={className} aria-hidden="true" fill="none">
      <g stroke="currentColor" strokeWidth="1.4">
        <circle cx="120" cy="120" r="54" />
        <circle cx="120" cy="120" r="34" />
        <circle cx="120" cy="120" r="14" />
        <circle cx="300" cy="150" r="40" />
        <circle cx="300" cy="150" r="22" />
        <circle cx="300" cy="150" r="8" />
        <circle cx="200" cy="300" r="48" />
        <circle cx="200" cy="300" r="28" />
        <circle cx="200" cy="300" r="10" />
        <circle cx="380" cy="300" r="36" />
        <circle cx="380" cy="300" r="18" />
        <circle cx="80" cy="380" r="28" />
        <circle cx="80" cy="380" r="12" />
      </g>
      <g fill="currentColor">
        <circle cx="210" cy="80" r="3.5" />
        <circle cx="390" cy="90" r="3" />
        <circle cx="40" cy="230" r="3" />
        <circle cx="150" cy="200" r="2.5" />
        <circle cx="340" cy="230" r="3" />
        <circle cx="260" cy="400" r="3" />
        <circle cx="430" cy="200" r="2.5" />
        <circle cx="40" cy="80" r="2.5" />
      </g>
    </svg>
  );
}
