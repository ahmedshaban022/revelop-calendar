import { apiClient } from './client';
import type { Booking, CreateBookingRequest } from './types';

export const bookingsApi = {
  getAll: async (): Promise<Booking[]> => {
    const response = await apiClient.get<Booking[]>('/bookings');
    return response.data;
  },
  create: async (booking: CreateBookingRequest): Promise<Booking> => {
    const response = await apiClient.post<Booking>('/bookings', booking);
    return response.data;
  },
};

