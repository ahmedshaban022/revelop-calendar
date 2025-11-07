import { apiClient } from './client';
import { normalizeBooking } from './normalizers';
import type { Booking, CreateBookingRequest } from './types';

const BOOKINGS_ENDPOINT = '/admin/bookings';

const mapToApiPayload = (booking: CreateBookingRequest) => ({
  service_id: booking.serviceId,
  employee_id: booking.employeeId,
  booking_time: booking.startTime,
  customer_name: booking.customerName,
  customer_email: booking.customerEmail,
  customer_phone: booking.customerPhone,
  notes: booking.notes,
});

const unwrapDataArray = (responseData: any): unknown[] => {
  if (Array.isArray(responseData)) return responseData;
  if (responseData && Array.isArray(responseData.data)) return responseData.data;
  return [];
};

export const bookingsApi = {
  getAll: async (): Promise<Booking[]> => {
    const response = await apiClient.get<{ data?: unknown }>(BOOKINGS_ENDPOINT);
    const raw = unwrapDataArray(response.data);
    return raw.map(normalizeBooking);
  },
  create: async (booking: CreateBookingRequest): Promise<Booking> => {
    const response = await apiClient.post<{ data?: unknown }>(BOOKINGS_ENDPOINT, mapToApiPayload(booking));
    const raw = (response.data && (response.data as any).data) ?? response.data;
    return normalizeBooking(raw);
  },
};

