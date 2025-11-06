import { apiClient } from './client';
import type { Employee } from './types';

export const employeesApi = {
  getAll: async (): Promise<Employee[]> => {
    const response = await apiClient.get<Employee[]>('/employees');
    return response.data;
  },
};

