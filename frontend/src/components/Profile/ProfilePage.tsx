import { useEffect, useMemo, useRef, useState } from "react";
import {
  changePassword,
  getMe,
  uploadAvatar,
  updateProfile,
  type MeResponse,
} from "../../services/userService";
import { SERVER_BASE_URL } from "../../services/api";

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 16,
  border: "1px solid rgba(17,24,39,0.10)",
  background: "#fff",
  boxSizing: "border-box" as const,
  outline: "none",
  fontSize: 15,
  color: "#111827",
};

function panelStyle() {
  return {
    background: "#ffffff",
    borderRadius: 22,
    padding: 18,
    border: "1px solid rgba(17,24,39,0.08)",
    boxShadow: "0 12px 34px rgba(17,24,39,0.08)",
  } as const;
}

function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 7h3l2-2h6l2 2h3v13H4V7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10.6 10.6a3 3 0 0 0 4.24 4.24" stroke="currentColor" strokeWidth="2" />
      <path
        d="M6.2 6.2C3.9 7.9 2.5 12 2.5 12s3.5 7 9.5 7c1.6 0 3-.3 4.2-.8"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M9.8 5.3A10 10 0 0 1 12 5c6 0 9.5 7 9.5 7a16.8 16.8 0 0 1-3.1 4.2"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 800 }}>{label}</div>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...inputStyle, paddingRight: 48 }}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            border: "1px solid rgba(17,24,39,0.10)",
            background: "#fff",
            borderRadius: 12,
            padding: "8px 10px",
            cursor: "pointer",
            color: "#6b7280",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title={show ? "Gizle" : "Göster"}
          aria-label={show ? "Şifreyi gizle" : "Şifreyi göster"}
        >
          <EyeIcon open={show} />
        </button>
      </div>
    </div>
  );
}

function scorePassword(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
function scoreLabel(s: number) {
  if (s <= 1) return "Zayıf";
  if (s === 2) return "Orta";
  if (s === 3) return "İyi";
  return "Güçlü";
}

function BottomSheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(17,24,39,0.45)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 12,
      }}
      aria-modal="true"
      role="dialog"
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#fff",
          borderRadius: 22,
          border: "1px solid rgba(17,24,39,0.10)",
          boxShadow: "0 18px 60px rgba(0,0,0,0.25)",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}>
          <div style={{ width: 42, height: 5, borderRadius: 999, background: "rgba(17,24,39,0.15)" }} />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px 10px 16px",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 950, color: "#111827" }}>{title}</div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "1px solid rgba(17,24,39,0.10)",
              background: "#fff",
              borderRadius: 12,
              padding: "8px 10px",
              cursor: "pointer",
              fontWeight: 900,
              color: "#111827",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: 16, paddingTop: 6 }}>{children}</div>
      </div>
    </div>
  );
}

function fullName(me: MeResponse | null) {
  const fn = me?.firstName ?? "";
  const ln = me?.lastName ?? "";
  const name = `${fn} ${ln}`.trim();
  return name || "Kullanıcı";
}

export default function ProfilePage() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [passwordSheetOpen, setPasswordSheetOpen] = useState(false);
  const [nameSheetOpen, setNameSheetOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function refreshMe() {
    const data = await getMe();
    setMe(data);
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await refreshMe();
      } catch {
        setMe(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Name Sheet
  function openNameSheet() {
    setMsg(null);
    setEditFirstName((me?.firstName ?? "").toString());
    setEditLastName((me?.lastName ?? "").toString());
    setNameSheetOpen(true);
  }

  function closeNameSheet() {
    if (savingName) return;
    setNameSheetOpen(false);
  }

  const canSaveName = useMemo(() => {
    const fn = editFirstName.trim();
    const ln = editLastName.trim();
    if (!fn || !ln) return false;
    const curFn = (me?.firstName ?? "").toString().trim();
    const curLn = (me?.lastName ?? "").toString().trim();
    return fn !== curFn || ln !== curLn;
  }, [editFirstName, editLastName, me]);

  async function saveName() {
    setMsg(null);
    if (!canSaveName) return;

    setSavingName(true);
    try {
      const updated = await updateProfile({
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
      });

      setMe(updated);
      window.dispatchEvent(new CustomEvent("me:updated", { detail: updated }));
      setMsg({ type: "success", text: "Ad soyad güncellendi ✓" });

      setTimeout(() => {
        setSavingName(false);
        closeNameSheet();
      }, 250);
      return;
    } catch (e: any) {
      setMsg({ type: "error", text: e?.response?.data?.message ?? "Güncelleme başarısız" });
    } finally {
      setSavingName(false);
    }
  }

  // Password Sheet
  const pwScore = useMemo(() => scorePassword(newPassword), [newPassword]);
  const passwordsMatch = useMemo(
    () => (!confirmNewPassword ? true : newPassword === confirmNewPassword),
    [newPassword, confirmNewPassword]
  );

  const canSavePassword = useMemo(() => {
    if (!currentPassword || !newPassword || !confirmNewPassword) return false;
    if (newPassword.length < 6) return false;
    if (newPassword !== confirmNewPassword) return false;
    return true;
  }, [currentPassword, newPassword, confirmNewPassword]);

  function openPasswordSheet() {
    setMsg(null);
    setPasswordSheetOpen(true);
  }

  function closePasswordSheet() {
    if (savingPassword) return;
    setPasswordSheetOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  }

  async function savePassword() {
    setMsg(null);
    if (!passwordsMatch) {
      setMsg({ type: "error", text: "Şifreler eşleşmiyor" });
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword({ oldPassword: currentPassword, newPassword });
      setMsg({ type: "success", text: "Şifre güncellendi ✓" });

      setTimeout(() => {
        setSavingPassword(false);
        closePasswordSheet();
      }, 300);
      return;
    } catch (e: any) {
      setMsg({ type: "error", text: e?.response?.data?.message ?? "Mevcut şifre hatalı" });
    } finally {
      setSavingPassword(false);
    }
  }

  // Avatar
  function pickAvatar() {
    setMsg(null);
    fileRef.current?.click();
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";

    if (!file.type.startsWith("image/")) {
      setMsg({ type: "error", text: "Lütfen bir görsel seçin (JPG / PNG / WebP)" });
      return;
    }

    setUploading(true);
    setMsg(null);
    try {
      await uploadAvatar(file);
      await refreshMe();
      window.dispatchEvent(new Event("me:updated"));
      setMsg({ type: "success", text: "Fotoğraf güncellendi ✓" });
    } catch (err: any) {
      setMsg({ type: "error", text: err?.response?.data?.message ?? "Fotoğraf yüklenemedi" });
    } finally {
      setUploading(false);
    }
  }

  const avatarSrc = me?.profileImageUrl
    ? `${SERVER_BASE_URL}${me.profileImageUrl}?t=${Date.now()}`
    : "";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderRadius: 24,
          padding: "20px 22px",
          background:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25) 0%, transparent 45%), linear-gradient(135deg,#2563eb 0%, #4f46e5 55%, #7c3aed 100%)",
          color: "#fff",
          boxShadow: "0 22px 60px rgba(37,99,235,0.28)",
          border: "1px solid rgba(255,255,255,0.18)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 950, letterSpacing: -0.2 }}>Hesap Ayarları</div>
            <div style={{ opacity: 0.86, marginTop: 6, fontSize: 13 }}>Profil bilgileri ve güvenlik ayarları</div>
          </div>

          <button
            type="button"
            onClick={pickAvatar}
            disabled={uploading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              border: "1px solid rgba(255,255,255,0.22)",
              background: "rgba(255,255,255,0.12)",
              padding: "10px 12px",
              borderRadius: 18,
              cursor: uploading ? "not-allowed" : "pointer",
              color: "#fff",
            }}
            title="Fotoğrafı değiştir"
          >
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                overflow: "hidden",
                border: "2px solid rgba(255,255,255,0.45)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.18)",
                fontWeight: 950,
              }}
            >
              {avatarSrc ? (
                <img src={avatarSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                fullName(me).slice(0, 1).toUpperCase()
              )}
            </span>

            <span style={{ display: "grid", gap: 2, textAlign: "left" }}>
              <span style={{ fontWeight: 950, fontSize: 13, lineHeight: 1.1 }}>{fullName(me)}</span>
              <span style={{ opacity: 0.85, fontSize: 12, lineHeight: 1.1 }}>
                {uploading ? "Yükleniyor..." : "Fotoğrafı değiştir"}
              </span>
            </span>

            <span style={{ opacity: 0.9, display: "inline-flex" }}>
              <CameraIcon />
            </span>
          </button>

          <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} style={{ display: "none" }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ marginTop: 18, ...panelStyle() }}>
        {loading ? (
          <div style={{ color: "#6b7280", fontWeight: 800 }}>Yükleniyor…</div>
        ) : (
          <>
            {/* Name */}
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 900 }}>Ad Soyad</div>
              <div
                role="button"
                tabIndex={0}
                onClick={openNameSheet}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") openNameSheet();
                }}
                style={{ position: "relative", cursor: "pointer" }}
              >
                <input
                  value={fullName(me)}
                  readOnly
                  style={{
                    ...inputStyle,
                    background: "#fff",
                    paddingRight: 44,
                    cursor: "pointer",
                    boxShadow: "0 0 0 4px rgba(37,99,235,0.06)",
                    border: "1px solid rgba(37,99,235,0.18)",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    pointerEvents: "none",
                  }}
                >
                  <PencilIcon />
                </span>
              </div>
            </div>

            {/* Email */}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 900 }}>E-posta</div>
              <input value={me?.email ?? ""} readOnly style={{ ...inputStyle, background: "#f3f4f6" }} />
            </div>

            {/* Password */}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 900 }}>Şifre</div>
              <div
                role="button"
                tabIndex={0}
                onClick={openPasswordSheet}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") openPasswordSheet();
                }}
                style={{ position: "relative", cursor: "pointer" }}
              >
                <input
                  value={"••••••••"}
                  readOnly
                  style={{
                    ...inputStyle,
                    background: "#fff",
                    paddingRight: 44,
                    cursor: "pointer",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#2563eb",
                    display: "flex",
                    alignItems: "center",
                    pointerEvents: "none",
                  }}
                >
                  <PencilIcon />
                </span>
              </div>
            </div>

            {/* Page message */}
            {msg && !passwordSheetOpen && !nameSheetOpen && (
              <div
                style={{
                  marginTop: 14,
                  borderRadius: 16,
                  padding: 12,
                  fontWeight: 900,
                  fontSize: 13,
                  border:
                    msg.type === "success"
                      ? "1px solid rgba(16,185,129,0.25)"
                      : "1px solid rgba(239,68,68,0.25)",
                  background: msg.type === "success" ? "#ecfdf5" : "#fef2f2",
                  color: msg.type === "success" ? "#047857" : "#dc2626",
                }}
              >
                {msg.text}
              </div>
            )}
          </>
        )}
      </div>

      {/* Name Sheet */}
      <BottomSheet open={nameSheetOpen} title="Ad Soyad Güncelle" onClose={closeNameSheet}>
        <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 700 }}>Ad ve soyad bilgilerinizi güncelleyin.</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 800 }}>İsim</div>
            <input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6, fontWeight: 800 }}>Soyisim</div>
            <input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} style={inputStyle} />
          </div>
        </div>

        {msg && nameSheetOpen && (
          <div
            style={{
              marginTop: 12,
              borderRadius: 16,
              padding: 12,
              fontWeight: 900,
              fontSize: 13,
              border: msg.type === "success" ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(239,68,68,0.25)",
              background: msg.type === "success" ? "#ecfdf5" : "#fef2f2",
              color: msg.type === "success" ? "#047857" : "#dc2626",
            }}
          >
            {msg.text}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
          <button
            type="button"
            onClick={closeNameSheet}
            disabled={savingName}
            style={{
              borderRadius: 14,
              padding: "10px 14px",
              fontWeight: 900,
              border: "1px solid rgba(17,24,39,0.10)",
              background: "#fff",
              cursor: savingName ? "not-allowed" : "pointer",
              opacity: savingName ? 0.7 : 1,
            }}
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={saveName}
            disabled={!canSaveName || savingName}
            style={{
              borderRadius: 14,
              padding: "10px 14px",
              fontWeight: 900,
              border: "none",
              background: "#111827",
              color: "#fff",
              cursor: !canSaveName || savingName ? "not-allowed" : "pointer",
              opacity: !canSaveName || savingName ? 0.6 : 1,
            }}
          >
            {savingName ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </BottomSheet>

      {/* Password Sheet */}
      <BottomSheet open={passwordSheetOpen} title="Şifre Değiştir" onClose={closePasswordSheet}>
        <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 700 }}>Güvenlik için mevcut şifrenizi girin.</div>

        <PasswordField label="Mevcut şifre" value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" />
        <PasswordField label="Yeni şifre" value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
        <PasswordField label="Yeni şifre (tekrar)" value={confirmNewPassword} onChange={setConfirmNewPassword} autoComplete="new-password" />

        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 900 }}>Güç: {scoreLabel(pwScore)}</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>Min. 6 karakter</div>
          </div>
          <div style={{ marginTop: 8, height: 8, borderRadius: 999, background: "rgba(17,24,39,0.08)" }}>
            <div
              style={{
                height: 8,
                borderRadius: 999,
                width: `${(pwScore / 4) * 100}%`,
                background: "#111827",
                transition: "width 180ms ease",
              }}
            />
          </div>
          {!passwordsMatch && (
            <div style={{ marginTop: 10, fontSize: 13, fontWeight: 900, color: "#dc2626" }}>Şifreler eşleşmiyor.</div>
          )}
        </div>

        {msg && passwordSheetOpen && (
          <div
            style={{
              marginTop: 12,
              borderRadius: 16,
              padding: 12,
              fontWeight: 900,
              fontSize: 13,
              border: msg.type === "success" ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(239,68,68,0.25)",
              background: msg.type === "success" ? "#ecfdf5" : "#fef2f2",
              color: msg.type === "success" ? "#047857" : "#dc2626",
            }}
          >
            {msg.text}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
          <button
            type="button"
            onClick={closePasswordSheet}
            disabled={savingPassword}
            style={{
              borderRadius: 14,
              padding: "10px 14px",
              fontWeight: 900,
              border: "1px solid rgba(17,24,39,0.10)",
              background: "#fff",
              cursor: savingPassword ? "not-allowed" : "pointer",
              opacity: savingPassword ? 0.7 : 1,
            }}
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={savePassword}
            disabled={!canSavePassword || savingPassword}
            style={{
              borderRadius: 14,
              padding: "10px 14px",
              fontWeight: 900,
              border: "none",
              background: "#111827",
              color: "#fff",
              cursor: !canSavePassword || savingPassword ? "not-allowed" : "pointer",
              opacity: !canSavePassword || savingPassword ? 0.6 : 1,
            }}
          >
            {savingPassword ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
