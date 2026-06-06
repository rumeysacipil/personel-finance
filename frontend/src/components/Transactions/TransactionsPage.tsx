import { useEffect, useMemo, useState } from "react";
import type { PagedResponse, Transaction, TransactionType } from "../../types/transaction";
import { createTransaction, deleteTransaction, getTransactions, updateTransaction } from "../../services/transactionService";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { tr } from "date-fns/locale/tr";
registerLocale("tr", tr);

type Mode = "create" | "edit";

type FormState = {
  type: TransactionType;
  category: string;
  description: string;
  amount: string; // input için string
  currency: string; // TRY/USD vs
  transactionDate: string; // yyyy-MM-dd
};

function defaultForm(): FormState {
  return {
    type: "EXPENSE",
    category: "",
    description: "",
    amount: "",
    currency: "TRY",
    transactionDate: new Date().toISOString().slice(0, 10),
  };
}

function getMonthRangeISO(d: Date) {
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const iso = (x: Date) => x.toISOString().slice(0, 10);
  return { from: iso(start), to: iso(end) };
}

function typeLabel(t: TransactionType) {
  return t === "INCOME" ? "Gelir" : "Gider";
}

// basit doğrulama (kurumsal TR)
function validateForm(f: FormState) {
  const errs: string[] = [];

  if (!f.type) errs.push("İşlem türü zorunludur.");
  if (!f.category.trim()) errs.push("Kategori alanı zorunludur.");
  if (f.category.trim().length > 50) errs.push("Kategori en fazla 50 karakter olabilir.");
  if (f.description.length > 255) errs.push("Açıklama en fazla 255 karakter olabilir.");

  const amountNum = Number(f.amount);
  if (!f.amount || Number.isNaN(amountNum)) errs.push("Tutar geçerli bir sayı olmalıdır.");
  else if (amountNum < 0.01) errs.push("Tutar en az 0,01 olmalıdır.");

  const cur = f.currency.trim();
  if (!cur) errs.push("Para birimi zorunludur.");
  else if (cur.length !== 3) errs.push("Para birimi 3 harf olmalıdır (TRY, USD).");

  if (!f.transactionDate) errs.push("İşlem tarihi zorunludur.");

  return errs;
}

/** --- Theme (Reports ile uyumlu) --- */
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

function headerBtnPrimary(disabled?: boolean) {
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
function headerBtnGhost(disabled?: boolean) {
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

function btnGhost(disabled?: boolean) {
  return {
    background: "#ffffff",
    color: "#111827",
    border: "1px solid rgba(17,24,39,0.12)",
    borderRadius: 14,
    padding: "10px 14px",
    fontWeight: 900,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.7 : 1,
  } as const;
}
function btnPrimary(disabled?: boolean) {
  return {
    background: "linear-gradient(135deg,#2563eb 0%, #4f46e5 55%, #7c3aed 100%)",
    color: "#ffffff",
    border: "1px solid rgba(37,99,235,0.18)",
    borderRadius: 14,
    padding: "10px 14px",
    fontWeight: 950,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.7 : 1,
    boxShadow: "0 14px 34px rgba(37,99,235,0.18)",
  } as const;
}
function btnDanger(disabled?: boolean) {
  return {
    background: "rgba(220,38,38,0.06)",
    color: "#dc2626",
    border: "1px solid rgba(220,38,38,0.25)",
    borderRadius: 14,
    padding: "10px 14px",
    fontWeight: 950,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.7 : 1,
  } as const;
}

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

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(17,24,39,0.45)",
  backdropFilter: "blur(6px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 50,
} as const;

const modalStyle = {
  width: 560,
  maxWidth: "100%",
  background: "#ffffff",
  borderRadius: 18,
  padding: 18,
  border: "1px solid rgba(17,24,39,0.12)",
  boxShadow: "0 20px 60px rgba(17,24,39,0.25)",
} as const;

function fmtMoney(n: any, cur: any) {
  const x = Number(n ?? 0);
  const fixed = x.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${fixed} ${cur ?? ""}`.trim();
}

export default function TransactionsPage() {
  // filtreler
  const { from: defaultFrom, to: defaultTo } = getMonthRangeISO(new Date());
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [type, setType] = useState<"" | TransactionType>("");

  // ✅ Category debounce
  const [category, setCategory] = useState(""); // uygulanmış filtre
  const [categoryInput, setCategoryInput] = useState(""); // kullanıcı yazarken

  // pagination
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  useEffect(() => {
    const t = setTimeout(() => {
      setCategory(categoryInput.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [categoryInput]);

  // data
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<PagedResponse<Transaction> | null>(null);

  // modal state
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm());
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const params = useMemo(
    () => ({
      from,
      to,
      page,
      size,
      type: type || undefined,
      category: category.trim() || undefined,
    }),
    [from, to, page, size, type, category]
  );

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await getTransactions(params);
      setData(res);
    } catch (e: any) {
      setError(e?.message ?? "Beklenmeyen bir hata oluştu.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  function openCreate() {
    setMode("create");
    setEditingId(null);
    setForm(defaultForm());
    setFormErrors([]);
    setOpen(true);
  }

  function openEdit(t: Transaction) {
    setMode("edit");
    setEditingId(t.id);
    setForm({
      type: t.type,
      category: t.category ?? "",
      description: t.description ?? "",
      amount: String(t.amount ?? ""),
      currency: t.currency ?? "TRY",
      transactionDate: t.transactionDate,
    });
    setFormErrors([]);
    setOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setOpen(false);
  }

  async function onDelete(id: number) {
    const ok = window.confirm("Bu işlem kaydını silmek istediğinize emin misiniz?");
    if (!ok) return;

    setSaving(true);
    setError("");
    try {
      await deleteTransaction(id);
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Silme işlemi başarısız.");
    } finally {
      setSaving(false);
    }
  }

  async function onSubmit() {
    const errs = validateForm(form);
    setFormErrors(errs);
    if (errs.length) return;

    setSaving(true);
    setError("");
    try {
      const body = {
        type: form.type,
        category: form.category.trim(),
        description: form.description.trim() || undefined,
        amount: Number(form.amount),
        currency: form.currency.trim().toUpperCase(),
        transactionDate: form.transactionDate,
      };

      if (mode === "create") {
        await createTransaction(body);
      } else {
        if (!editingId) throw new Error("Düzenlenecek kayıt kimliği bulunamadı.");
        await updateTransaction(editingId, body);
      }

      setOpen(false);
      await load();
    } catch (e: any) {
      setError(e?.message ?? "İşlem kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  const totalItems = data?.totalItems ?? 0;
  const pageCount = data?.totalPages ?? 0;

  return (
    <div style={{ width: "100%", padding: 24, boxSizing: "border-box" }}>
      {/* Header */}
      <div
        style={{
          borderRadius: 24,
          padding: "18px 18px",
          background:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25) 0%, transparent 45%), linear-gradient(135deg,#2563eb 0%, #4f46e5 55%, #7c3aed 100%)",
          color: "#fff",
          boxShadow: "0 22px 60px rgba(37,99,235,0.28)",
          border: "1px solid rgba(255,255,255,0.18)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 950, letterSpacing: -0.2 }}>Finansal İşlemler</div>
            <div style={{ opacity: 0.86, marginTop: 6, fontSize: 13 }}>
              Gelir ve gider kayıtlarını filtreleyin, ekleyin, güncelleyin veya silin.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button style={headerBtnGhost(loading || saving)} onClick={load} disabled={loading || saving}>
              ⟳ Yenile
            </button>
            <button style={headerBtnPrimary(loading || saving)} onClick={openCreate} disabled={loading || saving}>
              ＋ Yeni İşlem
            </button>
          </div>
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.22)",
              background: "rgba(255,255,255,0.14)",
              backdropFilter: "blur(6px)",
              fontWeight: 950,
              fontSize: 13,
            }}
          >
            Toplam Kayıt: {totalItems}
          </span>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.22)",
              background: "rgba(255,255,255,0.14)",
              backdropFilter: "blur(6px)",
              fontWeight: 950,
              fontSize: 13,
            }}
          >
            Dönem Aralığı: {from} → {to}
          </span>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.22)",
              background: "rgba(255,255,255,0.14)",
              backdropFilter: "blur(6px)",
              fontWeight: 950,
              fontSize: 13,
            }}
          >
            İşlem Türü: {type ? typeLabel(type) : "Tümü"}
          </span>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.22)",
              background: "rgba(255,255,255,0.14)",
              backdropFilter: "blur(6px)",
              fontWeight: 950,
              fontSize: 13,
            }}
          >
            Kategori: {category ? category : "Tümü"}
          </span>
        </div>
      </div>

      {/* Errors / Loading */}
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

      {loading && !error && (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 14,
            background: "#fff",
            border: "1px solid rgba(17,24,39,0.10)",
            color: "#6b7280",
            fontWeight: 950,
          }}
        >
          Veriler yükleniyor...
        </div>
      )}

      {/* Filters */}
      <div style={{ marginTop: 16 }}>
        <Card title="Filtreler">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 12 }}>
            <div style={{ gridColumn: "span 3" }}>
              <div style={label()}>Başlangıç Tarihi</div>
              <DatePicker
                selected={from ? new Date(from) : null}
                onChange={(date: Date | null) => {
                  if (date) {
                    // Date'in timezone offsetini önlemek için manuel formatlama (yyyy-MM-dd)
                    const d = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                    setFrom(d.toISOString().split("T")[0]);
                  } else {
                    setFrom("");
                  }
                  setPage(0);
                }}
                dateFormat="yyyy-MM-dd"
                locale="tr"
                customInput={<input style={inputStyle} />}
              />
            </div>

            <div style={{ gridColumn: "span 3" }}>
              <div style={label()}>Bitiş Tarihi</div>
              <DatePicker
                selected={to ? new Date(to) : null}
                onChange={(date: Date | null) => {
                  if (date) {
                    const d = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                    setTo(d.toISOString().split("T")[0]);
                  } else {
                    setTo("");
                  }
                  setPage(0);
                }}
                dateFormat="yyyy-MM-dd"
                locale="tr"
                customInput={<input style={inputStyle} />}
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <div style={label()}>İşlem Türü</div>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value as any);
                  setPage(0);
                }}
                style={inputStyle}
              >
                <option value="">Tümü</option>
                <option value="INCOME">Gelir</option>
                <option value="EXPENSE">Gider</option>
              </select>
            </div>

            <div style={{ gridColumn: "span 3" }}>
              <div style={label()}>Kategori</div>
              <input
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                placeholder="örn: market, kira..."
                style={inputStyle}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
                Aktif: <b>{category ? category : "Yok"}</b>
              </div>
            </div>

            <div style={{ gridColumn: "span 1" }}>
              <div style={label()}>Sayfa Boyutu</div>
              <select
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setPage(0);
                }}
                style={inputStyle}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </Card>
      </div>

      {/* List */}
      <div style={{ marginTop: 16 }}>
        <Card
          title="İşlem Listesi"
          right={
            data ? (
              <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 900 }}>
                Sayfa <b>{page + 1}</b> / <b>{pageCount || 1}</b>
              </div>
            ) : null
          }
        >
          {!data && !loading && <div style={{ color: "#6b7280", fontWeight: 900 }}>Kayıt bulunamadı.</div>}

          {data && data.items.length === 0 && <div style={{ color: "#6b7280", fontWeight: 900 }}>Kayıt bulunamadı.</div>}

          {data && data.items.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 14 }}>
                <thead>
                  <tr>
                    {["Tarih", "İşlem Türü", "Kategori", "Açıklama", "Tutar", "İşlemler"].map((h, idx) => (
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
                          color: "#111827",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {data.items.map((t) => (
                    <tr key={t.id}>
                      <td style={td()}>{t.transactionDate}</td>
                      <td style={td()}>
                        <span style={{ fontWeight: 950, color: t.type === "INCOME" ? "#047857" : "#dc2626" }}>
                          {typeLabel(t.type)}
                        </span>
                      </td>
                      <td style={{ ...td(), fontWeight: 950 }}>{t.category}</td>
                      <td style={td()}>{t.description ?? ""}</td>
                      <td
                        style={{
                          ...td(),
                          textAlign: "right",
                          whiteSpace: "nowrap",
                          fontWeight: 950,
                          color: t.type === "INCOME" ? "#047857" : "#dc2626",
                        }}
                      >
                        {t.type === "INCOME" ? "+" : "-"}
                        {fmtMoney(t.amount, t.currency)}
                      </td>
                      <td style={td()}>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          <button style={btnGhost(saving)} onClick={() => openEdit(t)} disabled={saving}>
                            Düzenle
                          </button>
                          <button style={btnDanger(saving)} onClick={() => onDelete(t.id)} disabled={saving}>
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div
                  style={{
                    marginTop: 14,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 900 }}>
                    Toplam Kayıt: <b>{data.totalItems}</b> • Sayfa: <b>{page + 1}</b> / <b>{data.totalPages}</b>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      style={btnGhost(loading || saving || page === 0)}
                      disabled={loading || saving || page === 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                    >
                      Önceki
                    </button>
                    <button
                      style={btnGhost(loading || saving || page >= data.totalPages - 1)}
                      disabled={loading || saving || page >= data.totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Sonraki
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* MODAL */}
      {open && (
        <div style={overlayStyle} onClick={closeModal}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 950, color: "#111827" }}>
                  {mode === "create" ? "Yeni İşlem" : "İşlem Kaydını Düzenle"}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4, fontWeight: 800 }}>
                  {mode === "create" ? "Yeni bir gelir/gider kaydı oluşturun." : `Kayıt No: ${editingId}`}
                </div>
              </div>

              <button style={btnGhost(saving)} disabled={saving} onClick={closeModal}>
                Kapat
              </button>
            </div>

            {formErrors.length > 0 && (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 14,
                  background: "rgba(220,38,38,0.06)",
                  border: "1px solid rgba(220,38,38,0.18)",
                  color: "#dc2626",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                <div style={{ fontWeight: 950, marginBottom: 6 }}>Uyarılar:</div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {formErrors.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 12 }}>
              <div style={{ gridColumn: "span 6" }}>
                <div style={label()}>İşlem Türü</div>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as TransactionType })}
                  style={inputStyle}
                  disabled={saving}
                >
                  <option value="INCOME">Gelir</option>
                  <option value="EXPENSE">Gider</option>
                </select>
              </div>

              <div style={{ gridColumn: "span 6" }}>
                <div style={label()}>İşlem Tarihi</div>
                <DatePicker
                  selected={form.transactionDate ? new Date(form.transactionDate) : null}
                  onChange={(date: Date | null) => {
                    if (date) {
                      const d = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                      setForm({ ...form, transactionDate: d.toISOString().split("T")[0] });
                    }
                  }}
                  dateFormat="yyyy-MM-dd"
                  locale="tr"
                  disabled={saving}
                  customInput={<input style={inputStyle} />}
                />
              </div>

              <div style={{ gridColumn: "span 12" }}>
                <div style={label()}>Kategori</div>
                <input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="en fazla 50 karakter"
                  style={inputStyle}
                  disabled={saving}
                />
              </div>

              <div style={{ gridColumn: "span 12" }}>
                <div style={label()}>Açıklama</div>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="en fazla 255 karakter (opsiyonel)"
                  style={inputStyle}
                  disabled={saving}
                />
              </div>

              <div style={{ gridColumn: "span 6" }}>
                <div style={label()}>Tutar</div>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="en az 0,01"
                  style={inputStyle}
                  disabled={saving}
                />
              </div>

              <div style={{ gridColumn: "span 6" }}>
                <div style={label()}>Para Birimi</div>
                <input
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
                  placeholder="TRY"
                  style={inputStyle}
                  disabled={saving}
                />
              </div>
            </div>

            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button style={btnGhost(saving)} disabled={saving} onClick={closeModal}>
                İptal
              </button>
              <button style={btnPrimary(saving)} disabled={saving} onClick={onSubmit}>
                {saving ? "Kaydediliyor..." : mode === "create" ? "Oluştur" : "Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function td() {
  return {
    padding: "12px 12px",
    borderBottom: "1px solid rgba(17,24,39,0.06)",
    color: "#111827",
    background: "#fff",
    verticalAlign: "middle" as const,
  };
}
function label() {
  return { fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 900 } as const;
}
