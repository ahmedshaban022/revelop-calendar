import { apiClient } from './client';
import type { LoginRequest, LoginResponse } from './types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {

    // Normal API call for other credentials
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },
};

