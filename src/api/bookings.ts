import { apiClient } from './client';
import type { Booking, CreateBookingRequest } from './types';

export const bookingsApi = {
  getAll: async (): Promise<Booking[]> => {
    const response = await apiClient.get<Booking[]>('admin/bookings');
    return response.data;
  },
  create: async (booking: CreateBookingRequest): Promise<Booking> => {
    const response = await apiClient.post<Booking>('admin/bookings', booking);
    return response.data;
  },
};

