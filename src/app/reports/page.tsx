import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

export const metadata: Metadata = { title: "التقارير | DEQS" };

export default function Page() {
  return (
    <PlaceholderPage
      eyebrow="رؤية أوضح"
      title="تفاصيل تساعدك على متابعة محلك"
      description="مساحة مخصّصة لعرض التقارير والملخصات المالية."
      panelTitle="التقارير"
      icon="chart"
      emptyTitle="التقارير غير متاحة بعد"
      emptyDescription="ستتوفر التقارير في مرحلة لاحقة بعد ربط البيانات المالية. لا تُعرض أرقام أو نتائج تقديرية."
    />
  );
}
