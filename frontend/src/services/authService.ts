// src/services/authService.ts
import api, { setAccessToken, clearTokens } from "./api";

/* ------------------ TYPES ------------------ */

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

// ✅ Hibrit backend'de refreshToken body'de gelebilir (mobil için).
// Web bunu kullanmaz; cookie zaten set oluyor.
// O yüzden refreshToken opsiyonel.
export type AuthResponse = {
  accessToken: string;
  refreshToken?: string;
};

/* ------------------ HELPERS ------------------ */

function setAuth(data: AuthResponse) {
  if (!data?.accessToken) {
    clearTokens();
    throw new Error("Auth response is missing accessToken");
  }
  setAccessToken(data.accessToken);
}

/* ------------------ LOGIN ------------------ */

export async function login(req: LoginRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", req);
  setAuth(data);
  return data;
}

/* ------------------ REGISTER ------------------ */

export async function register(req: RegisterRequest): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", req);
  setAuth(data);
  return data;
}

/* ------------------ LOGOUT ------------------ */

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout", null);
  } finally {
    clearTokens();
  }
}
