import { useEffect, useMemo, useState } from "react";
import { getBudgetProgress, listBudgets, upsertBudget } from "../../services/budgetService";
import type { Budget, BudgetProgressResponse } from "../../types/budget";

function moneyTRY(n: any) {
  const v = Number(n ?? 0);
  return `₺${v.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}`;
}

function barColor(p: number) {
  if (p >= 90) return "#dc2626"; // red
  if (p >= 70) return "#f59e0b"; // amber
  return "#16a34a"; // green
}

type Props = { year: number; month: number };

const inputStyle = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: 14,
  border: "1px solid rgba(17,24,39,0.10)",
  background: "#fff",
  boxSizing: "border-box" as const,
  outline: "none",
  fontSize: 14,
  color: "#111827",
} as const;

function Card({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 18,
        border: "1px solid rgba(17,24,39,0.08)",
        boxShadow: "0 12px 35px rgba(17,24,39,0.08)",
        overflow: "hidden",
      }}
    >
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
        <div style={{ fontSize: 15, fontWeight: 950, color: "#111827" }}>{title}</div>
        {right}
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}

function btnPrimary(disabled?: boolean) {
  return {
    width: "100%",
    marginTop: 10,
    borderRadius: 14,
    padding: "11px 12px",
    fontWeight: 950,
    border: "1px solid rgba(37,99,235,0.18)",
    color: "#fff",
    background: "linear-gradient(135deg,#2563eb 0%, #4f46e5 55%, #7c3aed 100%)",
    boxShadow: "0 14px 34px rgba(37,99,235,0.18)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.7 : 1,
  } as const;
}

function btnGhost(disabled?: boolean) {
  return {
    width: "100%",
    marginTop: 10,
    borderRadius: 14,
    padding: "11px 12px",
    fontWeight: 950,
    border: "1px solid rgba(17,24,39,0.12)",
    color: "#111827",
    background: "#fff",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.7 : 1,
  } as const;
}

function label(text: string) {
  return <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 900 }}>{text}</div>;
}

export default function BudgetPanel({ year, month }: Props) {
  const [progress, setProgress] = useState<BudgetProgressResponse | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");

  // Edit mode
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    Promise.all([getBudgetProgress({ year, month }), listBudgets({ year, month })])
      .then(([p, b]) => {
        if (!alive) return;
        setProgress(p);
        setBudgets(b);
      })
      .catch((err: any) => {
        if (!alive) return;
        setError(`Bütçe verilerine erişilemedi (status: ${err?.response?.status ?? "Bilinmiyor"})`);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [year, month]);

  // Bu ay için kayıtlı budget kategorileri
  const  monthCategories = useMemo(() => {
    const s = new Set<string>();
    budgets.forEach((b) => s.add(b.category));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [budgets]);

  async function handleSave() {
    const cat = category.trim();
    const lim = Number(limit);

    if (!cat) return setError("Kategori alanı zorunludur.");
    if (!Number.isFinite(lim) || lim <= 0) return setError("Aylık limit tutarı 0’dan büyük olmalıdır.");

    setSaving(true);
    setError(null);

    try {
      await upsertBudget({ category: cat, monthlyLimit: lim, year, month });

      const [p, b] = await Promise.all([getBudgetProgress({ year, month }), listBudgets({ year, month })]);
      setProgress(p);
      setBudgets(b);

      // ✅ reset form
      setCategory("");
      setLimit("");
      setEditingCategory(null);
    } catch (err: any) {
      setError(`İşlem kaydedilemedi (status: ${err?.response?.status ?? "Bilinmiyor"})`);
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    setEditingCategory(null);
    setCategory("");
    setLimit("");
    setError(null);
  }

  if (loading) return <p style={{ color: "#6b7280", fontWeight: 900 }}>Bütçe yönetimi verileri işleniyor...</p>;
  if (error) return <p style={{ color: "#b91c1c", fontWeight: 900 }}>{error}</p>;
  if (!progress) return null;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Summary strip */}
      <div
        style={{
          borderRadius: 18,
          padding: "14px 14px",
          background:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25) 0%, transparent 45%), linear-gradient(135deg,#2563eb 0%, #4f46e5 55%, #7c3aed 100%)",
          color: "#fff",
          boxShadow: "0 18px 50px rgba(37,99,235,0.22)",
          border: "1px solid rgba(255,255,255,0.18)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 950 }}>Bütçe Yönetimi</div>
            <div style={{ opacity: 0.86, marginTop: 6, fontSize: 12, fontWeight: 800 }}>
             Seçilen döneme ait bütçe performansının izlenmesi • Düzenlemek için ilgili kaydı seçiniz
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 12px",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.22)",
                background: "rgba(255,255,255,0.14)",
                backdropFilter: "blur(6px)",
                fontWeight: 950,
                fontSize: 12,
              }}
            >
              Toplam Kayıt: {progress.items.length}
            </span>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 12px",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.22)",
                background: "rgba(255,255,255,0.14)",
                backdropFilter: "blur(6px)",
                fontWeight: 950,
                fontSize: 12,
              }}
            >
              {year}-{String(month).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      {/* Form (single column) */}
      <Card
        title={editingCategory ? "Bütçe Güncelle" : "Yeni Bütçe Tanımla"}
        right={
          <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 900 }}>
            {editingCategory ? "Kategori Değiştirilemez":""}
          </span>
        }
      >
        <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 800 }}>
          {editingCategory
            ? "Seçilen bütçe kaydı güncellenmektedir."
            : "Kategori ve aylık limit bilgilerini girerek seçili dönem için bütçe tanımlayabilirsiniz."}
        </div>

        <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
          <div>
            {label("Kategori")}
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={!!editingCategory}
              style={{
                ...inputStyle,
                opacity: editingCategory ? 0.7 : 1,
                cursor: editingCategory ? "not-allowed" : "text",
              }}
            />

            {monthCategories.length > 0 && !editingCategory ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                {monthCategories.slice(0, 12).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setCategory(s)}
                    style={{
                      border: "1px solid rgba(17,24,39,0.10)",
                      background: "#fff",
                      borderRadius: 999,
                      padding: "6px 10px",
                      cursor: "pointer",
                      fontWeight: 950,
                      fontSize: 12,
                      color: "#111827",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            {label("Aylık Limit (₺)")}
            <input
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              inputMode="decimal"
              style={inputStyle}
            />
          </div>

          <button type="button" onClick={handleSave} disabled={saving} style={btnPrimary(saving)}>
            {saving ? "Kaydediliyor..." : editingCategory ? "Bütçeyi Güncelle" : "Bütçeyi Kaydet"}
          </button>

          {editingCategory ? (
            <button type="button" onClick={handleCancelEdit} style={btnGhost(false)}>
              İptal
            </button>
          ) : null}

          <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 800 }}>
           Not: Tanımlanan bütçe yalnızca seçili döneme aittir. Dönem değiştirildiğinde listede görüntülenmez.
          </div>
        </div>
      </Card>

      {/* Progress list */}
      <Card title="Bütçe Yönetimi" right={<span style={{ fontSize: 12, color: "#6b7280", fontWeight: 900 }}>Düzenlemek için seçiniz</span>}>
        {progress.items.length === 0 ? (
          <div style={{ color: "#6b7280", fontWeight: 900 }}>
           Seçili döneme ait bütçe kaydı bulunmamaktadır. Yukarıdaki form üzerinden yeni bir bütçe tanımlayabilirsiniz.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {progress.items.map((it) => {
              const p = Math.max(0, Math.min(100, Number(it.percentUsed ?? 0)));
              const active = editingCategory === it.category;

              return (
                <div
                  key={it.category}
                  onClick={() => {
                    setEditingCategory(it.category);
                    setCategory(it.category);
                    setLimit(String(Number(it.monthlyLimit ?? 0)));
                  }}
                  style={{
                    cursor: "pointer",
                    padding: 14,
                    borderRadius: 16,
                    border: active ? "2px solid rgba(37,99,235,0.70)" : "1px solid rgba(17,24,39,0.10)",
                    background: active ? "rgba(37,99,235,0.06)" : "#ffffff",
                    boxShadow: active ? "0 10px 26px rgba(37,99,235,0.12)" : "0 8px 20px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                    <div style={{ fontWeight: 950, color: "#111827" }}>{it.category}</div>
                    <div style={{ color: "#6b7280", fontWeight: 900 }}>{p.toFixed(0)}%</div>
                  </div>

                  <div
                    style={{
                      height: 10,
                      borderRadius: 999,
                      background: "rgba(15,23,42,0.10)",
                      overflow: "hidden",
                      marginTop: 10,
                    }}
                  >
                    <div style={{ width: `${p}%`, height: "100%", background: barColor(p) }} />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      marginTop: 10,
                      fontSize: 13,
                      color: "#6b7280",
                      flexWrap: "wrap",
                      fontWeight: 800,
                    }}
                  >
                    <div>
                      Gerçekleşen Harcama: <b style={{ color: "#111827" }}>{moneyTRY(it.spent)}</b>
                    </div>
                    <div>
                      Tanımlanan Limit: <b style={{ color: "#111827" }}>{moneyTRY(it.monthlyLimit)}</b>
                    </div>
                    <div>
                      Kalan Bütçe:{" "}
                      <b style={{ color: Number(it.remaining) < 0 ? "#dc2626" : "#111827" }}>{moneyTRY(it.remaining)}</b>
                    </div>
                  </div>

                  {active ? (
                    <div style={{ marginTop: 10, fontSize: 12, fontWeight: 950, color: "#2563eb" }}>
                      Düzenleniyor...
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
