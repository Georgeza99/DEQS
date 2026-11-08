import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

export const metadata: Metadata = { title: "الزبائن | DEQS" };

export default function Page() {
  return (
    <PlaceholderPage
      eyebrow="دفتر الزبائن"
      title="كل زبائن محلك في مكان واحد"
      description="مساحة مخصّصة لتنظيم معلومات الزبائن ومتابعة حساباتهم."
      panelTitle="الزبائن"
      icon="users"
      emptyTitle="قائمة الزبائن غير متاحة بعد"
      emptyDescription="ستتوفر إضافة الزبائن ومتابعة حساباتهم في مرحلة لاحقة. لا توجد بيانات زبائن متصلة حاليًا."
    />
  );
}
