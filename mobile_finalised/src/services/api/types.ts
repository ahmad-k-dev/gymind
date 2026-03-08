export interface LoginRequestDto {
  Email: string;
  Password: string;
}

export interface CreateUserDto {
  FullName: string;
  Email: string;
  Phone: string;
  Password: string;
  Gender: string;
  Location?: string;
  DateOfBirth?: string;
}

export interface TokenExchangeRequestDto {
  Token: string;
  RefreshToken: string;
  Roles: string[];
  UserID: string;
}

export interface RefreshTokenRequestDto {
  Token: string;
  RefreshToken: string;
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

export interface BackendErrorResponse {
  message?: string;
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}


export interface BackendAnnouncementDto {
  announcementID: string;
  gymBranchID: string;
  title: string;
  content: string;
  createdAt: string;
  expiresAt?: string | null;
}

export interface BackendNotificationDto {
  notificationID: string;
  title: string;
  message: string;
  sentAt: string;
  gymId?: string | null;
  gymBranchID?: string | null;
  isRead: boolean;
  readAt?: string | null;
}
