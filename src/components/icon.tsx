import type { ReactNode } from "react";
export type IconName = "home" | "users" | "archive" | "chart" | "settings" | "menu" | "close" | "collapse" | "arrow" | "eye" | "eyeOff" | "wallet" | "purchase" | "payment" | "activity";
const paths: Record<IconName, ReactNode> = {
  home: <><path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/></>,
  users: <><circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-3-5"/></>,
  archive: <path d="M4 8h16v13H4zM3 3h18v5H3zM10 12h4"/>,
  chart: <path d="M4 3v18h17M9 16v-4M14 16V8M19 16V4"/>,
  settings: <><path d="m10 3-.8 2.5-2 .9-2.4-.6-2 3.4L4.5 11v2l-1.7 1.8 2 3.4 2.4-.6 2 .9L10 21h4l.8-2.5 2-.9 2.4.6 2-3.4-1.7-1.8v-2l1.7-1.8-2-3.4-2.4.6-2-.9L14 3Z"/><circle cx="12" cy="12" r="3"/></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
  close: <path d="m6 6 12 12M6 18 18 6"/>,
  collapse: <path d="M14 4v16M3 4h18v16H3zM7 9l3 3-3 3"/>,
  arrow: <path d="M20 12H4m6-6-6 6 6 6"/>,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
  eyeOff: <path d="m3 3 18 18M10.5 5.1 12 5c6.5 0 10 7 10 7a20 20 0 0 1-3 3.9M6.2 6.2A22 22 0 0 0 2 12s3.5 7 10 7a12 12 0 0 0 5.8-1.8M10 10a3 3 0 0 0 4 4"/>,
  wallet: <path d="M4 7V4h15v3M3 7h18v14H3zM16 12h5v5h-5z"/>,
  purchase: <><path d="M3 3h2l3 13h11l2-9H6"/><circle cx="9" cy="21" r="1"/><circle cx="18" cy="21" r="1"/></>,
  payment: <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>,
  activity: <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/></>,
};
export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
