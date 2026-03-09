import { apiClient } from './api';
import { API_ENDPOINTS } from './endpoints';
import type { BackendGetUserDto } from './types';

export interface EditProfilePayload {
  fullName?: string;
  biography?: string;
  medicalConditions?: string;
  emergencyContact?: string;
  height?: string;
  weight?: string;
}

export interface UploadAvatarPayload {
  uri: string;
  name: string;
  type: string;
}

export async function getUserApi(userId: string): Promise<BackendGetUserDto> {
  const { data } = await apiClient.get<BackendGetUserDto>(API_ENDPOINTS.users.byId(userId));
  return data;
}

export async function editProfileApi(payload: EditProfilePayload): Promise<void> {
  const form = new FormData();

  if (payload.fullName) form.append('FullName', payload.fullName);
  if (payload.biography) form.append('Biography', payload.biography);
  if (payload.medicalConditions) form.append('MedicalConditions', payload.medicalConditions);
  if (payload.emergencyContact) form.append('EmergencyContact', payload.emergencyContact);
  if (payload.height) form.append('Height', payload.height);
  if (payload.weight) form.append('Weight', payload.weight);

  await apiClient.patch(API_ENDPOINTS.users.editProfile, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function uploadAvatarApi(payload: UploadAvatarPayload): Promise<void> {
  const form = new FormData();

  form.append(
    'ImageFile',
    {
      uri: payload.uri,
      name: payload.name,
      type: payload.type,
    } as any
  );

  await apiClient.patch(API_ENDPOINTS.users.editProfile, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
