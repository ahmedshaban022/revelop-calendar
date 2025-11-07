import { apiClient } from './client';
import type { Service } from './types';

export const servicesApi = {
  getAll: async (): Promise<Service[]> => {
    const response = await apiClient.get<Service[]>('admin/services');
    return response.data;
  },
};

