export function SectionIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="section-intro"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p className="intro-description">{description}</p></div>;
}
