type PageKey = "dashboard" | "transactions" | "budgets" | "reports"| "profile";

function Sidebar({
  active,
  onNavigate,
}: {
  active: PageKey;
  onNavigate: (p: PageKey) => void;
}) {
  const itemStyle = (active?: boolean) =>
  ({
    padding: "10px 12px",
    borderRadius: 10,
    color: active ? "#111827" : "#6b7280",
    background: active ? "rgba(17,24,39,0.06)" : "transparent",
    fontWeight: active ? 600 : 500,
    cursor: "pointer",
  } as const);

  return (
    <aside
      style={{
        width: 260,
        background: "#ffffff",
        borderRight: "1px solid rgba(17,24,39,0.08)",
        padding: 18,
        boxSizing: "border-box",
      }}
    >
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: "#111827" }} />
        <div>
          <div style={{ fontWeight: 800, color: "#111827" }}>Personal Finance</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Dashboard</div>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>MENU</div>

        <div style={itemStyle(active === "dashboard")} onClick={() => onNavigate("dashboard")}>
          Dashboard
        </div>
        <div style={itemStyle(active === "transactions")} onClick={() => onNavigate("transactions")}>
          Transactions
        </div>
        <div style={itemStyle(active === "budgets")} onClick={() => onNavigate("budgets")}>
          Budgets
        </div>
        <div style={itemStyle(active === "reports")} onClick={() => onNavigate("reports")}>
          Reports
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>SETTINGS</div>
        <div
          style={itemStyle(active === "profile")}
          onClick={() => onNavigate("profile")}
        >
          Profile
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
