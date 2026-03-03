import type { AttendanceDay, LinkedGym, WeeklyActivityPoint } from '../types/stats';

export const WEEKLY_ACTIVITY: readonly WeeklyActivityPoint[] = [
  { day: 'M', value: 60 },
  { day: 'T', value: 110 },
  { day: 'W', value: 40 },
  { day: 'T', value: 75 },
  { day: 'F', value: 50 },
  { day: 'S', value: 140 },
  { day: 'S', value: 30 },
];

const ATTENDANCE_MASK: readonly boolean[] = [
  true, false, true, true, false, true, true, false, true, true,
  false, false, true, true, true, false, true, false, false, true,
  true, true, false, false, true, true, true, true, false, true,
];

function buildLast30Attendance(): AttendanceDay[] {
  const out: AttendanceDay[] = [];
  const now = new Date();

  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    out.push({
      date: d.toISOString().slice(0, 10),
      attended: ATTENDANCE_MASK[29 - i] ?? false,
    });
  }

  return out;
}

export const ATTENDANCE_LAST_30_DAYS: readonly AttendanceDay[] = buildLast30Attendance();

export const LINKED_GYM: LinkedGym = {
  id: '1',
  name: 'PowerHouse Gym - Downtown',
  address: '742 Fitness Way, NY',
  trafficLevel: 'Medium',
  image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80',
};
