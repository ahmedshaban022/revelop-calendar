import { apiClient } from './client';
import { normalizeService } from './normalizers';
import type { Service } from './types';

const SERVICES_ENDPOINT = '/admin/services';

export const servicesApi = {
  getAll: async (): Promise<Service[]> => {
    const response = await apiClient.get<{ data?: unknown }>(SERVICES_ENDPOINT);
    const raw = Array.isArray(response.data) ? response.data : Array.isArray((response.data as any)?.data) ? (response.data as any).data : [];
    return raw.map(normalizeService);
  },
};

