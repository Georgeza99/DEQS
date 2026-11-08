import Link from "next/link";
import { DebtSummary } from "@/components/debt-summary";
import { EmptyState } from "@/components/empty-state";
import { Icon, type IconName } from "@/components/icon";
import { SectionIntro } from "@/components/section-intro";

const summaries: { title: string; icon: IconName; caption: string }[] = [
  { title: "عدد الزبائن النشطين", icon: "users", caption: "الزبائن أصحاب الحسابات النشطة" },
  { title: "أرصدة لصالح الزبائن", icon: "wallet", caption: "مبالغ متاحة لصالح الزبائن" },
  { title: "مشتريات اليوم", icon: "purchase", caption: "إجمالي المشتريات المسجّلة اليوم" },
  { title: "تسديدات اليوم", icon: "payment", caption: "إجمالي التسديدات المسجّلة اليوم" },
];

export default function Home() {
  return (
    <>
      <div className="dashboard-intro">
        <SectionIntro
          eyebrow="أهلًا بك في DEQS"
          title="نظرة واضحة على حسابات محلك"
          description="إدارة الزبائن والديون بسهولة وأمان"
        />
        <Link className="button-primary" href="/customers">
          <Icon name="users" />الانتقال إلى الزبائن<Icon name="arrow" />
        </Link>
      </div>

      <section aria-labelledby="overview-title">
        <div className="section-heading">
          <h2 id="overview-title">الملخص المالي</h2>
          <span className="quiet-label">القيم بالدينار الأردني</span>
        </div>
        <div className="overview-grid">
          <DebtSummary />
          <div className="secondary-metrics">
            {summaries.map(item => (
              <article className="metric-card" key={item.title}>
                <div className="metric-heading">
                  <h3>{item.title}</h3>
                  <span className="metric-icon"><Icon name={item.icon} /></span>
                </div>
                <p className="metric-value">غير متاح</p>
                <p className="metric-caption">{item.caption}</p>
              </article>
            ))}
          </div>
        </div>
        <p className="data-note">
          <span className="small-dot" aria-hidden="true" />
          البيانات المالية غير متصلة بعد. «غير متاح» لا يعني أن الرصيد صفر.
        </p>
      </section>

      <section className="surface activity-panel" aria-labelledby="activity-title">
        <div className="panel-heading">
          <div className="panel-title">
            <Icon name="activity" /><h2 id="activity-title">آخر الحركات المالية</h2>
          </div>
          <span className="quiet-label">سجل النشاط</span>
        </div>
        <EmptyState
          icon="activity"
          title="لا توجد حركات مالية متاحة حاليًا"
          description="ستظهر هنا آخر المشتريات والتسديدات عند توفّر البيانات المالية."
        />
      </section>
    </>
  );
}
