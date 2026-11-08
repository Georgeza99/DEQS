import { Icon, type IconName } from "@/components/icon";
export function EmptyState({ icon, title, description }: { icon: IconName; title: string; description: string }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name={icon} /></span><h3>{title}</h3><p>{description}</p></div>;
}
