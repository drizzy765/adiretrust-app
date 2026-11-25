type IconProps = { className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function CameraIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...stroke} d="M4 8.5h3.2l1.3-2h7l1.3 2H20v10H4v-10z" />
      <circle {...stroke} cx="12" cy="13.2" r="3.1" />
    </svg>
  );
}

export function UploadIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...stroke} d="M12 16V6" />
      <path {...stroke} d="M8.2 9.2 12 5.5l3.8 3.7" />
      <path {...stroke} d="M5 16.5V19h14v-2.5" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect {...stroke} x="4" y="5" width="16" height="14" rx="2" />
      <path {...stroke} d="M8 12.2 10.6 15 16 9.5" />
    </svg>
  );
}

export function MapIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...stroke} d="M12 20s6-5.1 6-9.2A6 6 0 0 0 6 10.8C6 14.9 12 20 12 20z" />
      <circle {...stroke} cx="12" cy="10.6" r="1.7" />
    </svg>
  );
}

export function TicketIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...stroke} d="M4 8.5h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4v-3z" />
      <path {...stroke} d="M12 8.5v10" />
    </svg>
  );
}

export function ChatIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...stroke} d="M5 6.5h14v9H8.5L5 18.2V6.5z" />
    </svg>
  );
}

export function LocateIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle {...stroke} cx="12" cy="12" r="3" />
      <path {...stroke} d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2" />
    </svg>
  );
}
