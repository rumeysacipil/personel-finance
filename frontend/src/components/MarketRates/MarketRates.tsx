import { useEffect, useState } from "react"
import MarketRateCard from "./MarketRateCard"
import { getMarketRates } from "../../services/marketRatesService"
import type { MarketRates as MarketRatesType } from "../../types/marketRates"

function MarketRates() {
  const [rates, setRates] = useState<MarketRatesType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    getMarketRates()
      .then((data: MarketRatesType) => {
        setRates(data)
      })
      .catch(() => {
        setError("Market rates alınamadı")
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div
        style={{
          borderRadius: 18,
          padding: 16,
          background: "rgba(37,99,235,0.06)",
          border: "1px solid rgba(37,99,235,0.14)",
          color: "#2563eb",
          fontWeight: 900,
        }}
      >
        Yükleniyor…
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          borderRadius: 18,
          padding: 16,
          background: "rgba(220,38,38,0.06)",
          border: "1px solid rgba(220,38,38,0.18)",
          color: "#dc2626",
          fontWeight: 900,
        }}
      >
        {error}
      </div>
    )
  }

  if (!rates) return null

  return (
    <>
      <div
        className="mr-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 16,
        }}
      >
        <MarketRateCard
          title="USD / TRY"
          value={rates.usdTry}
          prefix="₺"
          decimals={3}
          icon="💵"
          updatedAt={rates.lastUpdated}
          tone="blue"
        />

        <MarketRateCard
          title="EUR / TRY"
          value={rates.eurTry}
          prefix="₺"
          decimals={3}
          icon="💶"
          updatedAt={rates.lastUpdated}
          tone="indigo"
        />

        <MarketRateCard
          title="Altın (ONS)"
          value={rates.goldUsd}
          suffix=" USD"
          decimals={2}
          icon="🪙"
          updatedAt={rates.lastUpdated}
          tone="violet"
        />

        <MarketRateCard
          title="Gümüş (ONS)"
          value={rates.silverUsd}
          suffix=" USD"
          decimals={2}
          icon="🥈"
          updatedAt={rates.lastUpdated}
          tone="sky"
        />
      </div>

      {/* Responsive: 4->2->1 */}
      <style>
        {`
          @media (max-width: 1100px) {
            .mr-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          }
          @media (max-width: 640px) {
            .mr-grid { grid-template-columns: 1fr !important; }
          }
        `}
      </style>
    </>
  )
}


export default MarketRates
