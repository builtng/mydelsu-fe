'use client';
import React from "react";
import { usePathname } from "next/navigation";

const BLUE = "#5a8abb";
const BLUE_DARK = "#4574a4";

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const menuItems = [
    { label: "Manna Payouts", href: "/admin/manna" },
    { label: "Academic Setup", href: "/admin/academic" },
    { label: "Roles", href: "/admin/roles" },
    { label: "Permissions", href: "/admin/permissions" },
    { label: "User Roles", href: "/admin/users" },
  ];

  return (
    <div className="admin-container">
      <style>{css}</style>
      
      <header className="topbar">
        <div className="tb-left">
          <a className="logo-link" href="/">
            <span className="logo-my">my</span>
            <span className="logo-badge"><span className="logo-badge-inner">DELSU</span></span>
          </a>
          <span className="tb-tag">Admin Console</span>
        </div>
        <div className="tb-right">
          <span className="tb-user">System Admin</span>
          <a className="logout-btn" href="/login">Sign Out</a>
        </div>
      </header>

      <div className="admin-body">
        <aside className="sidebar">
          <div className="sidebar-head">Navigation</div>
          <nav className="sidebar-nav">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={"nav-item" + (isActive ? " active" : "")}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </aside>

        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}

const css = `
.admin-container {
  --blue: ${BLUE};
  --blueDark: ${BLUE_DARK};
  --ink: #0f172a;
  --body: #475569;
  --muted: #7c8b9c;
  --line: #e6e9ee;
  --soft: #f5f7fa;
  font-family: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif;
  color: var(--ink);
  background: var(--soft);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: ${BLUE};
  color: #fff;
  height: 56px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.tb-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 7px;
  text-decoration: none;
}

.logo-my {
  color: #fff;
  font-weight: 800;
  font-style: italic;
  font-size: 22px;
  letter-spacing: -.5px;
}

.logo-badge {
  background: #fff;
  border-radius: 5px;
  padding: 2px 8px;
  transform: skewX(-9deg);
}

.logo-badge-inner {
  display: inline-block;
  transform: skewX(9deg);
  color: #3f6f9e;
  font-weight: 800;
  font-style: italic;
  font-size: 16px;
  letter-spacing: 1px;
}

.tb-tag {
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  opacity: .9;
  border-left: 1px solid rgba(255,255,255,.4);
  padding-left: 10px;
  margin-left: 2px;
}

.tb-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tb-user {
  font-size: 13px;
  font-weight: 600;
  opacity: .9;
}

.logout-btn {
  color: #fff;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid rgba(255,255,255,0.4);
  padding: 4px 10px;
  border-radius: 6px;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(255,255,255,0.1);
}

.admin-body {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid var(--line);
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 768px) {
  .admin-body {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--line);
    padding: 12px 16px;
  }
  .sidebar-nav {
    flex-direction: row !important;
    overflow-x: auto;
  }
}

.sidebar-head {
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 800;
  padding-left: 8px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: block;
  padding: 10px 12px;
  color: var(--body);
  text-decoration: none;
  font-size: 14.5px;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.2s;
}

.nav-item:hover {
  color: var(--blue);
  background: #f1f5f9;
}

.nav-item.active {
  color: var(--blueDark);
  background: #eef4fb;
}

.admin-main {
  flex: 1;
  padding: 28px;
  background: var(--soft);
}

@media (max-width: 560px) {
  .admin-main {
    padding: 16px;
  }
}
`;
