import { EmptyState } from "@/components/empty-state";
import { SectionIntro } from "@/components/section-intro";
import type { IconName } from "@/components/icon";

type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  panelTitle: string;
  icon: IconName;
  emptyTitle: string;
  emptyDescription: string;
};

export function PlaceholderPage(props: PlaceholderPageProps) {
  return (
    <>
      <SectionIntro eyebrow={props.eyebrow} title={props.title} description={props.description} />
      <section className="surface placeholder-panel" aria-label={props.panelTitle}>
        <div className="panel-heading"><h2>{props.panelTitle}</h2></div>
        <EmptyState icon={props.icon} title={props.emptyTitle} description={props.emptyDescription} />
      </section>
    </>
  );
}
