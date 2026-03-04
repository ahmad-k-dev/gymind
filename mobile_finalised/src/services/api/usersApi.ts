import { apiClient } from './api';
import type { BackendGetUserDto } from './types';

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
  const { data } = await apiClient.get<BackendGetUserDto>(`/api/users/${userId}`);
  return data;
}

export async function editProfileApi(payload: EditProfilePayload): Promise<void> {
  const form = new FormData();

  if (payload.fullName) form.append('fullName', payload.fullName);
  if (payload.biography) form.append('biography', payload.biography);
  if (payload.medicalConditions) form.append('medicalConditions', payload.medicalConditions);
  if (payload.emergencyContact) form.append('emergencyContact', payload.emergencyContact);

  await apiClient.patch('/api/users/edit-profile', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function uploadAvatarApi(payload: UploadAvatarPayload): Promise<void> {
  const form = new FormData();
  form.append('imageFile', payload as unknown as Blob);

  await apiClient.patch('/api/users/edit-profile', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
