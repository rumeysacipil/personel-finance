import React, { useEffect, useState } from "react";
import { AUTH_EVENTS, clearTokens, getAccessToken } from "./services/api";
import LoginPage from "./pages/LoginPage";
import Topbar from "./components/Layout/Topbar";

import MarketRates from "./components/MarketRates/MarketRates";
import MonthlySummary from "./components/Reports/MonthlySummary";
import MonthSelector from "./components/Reports/MonthSelector";
import { CategoryBreakdown } from "./components/Reports/CategoryBreakdown";
import SpendingTrends from "./components/Reports/SpendingTrends";
import BudgetPanel from "./components/Budgets/BudgetPanel";

import TransactionsPage from "./components/Transactions/TransactionsPage";
import ReportsPage from "./components/Reports/ReportsPage";
import ProfilePage from "./components/Profile/ProfilePage";

export type PageKey = "dashboard" | "transactions" | "budgets" | "reports" | "settings";

const PAGE_TITLES: Record<PageKey, string> = {
  dashboard: "Kontrol Paneli",
  transactions: "İşlemler",
  budgets: "Bütçe Yönetimi",
  reports: "Raporlar",
  settings: "Hesap Ayarları",
};

export default function App() {
  const [activePage, setActivePage] = useState<PageKey>("dashboard");

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [authed, setAuthed] = useState(Boolean(getAccessToken()));

  const logout = () => {
    clearTokens();
    setAuthed(false);
    setActivePage("dashboard");
  };

  useEffect(() => {
    const handler = () => logout();
    window.addEventListener(AUTH_EVENTS.LOGOUT, handler);
    return () => window.removeEventListener(AUTH_EVENTS.LOGOUT, handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setAuthed(Boolean(getAccessToken()));
  }, []);

  if (!authed) {
    return (
      <LoginPage
        onSuccess={() => {
          setAuthed(true);
          setActivePage("dashboard");
        }}
      />
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        overflow: "hidden",
        background: "#f4f6fa",
      }}
    >
      <main
        style={{
          flex: 1,
          height: "100%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Topbar
          active={activePage}
          onNavigate={setActivePage}
          onLogout={logout}
          onProfileClick={() => setActivePage("settings")}
        />

        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            padding: 24,
            boxSizing: "border-box",
          }}
        >
          {activePage === "transactions" && <TransactionsPage />}

          {activePage === "reports" && <ReportsPage />}

          {activePage === "settings" && <ProfilePage />}

          {activePage === "budgets" && (
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#111827", marginBottom: 16 }}>
                {PAGE_TITLES.budgets}
              </div>
              <Panel title="Bütçe Yönetimi">
                <BudgetPanel year={year} month={month} />
              </Panel>
            </div>
          )}

          {activePage === "dashboard" && (
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#111827" }}>
                  {PAGE_TITLES.dashboard}
                </div>
                <div style={{ fontSize: 14, color: "#6b7280" }}>
                  Finansal performans ve piyasa verilerinin genel değerlendirmesi
                </div>
              </div>

              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 12 }}>Güncel Piyasa Verileri</div>
                <MarketRates />
              </div>

              <div style={{ marginBottom: 14 }}>
                <MonthSelector
                  year={year}
                  month={month}
                  onChange={(y, m) => {
                    setYear(y);
                    setMonth(m);
                  }}
                />
                <div style={{ color: "#6b7280", fontSize: 12, marginTop: 8 }}>
                  Seçilen Dönem: {year}-{month}
                </div>
              </div>

              <MonthlySummary year={year} month={month} />

              <div
                style={{
                  marginTop: 28,
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr",
                  gap: 20,
                }}
              >
                <Panel title="Kategori Dağılımı">
                  <CategoryBreakdown year={year} month={month} />
                </Panel>

                <Panel title="Gelir / Gider Eğilimi">
                  <SpendingTrends year={year} month={month} />
                </Panel>
              </div>

              <div style={{ marginTop: 24 }}>
                <Panel title="Bütçe Durumu">
                  <BudgetPanel year={year} month={month} />
                </Panel>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 18,
        padding: 18,
        border: "1px solid rgba(17,24,39,0.08)",
        boxShadow: "0 10px 30px rgba(17,24,39,0.06)",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}
