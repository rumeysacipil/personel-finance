type Props = {
  title: string
  value: string
  icon?: string
  delta?: string
  deltaDirection?: "up" | "down" | "flat"
}

export default function SummaryCard({
  title,
  value,
  icon,
  delta,
  deltaDirection,
}: Props) {
  const deltaColor =
    deltaDirection === "up"
      ? "#16a34a"
      : deltaDirection === "down"
      ? "#dc2626"
      : "#64748b"

  const accent =
    title.includes("Gelir")
      ? "#16a34a"
      : title.includes("Gider")
      ? "#dc2626"
      : title.includes("Net")
      ? "#4f46e5"
      : "#2563eb"

  return (
    <div
      style={{
        borderRadius: 20,
        padding: 18,
        background:
          "radial-gradient(circle at 0% 0%, rgba(37,99,235,0.08), transparent 60%), #ffffff",
        border: "1px solid rgba(37,99,235,0.15)",
        boxShadow: "0 14px 40px rgba(15,23,42,0.08)",
        transition: "all 0.25s ease",
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontSize: 13, color: "#64748b", fontWeight: 700 }}>
          {title}
        </div>
        {icon && <div style={{ fontSize: 18 }}>{icon}</div>}
      </div>

      {/* Value + Delta */}
      <div
        style={{
          marginTop: 8,
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div
          style={{
            fontSize: 26,
            fontWeight: 950,
            color: "#111827",
          }}
        >
          {value}
        </div>

        {delta && (
          <div
            style={{
              fontSize: 14,
              fontWeight: 900,
              color: deltaColor,
              display: "flex",
              alignItems: "center",
              gap: 4,
              whiteSpace: "nowrap",
            }}
          >
            {deltaDirection === "up" && "▲"}
            {deltaDirection === "down" && "▼"}
            {deltaDirection === "flat" && "•"}
            {delta}
          </div>
        )}
      </div>

      {/* Accent line */}
      <div
        style={{
          marginTop: 12,
          height: 4,
          borderRadius: 999,
          background: accent,
          opacity: 0.85,
        }}
      />
    </div>
  )
}
