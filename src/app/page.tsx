import { BrandMark } from "@/components/brand-mark";

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col">
      <a href="#main-content" className="skip-link">انتقل إلى المحتوى</a>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-10 sm:py-6">
        <div className="flex shrink-0 items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-950 text-white"><BrandMark className="size-7" /></span>
          <span dir="ltr" className="text-2xl font-bold tracking-[0.06em] text-emerald-950">DEQS</span>
        </div>
        <span className="rounded-full border border-emerald-900/10 bg-white/70 px-3 py-2 text-sm leading-6 text-emerald-900 sm:px-4">بداية منظّمة لمحلك</span>
      </header>

      <main id="main-content" tabIndex={-1} className="flex flex-1 items-center justify-center px-5 py-4 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-emerald-700 sm:px-10 sm:py-6">
        <section aria-labelledby="welcome-title" className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-emerald-900/10 bg-white px-5 py-7 text-center shadow-[0_20px_80px_-40px_rgba(6,59,43,0.24)] sm:px-10 sm:py-8">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-emerald-900" />
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl border border-emerald-900/10 bg-emerald-50 text-emerald-900 sm:size-18"><BrandMark className="size-10 sm:size-11" /></div>
          <p className="mb-2 text-sm leading-6 font-bold text-emerald-800">أهلًا بك في <bdi>DEQS</bdi></p>
          <h1 id="welcome-title" className="text-[1.75rem] leading-normal font-bold text-emerald-950 sm:text-[2.5rem]">نظام إدارة ديون المحل</h1>
          <p className="mt-2 text-base leading-7 text-stone-600 sm:text-lg">إدارة الزبائن والديون بسهولة وأمان</p>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-stone-600 sm:text-base">مساحة عمل واضحة ومنظّمة، صُمّمت لتناسب احتياجات محلك اليومية.</p>
          <div className="mt-5 inline-flex items-center gap-2.5 rounded-full bg-stone-100 px-4 py-2 text-sm leading-6 text-stone-600">
            <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-emerald-700" />
            المرحلة الأولى · الواجهة التمهيدية
          </div>
        </section>
      </main>

      <footer className="px-5 py-4 text-center text-sm leading-6 text-stone-600">
        <p><bdi className="font-semibold text-emerald-900">DEQS</bdi><span aria-hidden="true" className="mx-2">·</span>صُمّم لبداية أكثر تنظيمًا</p>
      </footer>
    </div>
  );
}
