export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    requestPasswordReset: '/auth/request-password-reset',
    resetPassword: '/auth/reset-password',
  },
  users: {
    byId: (userId: string) => `/users/${userId}`,
    editProfile: '/users/edit-profile',
  },
  gyms: {
    all: '/gyms',
  },
  membership: {
    myMemberships: '/membership/my-memberships',
  },
  session: {
    checkIn: '/gymsession/check-in',
    checkOut: '/gymsession/check-out',
    myHistory: '/gymsession/my-history',
  },
} as const;
