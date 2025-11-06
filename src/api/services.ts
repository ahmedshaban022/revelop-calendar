import { apiClient } from './client';
import type { Service } from './types';

export const servicesApi = {
  getAll: async (): Promise<Service[]> => {
    const response = await apiClient.get<Service[]>('/services');
    return response.data;
  },
};

