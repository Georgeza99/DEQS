import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

export const metadata: Metadata = { title: "الإعدادات | DEQS" };

export default function Page() {
  return (
    <PlaceholderPage
      eyebrow="تفضيلات العمل"
      title="إعدادات تناسب طريقة عملك"
      description="مساحة مخصّصة لإعدادات المحل وتفضيلات التطبيق."
      panelTitle="الإعدادات"
      icon="settings"
      emptyTitle="الإعدادات غير متاحة بعد"
      emptyDescription="ستتوفر خيارات إعداد التطبيق في مرحلة لاحقة. لا توجد إعدادات قابلة للتعديل حاليًا."
    />
  );
}
