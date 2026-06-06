import { useEffect, useMemo, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { getMonthlyReport } from "../../services/reportService"
import type { MonthlyReport } from "../../types/monthlyReport"

function moneyTRY(amount: number | string | null | undefined) {
  const n = Number(amount ?? 0)
  return `₺${n.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}`
}

type Row = { name: string; value: number; percent: number; color: string }

const COLORS = [
  "#2563eb", // blue
  "#16a34a", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#f97316", // orange
  "#64748b", // slate
]

function formatPercent(p: number) {
  return `${p.toFixed(1)}%`
}

function renderLabel(props: any) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, name, value } = props
  const p = Number(percent ?? 0) * 100
  if (p < 14) return null

  const RADIAN = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.62
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)

  const labelName = String(name)
  const short = labelName.length > 10 ? labelName.slice(0, 9) + "." : labelName
  const big = p >= 30

  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="middle" style={{ fontWeight: 900 }}>
      {big ? (
        <>
          <tspan x={x} dy="-0.2em" style={{ fontSize: 13 }}>{short}</tspan>
          <tspan x={x} dy="1.25em" style={{ fontSize: 12, fontWeight: 800 }}>{moneyTRY(value)}</tspan>
        </>
      ) : (
        <tspan x={x} dy="0.35em" style={{ fontSize: 12 }}>{moneyTRY(value)}</tspan>
      )}
    </text>
  )
}

type Props = { year: number; month: number }

export function CategoryBreakdown({ year, month }: Props) {
  const [report, setReport] = useState<MonthlyReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)

    getMonthlyReport({ year, month })
      .then((data) => {
        if (!alive) return
        setReport(data)
      })
      .catch((err: any) => {
        if (!alive) return
        setError(`Kategori bazlı dağılım verisi alınamadı (status: ${err?.response?.status ?? "Bilinmiyor"})`)
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [year, month])

  const rows: Row[] = useMemo(() => {
    const list = report?.expenseByCategory ?? []
    const sum = list.reduce((a, x) => a + Number(x.total ?? 0), 0)
    if (sum <= 0) return []

    const sorted = [...list]
      .map((x) => ({ name: x.category, value: Number(x.total ?? 0) }))
      .sort((a, b) => b.value - a.value)

    return sorted.map((x, idx) => ({
      name: x.name,
      value: x.value,
      percent: (x.value / sum) * 100,
      color: COLORS[idx % COLORS.length],
    }))
  }, [report])

  if (loading) return <p style={{ color: "#6b7280" }}>Kategori bazlı harcama dağılımı yükleniyor...</p>
  if (error) return <p style={{ color: "#b91c1c" }}>{error}</p>
  if (!report) return null
  if (rows.length === 0) return <div style={{ color: "#6b7280" }}>Seçilen döneme ait kategori bazlı gider kaydı bulunmamaktadır.</div>

  const total = rows.reduce((s, r) => s + r.value, 0)

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(17,24,39,0.10)",
        borderRadius: 18,
        boxShadow: "0 12px 35px rgba(17,24,39,0.08)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px",
          background:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25) 0%, transparent 55%), linear-gradient(135deg,#2563eb 0%, #4f46e5 55%, #7c3aed 100%)",
          color: "#fff",
          borderBottom: "1px solid rgba(255,255,255,0.18)",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 950, letterSpacing: -0.2 }}>Kategori Bazlı Harcama Dağılımı</div>
          <div style={{ fontSize: 12, opacity: 0.9, fontWeight: 800 }}>Toplam Tutar: {moneyTRY(total)}</div>
        </div>
        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>
          En yüksek harcama tutarına sahip kategoriler grafikte vurgulanmaktadır.

        </div>
      </div>

      {/* Body */}
      <div
        style={{
          padding: 16,
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: 18,
          alignItems: "center",
        }}
      >
        {/* Chart */}
        <div style={{ width: 240, height: 240, margin: "0 auto" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value: any, name: any) => [moneyTRY(value), name]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid rgba(37,99,235,0.18)",
                  boxShadow: "0 16px 40px rgba(17,24,39,0.14)",
                }}
              />
              <Pie
                data={rows}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={102}
                innerRadius={0}
                paddingAngle={3}
                cornerRadius={10}
                stroke="rgba(255,255,255,0.95)"
                strokeWidth={2}
                labelLine={false}
                label={renderLabel}
                isAnimationActive={true}
              >
                {rows.map((r) => (
                  <Cell key={r.name} fill={r.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend/List */}
        <div
          style={{
            borderLeft: "1px solid rgba(37,99,235,0.14)",
            paddingLeft: 16,
          }}
        >
          {rows.map((r, idx) => (
            <div key={r.name}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0" }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 4,
                    background: r.color,
                    marginTop: 4,
                    boxShadow: "0 0 0 4px rgba(37,99,235,0.06)",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 900, color: "#111827" }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                    Toplam İçindeki Pay: <b style={{ color: "#111827" }}>{formatPercent(r.percent)}</b>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 950, color: "#111827", whiteSpace: "nowrap" }}>{moneyTRY(r.value)}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                    {moneyTRY((r.percent / 100) * total)}
                  </div>
                </div>
              </div>
              {idx !== rows.length - 1 ? <div style={{ height: 1, background: "rgba(17,24,39,0.06)" }} /> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
