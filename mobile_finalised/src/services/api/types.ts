export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
}

export interface CreateUserDto {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  gender: string;
  location?: string;
  dateOfBirth?: string;
}

export interface BackendGymDto {
  gymID: string;
  name: string;
  description?: string | null;
  isApproved: boolean;
  createdAt: string;
}

export interface BackendGetUserDto {
  userID: string;
  fullName: string;
  email: string;
  phone?: string | null;
  createdAt: string;
  roles: number[];
}

export interface BackendGymSessionHistoryDto {
  gymSessionID: string;
  description: string;
  checkInTime: string;
  checkOutTime: string;
  sessionDuration?: number | null;
  durationMinutes: number;
  branchName: string;
}

export interface BackendMembershipSummaryDto {
  membershipID: string;
  gymName: string;
  isActive: boolean;
  expiryDate?: string | null;
}
