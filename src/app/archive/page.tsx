import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

export const metadata: Metadata = { title: "الأرشيف | DEQS" };

export default function Page() {
  return (
    <PlaceholderPage
      eyebrow="سجل الزبائن"
      title="مرجع واضح للحسابات المؤرشفة"
      description="مساحة مخصّصة للرجوع إلى الزبائن المؤرشفين وسجل حساباتهم."
      panelTitle="الأرشيف"
      icon="archive"
      emptyTitle="الأرشيف غير متاح بعد"
      emptyDescription="ستتوفر أرشفة الزبائن والرجوع إلى سجلاتهم في مرحلة لاحقة. لا توجد بيانات أرشيف متصلة حاليًا."
    />
  );
}
