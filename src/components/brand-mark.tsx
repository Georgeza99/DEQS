export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M13 10h18a5 5 0 0 1 5 5v23H17a5 5 0 0 1-5-5V11a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M12 32h24M20 18h9M20 24h6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="m29 5 3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
