import { useEffect, useMemo, useState } from "react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"
import { getMonthlyTrends } from "../../services/reportService"
import type { MonthlyTrendsResponse } from "../../types/monthlyTrends"

function moneyTRY(v: any) {
  const n = Number(v ?? 0)
  return `₺${n.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}`
}

type Props = { year: number; month: number }

export default function SpendingTrends({ year, month }: Props) {
  const [data, setData] = useState<MonthlyTrendsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)

    getMonthlyTrends({ year, month })
      .then((res) => {
        if (!alive) return
        setData(res)
      })
      .catch((err: any) => {
        if (!alive) return
        setError(`Eğilim verisine erişilemedi (status: ${err?.response?.status ?? "bilinmiyor"})`)
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [year, month])

  const days = data?.days ?? []

  const totals = useMemo(() => {
    const income = days.reduce((s: number, x: any) => s + Number(x?.income ?? 0), 0)
    const expense = days.reduce((s: number, x: any) => s + Number(x?.expense ?? 0), 0)
    return { income, expense }
  }, [days])

  if (loading) return <p style={{ color: "#6b7280" }}>Eğilim verileri yükleniyor...</p>
  if (error) return <p style={{ color: "#b91c1c" }}>{error}</p>
  if (!data) return null

  return (
    <div style={{ width: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div style={{ fontWeight: 950, color: "#111827" }}>Gelir / Gider Eğilimi</div>

        <div style={{ display: "flex", gap: 10, fontSize: 12, color: "#64748b", fontWeight: 800 }}>
          <span>
            Gelir:{" "}
            <span style={{ color: "#16a34a", fontWeight: 950 }}>{moneyTRY(totals.income)}</span>
          </span>
          <span>•</span>
          <span>
            Gider:{" "}
            <span style={{ color: "#dc2626", fontWeight: 950 }}>{moneyTRY(totals.expense)}</span>
          </span>
        </div>
      </div>

      <div
        style={{
          height: 300,
          borderRadius: 18,
          border: "1px solid rgba(37,99,235,0.14)",
          background:
            "radial-gradient(circle at 20% 0%, rgba(37,99,235,0.12) 0%, transparent 45%), #ffffff",
          boxShadow: "0 14px 40px rgba(15,23,42,0.08)",
          overflow: "hidden",
          padding: 10,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={days} margin={{ top: 18, right: 20, left: 10, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" />

            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => moneyTRY(v)}
              tick={{ fill: "#64748b", fontSize: 12, fontWeight: 700 }}
              width={92}
            />

            <Tooltip
              formatter={(value: any, name: any) => [moneyTRY(value), name]}
              labelFormatter={(label) => `Gün ${label}`}
              contentStyle={{
                borderRadius: 14,
                border: "1px solid rgba(37,99,235,0.18)",
                boxShadow: "0 18px 50px rgba(15,23,42,0.14)",
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(8px)",
                fontWeight: 800,
              }}
              labelStyle={{ color: "#111827", fontWeight: 950 }}
            />

            <Legend
              verticalAlign="top"
              height={34}
              formatter={(value) => <span style={{ color: "#111827", fontWeight: 800 }}>{value}</span>}
            />

            <Line
              type="monotone"
              dataKey="income"
              name="Gelir"
              stroke="#16a34a"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />

            <Line
              type="monotone"
              dataKey="expense"
              name="Gider"
              stroke="#dc2626"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
