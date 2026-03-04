import { apiClient } from './client';
import type { BackendGetUserDto } from './types';

export async function getUserByIdApi(userId: string): Promise<BackendGetUserDto> {
  const { data } = await apiClient.get<BackendGetUserDto>(`/api/users/${userId}`);
  return data;
}

export interface EditProfilePayload {
  fullName?: string;
  biography?: string;
  medicalConditions?: string;
  emergencyContact?: string;
  imageFile?: { uri: string; name: string; type: string };
}

export async function editMyProfileApi(payload: EditProfilePayload): Promise<void> {
  const form = new FormData();

  if (payload.fullName) form.append('fullName', payload.fullName);
  if (payload.biography) form.append('biography', payload.biography);
  if (payload.medicalConditions) form.append('medicalConditions', payload.medicalConditions);
  if (payload.emergencyContact) form.append('emergencyContact', payload.emergencyContact);

  if (payload.imageFile) {
    form.append('imageFile', payload.imageFile as any);
  }

  await apiClient.patch('/api/users/edit-profile', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
