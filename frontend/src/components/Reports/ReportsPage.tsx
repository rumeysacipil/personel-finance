import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { getTransactions } from "../../services/transactionService";
import { getMonthlyReport } from "../../services/reportService";
import MonthSelector from "./MonthSelector";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { tr } from "date-fns/locale/tr";
registerLocale("tr", tr);

type Tx = {
  id: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  description?: string;
  amount: number;
  currency: string;
  transactionDate: string; // yyyy-MM-dd
};

type MonthlyReport = {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  expenseByCategory: { category: string; total: number }[];
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function monthLabel(year: number, month: number) {
  const d = new Date(year, month - 1, 1);
  // Kurumsal TR ay/yıl
  return d.toLocaleString("tr-TR", { month: "long", year: "numeric" });
}

function monthRangeISO(year: number, month: number) {
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { from: iso(from), to: iso(to) };
}

function formatDayLabel(isoDate: string) {
  const d = new Date(isoDate + "T00:00:00");
  const day = d.getDate();
  const mon = d.toLocaleString("tr-TR", { month: "short" });
  return `${day} ${mon}`;
}

function money(amount: number, currency: string) {
  const fixed = Number(amount).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${fixed} ${currency}`;
}

function typeLabel(t: Tx["type"]) {
  return t === "INCOME" ? "Gelir" : "Gider";
}

const styles = {
  page: {
    width: "100%",
    padding: 24,
    boxSizing: "border-box" as const,
  },
  header: {
    borderRadius: 24,
    padding: "18px 18px",
    background:
      "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25) 0%, transparent 45%), linear-gradient(135deg,#2563eb 0%, #4f46e5 55%, #7c3aed 100%)",
    color: "#fff",
    boxShadow: "0 22px 60px rgba(37,99,235,0.28)",
    border: "1px solid rgba(255,255,255,0.18)",
  },
  card: {
    background: "#fff",
    borderRadius: 18,
    border: "1px solid rgba(17,24,39,0.08)",
    boxShadow: "0 12px 35px rgba(17,24,39,0.08)",
    overflow: "hidden",
  } as const,
};

function primaryBtn(disabled?: boolean) {
  return {
    borderRadius: 14,
    padding: "10px 14px",
    fontWeight: 950,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "1px solid rgba(255,255,255,0.18)",
    color: "#fff",
    background: "linear-gradient(135deg,#2563eb 0%, #4f46e5 55%, #7c3aed 100%)",
    boxShadow: "0 14px 34px rgba(37,99,235,0.25)",
    opacity: disabled ? 0.65 : 1,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  } as const;
}

function ghostBtn(disabled?: boolean) {
  return {
    borderRadius: 14,
    padding: "10px 14px",
    fontWeight: 950,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "1px solid rgba(255,255,255,0.22)",
    color: "#fff",
    background: "rgba(255,255,255,0.14)",
    backdropFilter: "blur(6px)",
    opacity: disabled ? 0.65 : 1,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  } as const;
}

function Chip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "good" | "bad" | "info";
}) {
  const bg =
    tone === "good"
      ? "rgba(16,185,129,0.18)"
      : tone === "bad"
        ? "rgba(239,68,68,0.18)"
        : "rgba(255,255,255,0.14)";
  const bd =
    tone === "good"
      ? "rgba(16,185,129,0.28)"
      : tone === "bad"
        ? "rgba(239,68,68,0.28)"
        : "rgba(255,255,255,0.22)";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 16,
        border: `1px solid ${bd}`,
        background: bg,
        color: "#fff",
        fontWeight: 950,
        fontSize: 13,
        backdropFilter: "blur(6px)",
      }}
    >
      <span style={{ opacity: 0.9 }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Section({ title, tone }: { title: string; tone: "good" | "bad" | "info" }) {
  const bg =
    tone === "good"
      ? "rgba(37,99,235,0.05)"
      : tone === "bad"
        ? "rgba(220,38,38,0.04)"
        : "rgba(17,24,39,0.02)";
  const color = tone === "good" ? "#1d4ed8" : tone === "bad" ? "#dc2626" : "#111827";

  return (
    <tr>
      <td
        colSpan={5}
        style={{
          padding: "10px 12px",
          background: bg,
          border: "1px solid rgba(17,24,39,0.10)",
          fontWeight: 950,
          color,
        }}
      >
        {title}
      </td>
    </tr>
  );
}

function cellSoft() {
  return {
    padding: "12px 12px",
    border: "1px solid rgba(17,24,39,0.10)",
    color: "#111827",
    background: "#fff",
    verticalAlign: "middle" as const,
  };
}

function Row({
  t,
  sign,
  color,
}: {
  t: Tx;
  sign: string;
  color: string;
}) {
  return (
    <tr>
      <td style={cellSoft()}>{formatDayLabel(t.transactionDate)}</td>

      <td style={cellSoft()}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 950 }}>
          <span style={{ color: "#111827" }}>{typeLabel(t.type)}</span>
        </span>
      </td>

      <td style={{ ...cellSoft(), fontWeight: 900 }}>{t.category}</td>
      <td style={cellSoft()}>{t.description ?? ""}</td>

      <td style={{ ...cellSoft(), textAlign: "right", fontWeight: 950, color }}>
        {sign}
        {money(Number(t.amount), t.currency)}
      </td>
    </tr>
  );
}

export default function ReportsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { from, to } = useMemo(() => monthRangeISO(year, month), [year, month]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [tx, setTx] = useState<Tx[]>([]);
  const [report, setReport] = useState<MonthlyReport | null>(null);

  const [downloading, setDownloading] = useState<"" | "xlsx" | "pdf">("");

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const page0 = await getTransactions({ from, to, page: 0, size: 300 });
        if (!alive) return;
        setTx((page0.items ?? []) as any);

        const r = await getMonthlyReport({ year, month });
        if (!alive) return;
        setReport(r as any);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Beklenmeyen bir hata oluştu.");
        setTx([]);
        setReport(null);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [from, to, year, month]);

  const incomeRows = useMemo(() => tx.filter((t) => t.type === "INCOME"), [tx]);
  const expenseRows = useMemo(() => tx.filter((t) => t.type === "EXPENSE"), [tx]);

  const currencyGuess = useMemo(() => tx[0]?.currency || "TRY", [tx]);
  const totalIncome = useMemo(
    () => incomeRows.reduce((s, x) => s + Number(x.amount || 0), 0),
    [incomeRows]
  );
  const totalExpense = useMemo(
    () => expenseRows.reduce((s, x) => s + Number(x.amount || 0), 0),
    [expenseRows]
  );
  const net = (report?.netAmount ?? totalIncome - totalExpense) as number;

  async function download(format: "xlsx" | "pdf") {
    setDownloading(format);
    setError("");
    try {
      const url = format === "xlsx" ? "/reports/monthly/excel" : "/reports/monthly/pdf";
      const res = await api.get(url, { params: { year, month }, responseType: "blob" });

      const blob = new Blob([res.data]);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download =
        format === "xlsx"
          ? `rapor-${year}-${pad2(month)}.xlsx`
          : `rapor-${year}-${pad2(month)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    } catch (e: any) {
      setError(
        e?.response?.status === 404
          ? "PDF/Excel çıktısı için ilgili servis bulunamadı veya yanlış yapılandırılmış."
          : "İndirme işlemi başarısız."
      );
    } finally {
      setDownloading("");
    }
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: 28, fontWeight: 950, letterSpacing: -0.2 }}>
              Finansal Raporlama
            </div>
            <div style={{ opacity: 0.86, marginTop: 6, fontSize: 13 }}>
              Aylık Finansal Ekstre • {monthLabel(year, month)}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              style={primaryBtn(downloading !== "")}
              onClick={() => download("xlsx")}
              disabled={downloading !== ""}
              title="Excel çıktısı indir"
            >
              ⬇️ Excel
            </button>

            <button
              style={ghostBtn(downloading !== "")}
              onClick={() => download("pdf")}
              disabled={downloading !== ""}
              title="PDF çıktısı indir"
            >
              ⬇️ PDF
            </button>
          </div>
        </div>

        {/* Month selector + chips */}
        <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <MonthSelector 
            year={year} 
            month={month} 
            onChange={(y, m) => {
              setYear(y);
              setMonth(m);
            }} 
          />

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Chip label="Toplam Gelir" value={`+${money(totalIncome, currencyGuess)}`} tone="good" />
            <Chip label="Toplam Gider" value={`-${money(totalExpense, currencyGuess)}`} tone="bad" />
            <Chip
              label="Net Finansal Sonuç"
              value={`${net >= 0 ? "+" : ""}${money(net, currencyGuess)}`}
              tone={net >= 0 ? "good" : "bad"}
            />
          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 14,
            background: "rgba(220,38,38,0.06)",
            border: "1px solid rgba(220,38,38,0.18)",
            color: "#dc2626",
            fontWeight: 950,
          }}
        >
          {error}
        </div>
      )}

      {/* Table card */}
      <div style={{ marginTop: 16, ...styles.card }}>
        <div
          style={{
            padding: "14px 16px",
            background: "rgba(37,99,235,0.06)",
            borderBottom: "1px solid rgba(17,24,39,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 950, color: "#111827" }}>
            Aylık Finansal Ekstre
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 900 }}>
            Dönem Aralığı: {from} → {to}
          </div>
        </div>

        <div style={{ padding: 14 }}>
          {loading ? (
            <div style={{ color: "#6b7280", fontWeight: 900 }}>Veriler yükleniyor...</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 14 }}>
                <thead>
                  <tr>
                    {["Tarih", "İşlem Türü", "Kategori", "Açıklama", "Tutar"].map((h, idx) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "12px 12px",
                          background: "rgba(17,24,39,0.03)",
                          borderTop: "1px solid rgba(17,24,39,0.10)",
                          borderBottom: "1px solid rgba(17,24,39,0.10)",
                          borderLeft: idx === 0 ? "1px solid rgba(17,24,39,0.10)" : "none",
                          borderRight: "1px solid rgba(17,24,39,0.10)",
                          fontWeight: 950,
                          color: "#1c4fbe",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  <Section title="Gelir İşlemleri" tone="good" />
                  {incomeRows.map((t) => (
                    <Row key={t.id} t={t} sign="+" color="#21c45c" />
                  ))}

                  <Section title="Gider İşlemleri" tone="bad" />
                  {expenseRows.map((t) => (
                    <Row key={t.id} t={t} sign="-" color="#af1c1cea" />
                  ))}

                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: 14,
                        border: "1px solid rgba(17,24,39,0.10)",
                        background: "rgba(37,99,235,0.04)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 26, fontWeight: 950, flexWrap: "wrap" }}>
                        <div style={{ color: "#11271b" }}>
                          Toplam Gelir:{" "}
                          <span style={{ color: "#16a34a" }}>+{money(totalIncome, currencyGuess)}</span>
                        </div>
                        <div style={{ color: "#111827" }}>
                          Toplam Gider:{" "}
                          <span style={{ color: "#dc2626" }}>-{money(totalExpense, currencyGuess)}</span>
                        </div>
                        <div style={{ color: "#111827" }}>
                          Net Finansal Sonuç:{" "}
                          <span style={{ color: net >= 0 ? "#16a34a" : "#dc2626" }}>
                            {net >= 0 ? "+" : ""}
                            {money(net, currencyGuess)}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>

                  <Section title="Kategori Bazlı Özet" tone="info" />
                  {(report?.expenseByCategory ?? []).map((c) => (
                    <tr key={c.category}>
                      <td colSpan={4} style={cellSoft()}>
                        {c.category}
                      </td>
                      <td style={{ ...cellSoft(), textAlign: "right", fontWeight: 950, color: "#dc2626" }}>
                        -{money(Number(c.total), currencyGuess)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!tx.length && (
                <div style={{ padding: 14, color: "#6b7280", fontWeight: 900 }}>
                  Seçilen döneme ait işlem kaydı bulunmamaktadır.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
