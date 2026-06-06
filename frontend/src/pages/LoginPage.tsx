import React, { useEffect, useMemo, useState } from "react";
import { login, register } from "../services/authService";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { setAccessToken } from "../services/api";

type Mode = "login" | "register";

export default function LoginPage({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<Mode>("login");

  // ortak
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // sadece kayıt
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setMsg(null);
    setShowPassword(false);
  }, [mode]);

  const canSubmit = useMemo(() => {
    if (!email.trim() || !password.trim()) return false;
    if (mode === "register") {
      if (!firstName.trim() || !lastName.trim()) return false;
      if (password.trim().length < 6) return false;
    }
    return true;
  }, [mode, email, password, firstName, lastName]);

  function switchMode(next: Mode) {
    setMsg(null);
    setMode(next);
    if (next === "login") {
      setFirstName("");
      setLastName("");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!canSubmit) return;

    setLoading(true);
    try {
      if (mode === "login") {
        const data = await login({ email: email.trim(), password });
        setAccessToken(data.accessToken);
        onSuccess();
        return;
      }

      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      });

      const data = await login({ email: email.trim(), password });
      setAccessToken(data.accessToken);

      setMsg({ type: "success", text: "Hesap oluşturuldu. Giriş yapılıyor..." });
      onSuccess();
    } catch (err: any) {
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "İşlem başarısız";
      setMsg({ type: "error", text: backendMsg });
    } finally {
      setLoading(false);
    }
  }

  const title = mode === "login" ? "Tekrar Hoş Geldin" : "Hesap Oluştur";
  const subtitle = mode === "login" ? "Hesabına giriş yap" : "Yeni bir hesap oluştur";
  const buttonText = mode === "login" ? "Giriş Yap" : "Kayıt Ol";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background:
          "radial-gradient(circle at 20% 30%, #6366f1 0%, transparent 40%), radial-gradient(circle at 80% 70%, #8b5cf6 0%, transparent 40%), linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        boxSizing: "border-box",
      }}
    >
      {/* Glow blur effect */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          background: "#6366f1",
          filter: "blur(180px)",
          opacity: 0.3,
          top: -150,
          left: -150,
        }}
      />

      <div
        style={{
          width: 440,
          maxWidth: "100%",
          padding: 32,
          borderRadius: 28,
          backdropFilter: "blur(30px)",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
          color: "#fff",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -0.2 }}>Personal Finance</div>
            <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
              {title} • {subtitle}
            </div>
          </div>

          {/* Segmented toggle */}
          <div
            style={{
              display: "inline-flex",
              borderRadius: 16,
              padding: 4,
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.14)",
            }}
          >
            <button
              type="button"
              onClick={() => switchMode("login")}
              style={{
                border: "none",
                borderRadius: 12,
                padding: "8px 10px",
                cursor: "pointer",
                fontWeight: 900,
                fontSize: 12,
                color: "#fff",
                background: mode === "login" ? "rgba(255,255,255,0.18)" : "transparent",
              }}
            >
              Giriş
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              style={{
                border: "none",
                borderRadius: 12,
                padding: "8px 10px",
                cursor: "pointer",
                fontWeight: 900,
                fontSize: 12,
                color: "#fff",
                background: mode === "register" ? "rgba(255,255,255,0.18)" : "transparent",
              }}
            >
              Kayıt
            </button>
          </div>
        </div>

        {/* Message */}
        {msg && (
          <div
            style={{
              marginTop: 16,
              borderRadius: 16,
              padding: 12,
              fontWeight: 900,
              fontSize: 13,
              border:
                msg.type === "success"
                  ? "1px solid rgba(16,185,129,0.35)"
                  : "1px solid rgba(239,68,68,0.35)",
              background:
                msg.type === "success" ? "rgba(16,185,129,0.10)" : "rgba(239,68,68,0.10)",
              color: msg.type === "success" ? "#a7f3d0" : "#fecaca",
            }}
          >
            {msg.text}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 14, marginTop: 18 }}>
          {/* Register: Ad/Soyad */}
          {mode === "register" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field icon={<User size={18} />} placeholder="Ad" value={firstName} onChange={setFirstName} />
              <Field
                icon={<User size={18} />}
                placeholder="Soyad"
                value={lastName}
                onChange={setLastName}
              />
            </div>
          )}

          {/* EMAIL */}
          <Field icon={<Mail size={18} />} placeholder="E-posta" value={email} onChange={setEmail} />

          {/* PASSWORD */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "rgba(255,255,255,0.12)",
              padding: "14px 16px",
              borderRadius: 16,
              gap: 12,
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <Lock size={18} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#fff",
                width: "100%",
                fontSize: 14,
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "rgba(255,255,255,0.9)",
                display: "flex",
                alignItems: "center",
              }}
              aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
              title={showPassword ? "Gizle" : "Göster"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* BUTTON */}
          <button
            disabled={loading || !canSubmit}
            style={{
              marginTop: 6,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              border: "none",
              borderRadius: 16,
              padding: "14px",
              fontWeight: 900,
              fontSize: 15,
              color: "#fff",
              cursor: loading || !canSubmit ? "not-allowed" : "pointer",
              boxShadow: "0 20px 40px rgba(99,102,241,0.4)",
              opacity: loading || !canSubmit ? 0.75 : 1,
              transition: "all 0.3s ease",
            }}
          >
            {loading ? (mode === "login" ? "Giriş yapılıyor..." : "Hesap oluşturuluyor...") : buttonText}
          </button>

          {/* Bottom hint */}
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75, textAlign: "center" }}>
            {mode === "login" ? (
              <>
                Hesabın yok mu?{" "}
                <span
                  onClick={() => switchMode("register")}
                  style={{ fontWeight: 900, cursor: "pointer", textDecoration: "underline" }}
                >
                  Kayıt Ol
                </span>
              </>
            ) : (
              <>
                Zaten hesabın var mı?{" "}
                <span
                  onClick={() => switchMode("login")}
                  style={{ fontWeight: 900, cursor: "pointer", textDecoration: "underline" }}
                >
                  Giriş Yap
                </span>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  icon,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "rgba(255,255,255,0.12)",
        padding: "14px 16px",
        borderRadius: 16,
        gap: 12,
        border: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      {icon}
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: "transparent",
          border: "none",
          outline: "none",
          color: "#fff",
          width: "100%",
          fontSize: 14,
        }}
      />
    </div>
  );
}
