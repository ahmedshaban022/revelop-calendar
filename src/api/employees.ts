import { apiClient } from './client';
import { normalizeEmployee } from './normalizers';
import type { Employee } from './types';

const EMPLOYEES_ENDPOINT = '/admin/employees';

export const employeesApi = {
  getAll: async (): Promise<Employee[]> => {
    const response = await apiClient.get<{ data?: unknown }>(EMPLOYEES_ENDPOINT);
    const raw = Array.isArray(response.data)
      ? response.data
      : Array.isArray((response.data as any)?.data)
        ? (response.data as any).data
        : [];
    return raw.map(normalizeEmployee);
  },
};

