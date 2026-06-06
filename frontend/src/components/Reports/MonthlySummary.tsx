import { useEffect, useMemo, useState } from "react"
import SummaryCard from "./SummaryCard"
import { getMonthlyReport } from "../../services/reportService"
import type { MonthlyReport } from "../../types/monthlyReport"

function moneyTRY(amount: number | string | null | undefined) {
  const n = Number(amount ?? 0)
  return `₺${n.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}`
}

function prevMonthOf(year: number, month: number) {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }
}

type Props = { year: number; month: number }

export default function MonthlySummary({ year, month }: Props) {
  const [report, setReport] = useState<MonthlyReport | null>(null)
  const [prevReport, setPrevReport] = useState<MonthlyReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)

    const prev = prevMonthOf(year, month)

    Promise.all([
      getMonthlyReport({ year, month }),
      getMonthlyReport({ year: prev.year, month: prev.month }),
    ])
      .then(([cur, prev]) => {
        if (!alive) return
        setReport(cur)
        setPrevReport(prev)
      })
      .catch((err: any) => {
        if (!alive) return
        setError(`Performans özeti alınamadı (status: ${err?.response?.status ?? "bilinmiyor"})`)
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
      })

    return () => {
      alive = false
    }
  }, [year, month])

  const savingsRate = useMemo(() => {
    if (!report) return 0
    const income = Number(report.totalIncome ?? 0)
    const net = Number(report.netAmount ?? 0)
    return income === 0 ? 0 : (net / income) * 100
  }, [report])

  const prevSavingsRate = useMemo(() => {
    if (!prevReport) return 0
    const income = Number(prevReport.totalIncome ?? 0)
    const net = Number(prevReport.netAmount ?? 0)
    return income === 0 ? 0 : (net / income) * 100
  }, [prevReport])

  const netDelta = useMemo(() => {
    if (!report || !prevReport) return null
    return Number(report.netAmount ?? 0) - Number(prevReport.netAmount ?? 0)
  }, [report, prevReport])

  const rateDelta = useMemo(() => {
    if (!report || !prevReport) return null
    return savingsRate - prevSavingsRate
  }, [report, prevReport, savingsRate, prevSavingsRate])

  const netDir: "up" | "down" | "flat" | undefined =
    netDelta === null ? undefined : netDelta > 0 ? "up" : netDelta < 0 ? "down" : "flat"

  const rateDir: "up" | "down" | "flat" | undefined =
    rateDelta === null ? undefined : rateDelta > 0 ? "up" : rateDelta < 0 ? "down" : "flat"

  if (loading)
    return (
      <div
        style={{
          marginTop: 10,
          borderRadius: 18,
          padding: 14,
          background: "#fff",
          border: "1px solid rgba(17,24,39,0.08)",
          boxShadow: "0 12px 35px rgba(17,24,39,0.06)",
          color: "#6b7280",
          fontWeight: 900,
        }}
      >
        Performans özeti yükleniyor...
      </div>
    )

  if (error)
    return (
      <div
        style={{
          marginTop: 10,
          borderRadius: 18,
          padding: 14,
          background: "rgba(220,38,38,0.06)",
          border: "1px solid rgba(220,38,38,0.18)",
          color: "#b91c1c",
          fontWeight: 900,
        }}
      >
        {error}
      </div>
    )

  if (!report) return null

  return (
    <div style={{ marginTop: 10 }}>
      {/* Header strip */}
      <div
        style={{
          borderRadius: 18,
          padding: "14px 14px",
          background:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25) 0%, transparent 45%), linear-gradient(135deg,#2563eb 0%, #4f46e5 55%, #7c3aed 100%)",
          color: "#fff",
          boxShadow: "0 18px 50px rgba(37,99,235,0.18)",
          border: "1px solid rgba(255,255,255,0.18)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 950 }}>Dönem Performans Özeti</div>
            <div style={{ opacity: 0.86, marginTop: 6, fontSize: 12, fontWeight: 800 }}>
              Gelir, gider ve tasarruf oranlarının önceki dönem ile karşılaştırması
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "10px 12px",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.22)",
                background: "rgba(255,255,255,0.14)",
                backdropFilter: "blur(6px)",
                fontWeight: 950,
                fontSize: 12,
              }}
            >
              Tasarruf: {savingsRate.toFixed(1)}%
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "10px 12px",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.22)",
                background: "rgba(255,255,255,0.14)",
                backdropFilter: "blur(6px)",
                fontWeight: 950,
                fontSize: 12,
              }}
            >
              Net: {moneyTRY(report.netAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div
        className="summary-cards-grid"
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 16,
        }}
      >
        <SummaryCard title="Toplam Gelir" value={moneyTRY(report.totalIncome)} icon="🟢" />
        <SummaryCard title="Toplam Gider" value={moneyTRY(report.totalExpense)} icon="🔴" />

        <SummaryCard
          title="Net Sonuç"
          value={moneyTRY(report.netAmount)}
          icon="💰"
          delta={netDelta === null ? undefined : moneyTRY(Math.abs(netDelta))}
          deltaDirection={netDir}
        />

        <SummaryCard
          title="Tasarruf Oranı"
          value={`${savingsRate.toFixed(1)}%`}
          icon="📈"
          delta={rateDelta === null ? undefined : `${Math.abs(rateDelta).toFixed(1)}%`}
          deltaDirection={rateDir}
        />
      </div>

      {/* Responsive grid */}
      <style>
        {`
          @media (max-width: 1100px) {
            .summary-cards-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
          }
          @media (max-width: 640px) {
            .summary-cards-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  )
}
