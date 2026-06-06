import { useEffect, useMemo, useState } from "react";
import { getMe, type MeResponse } from "../../services/userService";
import { logout as apiLogout } from "../../services/authService";
import { SERVER_BASE_URL } from "../../services/api";
import type { PageKey } from "../../App";

const NAV_ITEMS: { key: PageKey; label: string }[] = [
  { key: "dashboard", label: "Kontrol Paneli" },
  { key: "transactions", label: "İşlemler" },
  { key: "budgets", label: "Bütçe" },
  { key: "reports", label: "Raporlar" },
  { key: "settings", label: "Ayarlar" },
];

function initials(me: MeResponse | null) {
  const fn = me?.firstName?.trim() ?? "";
  const ln = me?.lastName?.trim() ?? "";
  const a = fn ? fn[0].toUpperCase() : "";
  const b = ln ? ln[0].toUpperCase() : "";
  return (a + b) || (me?.email?.[0]?.toUpperCase() ?? "U");
}

function fullName(me: MeResponse | null) {
  const fn = me?.firstName?.trim() ?? "";
  const ln = me?.lastName?.trim() ?? "";
  const name = `${fn} ${ln}`.trim();
  return name || "Kullanıcı";
}

function NavItem({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: active ? "1px solid rgba(37,99,235,0.26)" : "1px solid transparent",
        background: active ? "rgba(37,99,235,0.10)" : "transparent",
        color: active ? "#1d4ed8" : "#475569",
        borderRadius: 999,
        padding: "8px 14px",
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 140ms ease",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "rgba(15,23,42,0.05)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      {label}
    </button>
  );
}

export default function Topbar({
  active,
  onNavigate,
  onLogout,
  onProfileClick,
}: {
  active: PageKey;
  onNavigate: (p: PageKey) => void;
  onLogout: () => void;
  onProfileClick: () => void;
}) {
  const [me, setMe] = useState<MeResponse | null>(null);

  async function refreshMe() {
    try {
      const data = await getMe();
      setMe(data);
    } catch {
      setMe(null);
    }
  }

  useEffect(() => {
    refreshMe();
    const handler = () => refreshMe();
    window.addEventListener("me:updated", handler);
    return () => window.removeEventListener("me:updated", handler);
  }, []);

  const avatarSrc = useMemo(() => {
    const url = me?.profileImageUrl;
    if (!url) return "";
    return `${SERVER_BASE_URL}${url}?t=${Date.now()}`;
  }, [me]);

  return (
    <div
      style={{
        height: 64,
        position: "sticky",
        top: 0,
        zIndex: 30,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.86) 100%)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(15,23,42,0.08)",
      }}
    >
      <div
        style={{
          height: "100%",
          maxWidth: 1250,
          margin: "0 auto",
          padding: "0 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
          gap: 14,
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 180 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 12,
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.28), transparent 55%), linear-gradient(135deg,#2563eb 0%, #4f46e5 55%, #7c3aed 100%)",
              boxShadow: "0 12px 28px rgba(37,99,235,0.22)",
            }}
          />
          <div style={{ display: "grid", lineHeight: 1.1 }}>
            <div style={{ fontWeight: 950, color: "#0f172a", fontSize: 14 }}>FinanceTracker</div>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Kişisel Finans</div>
          </div>
        </div>

        {/* Navigation */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: 5,
            borderRadius: 999,
            border: "1px solid rgba(15,23,42,0.08)",
            background: "rgba(255,255,255,0.75)",
            boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
            overflowX: "auto",
          }}
        >
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.key}
              active={active === item.key}
              label={item.label}
              onClick={() => onNavigate(item.key)}
            />
          ))}
        </div>

        {/* Profile + Logout */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 200, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onProfileClick}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              padding: "6px 10px",
              borderRadius: 14,
              border: "1px solid rgba(15,23,42,0.10)",
              background: "rgba(255,255,255,0.85)",
              boxShadow: "0 10px 26px rgba(15,23,42,0.06)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                border: "1px solid rgba(15,23,42,0.10)",
                overflow: "hidden",
                background: "rgba(15,23,42,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 950,
                color: "#0f172a",
                userSelect: "none",
              }}
            >
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  onError={() =>
                    setMe((prev) =>
                      prev ? { ...prev, profileImageUrl: null } : prev
                    )
                  }
                />
              ) : (
                initials(me)
              )}
            </div>

            <div style={{ display: "grid", textAlign: "left", lineHeight: 1.1 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{fullName(me)}</div>
            </div>
          </button>

          <button
            type="button"
            onClick={async () => {
              if (!confirm("Oturumu kapatmak istiyor musunuz?")) return;
              try {
                await apiLogout();
              } finally {
                onLogout();
              }
            }}
            style={{
              border: "1px solid rgba(15,23,42,0.12)",
              background: "#ffffff",
              borderRadius: 12,
              padding: "10px 12px",
              fontSize: 12,
              fontWeight: 800,
              cursor: "pointer",
              color: "#0f172a",
            }}
          >
            Çıkış Yap
          </button>
        </div>
      </div>
    </div>
  );
}
