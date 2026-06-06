import React from "react"

type Props = {
  title: string
  value: string
  icon?: React.ReactNode
  subText?: string
  delta?: string
  deltaDirection?: "up" | "down" | "flat"
  extra?: React.ReactNode
  tone?: "blue" | "indigo" | "violet" | "sky"
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

export default function StatCard({
  title,
  value,
  icon,
  subText,
  delta,
  deltaDirection = "flat",
  extra,
  tone = "blue",
}: Props) {
  const t = toneStyles(tone)

  const deltaColor =
    deltaDirection === "up" ? "#16a34a" : deltaDirection === "down" ? "#dc2626" : "#64748b"

  const deltaSymbol = deltaDirection === "up" ? "▲" : deltaDirection === "down" ? "▼" : "•"

  return (
    <div
      style={{
        borderRadius: 20,
        padding: 18,
        background: `radial-gradient(circle at 0% 0%, ${t.a}, transparent 62%), #ffffff`,
        border: `1px solid ${t.b}`,
        boxShadow: "0 14px 40px rgba(15,23,42,0.08)",
        minHeight: 122,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 14,
              background: t.a,
              border: `1px solid ${t.b}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              flex: "0 0 auto",
            }}
          >
            {icon ?? "•"}
          </div>

          <div
            style={{
              fontSize: 13,
              color: "#64748b",
              fontWeight: 800,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={title}
          >
            {title}
          </div>
        </div>

        {/* Accent pill */}
        <div
          style={{
            height: 8,
            width: 48,
            borderRadius: 999,
            background: t.c,
            opacity: 0.9,
            flex: "0 0 auto",
          }}
        />
      </div>

      {/* Value + Delta (YAN YANA) */}
      <div
        style={{
          marginTop: 10,
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 950, color: "#111827", letterSpacing: -0.5 }}>
          {value}
        </div>

        {delta ? (
          <div
            style={{
              fontSize: 14,
              fontWeight: 900,
              color: deltaColor,
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>{deltaSymbol}</span>
            <span>{delta}</span>
          </div>
        ) : (
          <div style={{ height: 18 }} />
        )}
      </div>

      {/* extra: subText'in üstünde */}
      {extra ? <div style={{ marginTop: 8 }}>{extra}</div> : null}

      {/* subText */}
      {subText ? (
        <div style={{ marginTop: 8, color: "#6b7280", fontSize: 12, fontWeight: 700 }}>
          {subText}
        </div>
      ) : (
        <div style={{ height: 18 }} />
      )}
    </div>
  )
}
