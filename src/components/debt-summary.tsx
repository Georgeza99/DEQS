"use client";

import { Fragment, useLayoutEffect, useState } from "react";
import { flushSync } from "react-dom";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";

export type DebtData =
  | { status: "unavailable" }
  | { status: "available"; amount: string };

const unavailable: DebtData = { status: "unavailable" };

// Format canonical decimal JOD without converting to floating point or calculating.
function formatJod(amount: string) {
  if (!/^\d+\.\d{3}$/.test(amount)) {
    throw new Error("Expected a non-negative JOD amount with exactly three decimal places.");
  }
  const [whole, fraction] = amount.split(".");
  return `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${fraction}`;
}

function JodNumber({ amount }: { amount: string }) {
  const groups = formatJod(amount).split(",");
  return (
    <span className="debt-number">
      {groups.map((group, index) => (
        <Fragment key={index}>
          <span className="debt-number-group">{group}{index < groups.length - 1 ? "," : ""}</span>
          {index < groups.length - 1 && <wbr />}
        </Fragment>
      ))}
    </span>
  );
}

export function DebtSummary({ data = unavailable }: { data?: DebtData }) {
  const pathname = usePathname();
  const [revealed, setRevealed] = useState(false);
  const available = data.status === "available";

  useLayoutEffect(() => {
    // Commit the mask before a page is suspended or captured for browser history.
    const reset = () => flushSync(() => setRevealed(false));
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") reset();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", reset);
    window.addEventListener("pageshow", reset);
    window.addEventListener("popstate", reset);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", reset);
      window.removeEventListener("pageshow", reset);
      window.removeEventListener("popstate", reset);
      // Also reset when React deactivates a cached route, before it can reappear.
      setRevealed(false);
    };
  }, [pathname]);

  return (
    <article className="debt-card" aria-labelledby="total-debt-title">
      <div className="debt-heading">
        <span className="debt-icon"><Icon name="wallet" /></span>
        <h3 id="total-debt-title">إجمالي ديون المحل</h3>
      </div>
      <div className="debt-total-row">
        <div id="total-debt-display" className="debt-value" aria-live="polite" aria-atomic="true">
          {!available ? (
            <span className="unavailable-value">لا توجد بيانات بعد</span>
          ) : !revealed ? (
            <>
              <span className="privacy-dots" aria-hidden="true">••••••</span>
              <span className="sr-only">المبلغ مخفي</span>
            </>
          ) : (
            <bdi className="debt-amount" dir="ltr">
              <JodNumber amount={data.amount} />
              <span className="currency">د.أ</span>
            </bdi>
          )}
        </div>
        {available && (
          <button
            type="button"
            className="icon-button privacy-toggle"
            aria-label={revealed ? "إخفاء إجمالي الديون" : "إظهار إجمالي الديون"}
            aria-controls="total-debt-display"
            aria-pressed={revealed}
            onClick={() => setRevealed(value => !value)}
          ><Icon name={revealed ? "eyeOff" : "eye"} /></button>
        )}
      </div>
      <p className="debt-caption">
        {available ? "اضغط على زر العين لإظهار المبلغ أو إخفائه" : "تظهر القيمة عند توفّر البيانات المالية"}
      </p>
      <div className="debt-footer">
        <span className="small-dot" aria-hidden="true" />الدينار الأردني · د.أ
      </div>
    </article>
  );
}
