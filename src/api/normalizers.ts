import type { Service, Employee, Booking } from './types';
import { addMinutes, parseISO, isValid as isValidDate } from 'date-fns';

const fallbackId = () => `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const toStringId = (value: unknown, fallback: string): string => {
  if (typeof value === 'string' && value) return value;
  if (typeof value === 'number') return String(value);
  return fallback;
};

export const normalizeService = (service: any): Service => ({
  id: toStringId(service?.id ?? service?.service_id, fallbackId()),
  name: service?.name ?? service?.title ?? 'Unnamed Service',
  description: service?.description ?? undefined,
  duration: service?.duration ?? service?.duration_minutes ?? service?.default_duration ?? undefined,
  price: typeof service?.price === 'number' ? service?.price : Number(service?.price) || undefined,
});

export const normalizeEmployee = (employee: any): Employee => {
  const fallbackName = [employee?.first_name, employee?.last_name].filter(Boolean).join(' ');
  return {
    id: toStringId(employee?.id ?? employee?.employee_id, fallbackId()),
    name: employee?.name ?? (fallbackName || 'Unknown Employee'),
    email: employee?.email ?? employee?.contact_email ?? undefined,
    phone: employee?.phone ?? employee?.contact_phone ?? undefined,
    photo: employee?.photo ?? employee?.avatar ?? employee?.profile_picture ?? undefined,
  };
};

const deriveEndTime = (startIso: string, durationMinutes?: number): string => {
  const startDate = parseISO(startIso);
  if (!isValidDate(startDate)) {
    return new Date(Date.now() + 60 * 60 * 1000).toISOString();
  }
  return addMinutes(startDate, durationMinutes ?? 60).toISOString();
};

export const normalizeBooking = (booking: any): Booking => {
  const rawStart = booking?.startTime ?? booking?.start_time ?? booking?.start ?? booking?.booking_time;
  const startIso = rawStart ? new Date(rawStart).toISOString() : new Date().toISOString();
  const service = booking?.service;
  const serviceDuration = service?.duration ?? booking?.duration ?? undefined;

  return {
    id: toStringId(booking?.id ?? booking?.booking_id, fallbackId()),
    serviceId: toStringId(
      booking?.serviceId ?? booking?.service_id ?? service?.id,
      'service-unknown'
    ),
    employeeId: toStringId(
      booking?.employeeId ?? booking?.employee_id ?? booking?.employee?.id,
      'employee-unknown'
    ),
    startTime: startIso,
    endTime:
      booking?.endTime ?? booking?.end_time ?? deriveEndTime(startIso, serviceDuration),
    customerName:
      booking?.customerName ?? booking?.customer_name ?? booking?.client_name ?? booking?.customer?.name,
    customerEmail:
      booking?.customerEmail ?? booking?.customer_email ?? booking?.client_email ?? booking?.customer?.email,
    customerPhone:
      booking?.customerPhone ?? booking?.customer_phone ?? booking?.client_phone ?? booking?.customer?.phone,
    notes: booking?.notes ?? booking?.remarks ?? undefined,
  };
};
