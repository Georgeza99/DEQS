"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { Icon, type IconName } from "@/components/icon";

const navigation: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "الرئيسية", icon: "home" },
  { href: "/customers", label: "الزبائن", icon: "users" },
  { href: "/archive", label: "الأرشيف", icon: "archive" },
  { href: "/reports", label: "التقارير", icon: "chart" },
  { href: "/settings", label: "الإعدادات", icon: "settings" },
];

function Brand() {
  return (
    <div className="brand">
      <span className="brand-symbol"><BrandMark className="size-8" /></span>
      <div className="brand-copy">
        <span dir="ltr" className="wordmark">DEQS</span>
        <span className="brand-description">نظام إدارة ديون المحل</span>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const drawer = useRef<HTMLDialogElement>(null);
  const mobileToggle = useRef<HTMLButtonElement>(null);

  function openDrawer() {
    drawer.current?.showModal();
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    drawer.current?.close();
  }

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (media.matches) drawer.current?.close();
    };
    media.addEventListener("change", closeOnDesktop);
    return () => {
      media.removeEventListener("change", closeOnDesktop);
      document.body.style.overflow = "";
    };
  }, []);

  function navLinks(compact = false) {
    return navigation.map(item => (
      <Link
        key={item.href}
        href={item.href}
        className={`nav-link ${pathname === item.href ? "active" : ""}`}
        aria-current={pathname === item.href ? "page" : undefined}
        title={compact ? item.label : undefined}
        onClick={closeDrawer}
      >
        <Icon name={item.icon} />
        <span className={compact ? "sr-only" : ""}>{item.label}</span>
      </Link>
    ));
  }

  return (
    <div className={`app-shell ${collapsed ? "is-collapsed" : ""}`}>
      <a href="#main-content" className="skip-link">انتقل إلى المحتوى</a>
      <aside className="desktop-sidebar" aria-label="الشريط الجانبي">
        <div className="sidebar-brand"><Brand /></div>
        <div className="sidebar-section-label" aria-hidden="true">مساحة العمل</div>
        <nav aria-label="التنقل الرئيسي">{navLinks(collapsed)}</nav>
        <div className="sidebar-bottom">
          <button
            className="nav-link collapse-button"
            onClick={() => setCollapsed(value => !value)}
            aria-label={collapsed ? "توسيع الشريط الجانبي" : "طي الشريط الجانبي"}
            aria-expanded={!collapsed}
            title={collapsed ? "توسيع الشريط الجانبي" : undefined}
          >
            <Icon name="collapse" />
            <span className={collapsed ? "sr-only" : ""}>طي القائمة</span>
          </button>
          <p className="sidebar-footnote">وضوح في كل يوم</p>
        </div>
      </aside>

      <div className="workspace">
        <header className="app-header">
          <div className="header-title">
            <button
              ref={mobileToggle}
              className="icon-button mobile-toggle"
              aria-label="فتح قائمة التنقل"
              aria-haspopup="dialog"
              aria-controls="mobile-navigation"
              onClick={openDrawer}
            ><Icon name="menu" /></button>
            <div>
              <p className="header-eyebrow">مساحة العمل</p>
              <h1>{navigation.find(item => item.href === pathname)?.label ?? "DEQS"}</h1>
            </div>
          </div>
          <span className="header-brand" dir="ltr">
            DEQS <span className="header-brand-dot" aria-hidden="true" />
          </span>
        </header>
        <main id="main-content" tabIndex={-1} className="main-content">{children}</main>
      </div>

      {/* Native modal makes the rest of the page inert; explicit Tab wrapping
          keeps keyboard focus inside the navigation in both directions. */}
      <dialog
        ref={drawer}
        id="mobile-navigation"
        className="mobile-drawer"
        aria-labelledby="drawer-title"
        onClose={() => {
          document.body.style.overflow = "";
          mobileToggle.current?.focus();
        }}
        onKeyDown={event => {
          if (event.key !== "Tab") return;
          const items = event.currentTarget.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled])',
          );
          const first = items[0];
          const last = items[items.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onClick={event => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right ||
              event.clientY < bounds.top || event.clientY > bounds.bottom) {
            closeDrawer();
          }
        }}
      >
        <div className="drawer-header">
          <span id="drawer-title" className="sr-only">قائمة التنقل</span>
          <Brand />
          <button className="icon-button" aria-label="إغلاق قائمة التنقل" onClick={closeDrawer} autoFocus>
            <Icon name="close" />
          </button>
        </div>
        <nav aria-label="التنقل على الهاتف">{navLinks()}</nav>
        <p className="drawer-note">نظام إدارة ديون المحل</p>
      </dialog>
    </div>
  );
}
