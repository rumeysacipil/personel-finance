import api from "./api";

export type MeResponse = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
};

export async function getMe(): Promise<MeResponse> {
  const res = await api.get<MeResponse>("/users/me");
  return res.data;
}

export async function changePassword(payload: {
  oldPassword: string;
  newPassword: string;
}) {
  await api.put("/users/password", payload);
}

export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/users/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}

export async function updateProfile(data: {
  firstName: string;
  lastName: string;
}): Promise<MeResponse> {
  const res = await api.put<MeResponse>("/users/me", data);
  return res.data;
}
