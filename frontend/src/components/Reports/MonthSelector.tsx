import { useEffect } from "react"

type Props = {
  year: number
  month: number
  onChange: (year: number, month: number) => void
}

const MONTHS = [
  "Ocak","Şubat","Mart","Nisan","Mayıs","Haziran",
  "Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"
]

export default function MonthSelector({ year, month, onChange }: Props) {

  // ✅ Eğer parent 0 veya undefined gönderirse otomatik bugünün ayı
  useEffect(() => {
    if (!year || !month) {
      const now = new Date()
      onChange(now.getFullYear(), now.getMonth() + 1)
    }
  }, [])

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        borderRadius: 16,
        background: "linear-gradient(135deg,#2563eb,#4f46e5)",
        boxShadow: "0 14px 35px rgba(37,99,235,0.25)",
        border: "1px solid rgba(255,255,255,0.18)",
      }}
    >
      {/* Month */}
      <select
        value={month}
        onChange={(e) => onChange(year, Number(e.target.value))}
        style={{
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.25)",
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(6px)",
          fontWeight: 800,
          color: "#fff",
          outline: "none",
          cursor: "pointer",
        }}
      >
        {MONTHS.map((label, idx) => {
          const m = idx + 1
          return (
            <option key={m} value={m} style={{ color: "#111827" }}>
              {label}
            </option>
          )
        })}
      </select>

      {/* Year */}
      <select
        value={year}
        onChange={(e) => onChange(Number(e.target.value), month)}
        style={{
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.25)",
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(6px)",
          fontWeight: 800,
          color: "#fff",
          outline: "none",
          cursor: "pointer",
        }}
      >
        {[2024, 2025, 2026, 2027].map((y) => (
          <option key={y} value={y} style={{ color: "#111827" }}>
            {y}
          </option>
        ))}
      </select>
    </div>
  )
}
