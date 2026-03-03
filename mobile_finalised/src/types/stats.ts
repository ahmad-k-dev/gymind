import type { Traffic } from './index';

export interface AttendanceDay {
  date: string;
  attended: boolean;
}

export interface WeeklyActivityPoint {
  day: string;
  value: number;
}

export interface LinkedGym {
  id: string;
  name: string;
  address?: string;
  trafficLevel?: Traffic;
  image?: string;
}
