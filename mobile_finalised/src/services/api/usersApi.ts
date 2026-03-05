import { apiClient } from "./api";
import type { BackendGetUserDto } from "./types";

export interface EditProfilePayload {
  fullName?: string;
  biography?: string;
  medicalConditions?: string;
  emergencyContact?: string;
}

export interface UploadAvatarPayload {
  uri: string;
  name: string;
  type: string;
}

export async function getUserApi(userId: string): Promise<BackendGetUserDto> {
  const { data } = await apiClient.get<BackendGetUserDto>(`/users/${userId}`);
  return data;
}

export async function editProfileApi(payload: EditProfilePayload): Promise<void> {
  const form = new FormData();

  // Match DTO names (ASP.NET is often case-insensitive, but this is safest)
  if (payload.fullName) form.append("FullName", payload.fullName);
  if (payload.biography) form.append("Biography", payload.biography);
  if (payload.medicalConditions) form.append("MedicalConditions", payload.medicalConditions);
  if (payload.emergencyContact) form.append("EmergencyContact", payload.emergencyContact);

  await apiClient.patch("/users/edit-profile", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function uploadAvatarApi(payload: UploadAvatarPayload): Promise<void> {
  const form = new FormData();

  // ✅ React Native file object (don’t cast to Blob)
  form.append(
    "ImageFile",
    {
      uri: payload.uri,
      name: payload.name,
      type: payload.type,
    } as any
  );

  await apiClient.patch("/users/edit-profile", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}