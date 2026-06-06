type Props = {
  title: string
  value: number | string
  prefix?: string
  suffix?: string
  decimals?: number
  icon?: string
  updatedAt?: string
  tone?: "blue" | "indigo" | "violet" | "sky"
}

function fmt(n: number, decimals: number) {
  return n.toLocaleString("tr-TR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function toneStyles(tone: Props["tone"]) {
  switch (tone) {
    case "indigo":
      return { a: "rgba(79,70,229,0.10)", b: "rgba(79,70,229,0.18)", c: "#4f46e5" }
    case "violet":
      return { a: "rgba(124,58,237,0.10)", b: "rgba(124,58,237,0.18)", c: "#7c3aed" }
    case "sky":
      return { a: "rgba(2,132,199,0.10)", b: "rgba(2,132,199,0.18)", c: "#0284c7" }
    case "blue":
    default:
      return { a: "rgba(37,99,235,0.10)", b: "rgba(37,99,235,0.18)", c: "#2563eb" }
  }
}

/**
 * Backend bazen nanosaniyeli ISO gönderiyor:
 * 2026-02-10T13:41:53.853721100Z
 * JS Date bunu her yerde parse edemeyebilir.
 * -> milisaniyeye indirger: 2026-02-10T13:41:53.853Z
 */
function normalizeIso(iso: string) {
  const s = String(iso).trim()
  // .853721100Z  -> .853Z
  return s.replace(/\.(\d{3})\d+(Z|[+-]\d\d:\d\d)$/, ".$1$2")
}

function formatUpdatedTR(iso: string) {
  if (!iso) return ""
  const normalized = normalizeIso(iso)
  const d = new Date(normalized)
  if (Number.isNaN(d.getTime())) return "" // parse edilemezse boş dön

  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}

export default function MarketRateCard({
  title,
  value,
  prefix,
  suffix,
  decimals = 2,
  icon,
  updatedAt,
  tone = "blue",
}: Props) {
  const t = toneStyles(tone)

  const num = Number(value ?? 0)
  const shown = Number.isFinite(num) ? fmt(num, decimals) : String(value ?? "-")

  const updatedText = updatedAt ? `Son Güncelleme: ${formatUpdatedTR(updatedAt)}` : ""

  return (
    <div
      style={{
        borderRadius: 20,
        padding: 18,
        background: `radial-gradient(circle at 0% 0%, ${t.a}, transparent 60%), #ffffff`,
        border: `1px solid ${t.b}`,
        boxShadow: "0 14px 40px rgba(15,23,42,0.08)",
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Top */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <div style={{ fontSize: 13, color: "#64748b", fontWeight: 800 }}>{title}</div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <div style={{ fontSize: 26, fontWeight: 950, color: "#111827", lineHeight: 1 }}>
              {prefix ?? ""}
              {shown}
              {suffix ?? ""}
            </div>
          </div>
        </div>

        {icon && (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              background: t.a,
              border: `1px solid ${t.b}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Bottom */}
      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 12, color: "#64748b", fontWeight: 800 }}>
          {updatedText}
        </div>

        <div
          style={{
            height: 4,
            width: 54,
            borderRadius: 999,
            background: t.c,
            opacity: 0.9,
          }}
        />
      </div>
    </div>
  )
}
