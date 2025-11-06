import { apiClient } from './client';
import type { LoginRequest, LoginResponse } from './types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    // Temporary static login for testing
    if (credentials.email === 'ain@ain.com' && credentials.password === '12341234') {
      return {
        token: '265|9kEU9FVxnp3EDiVIOStv9gIji4Ih3HvouMN145iFdab722ef',
        user: {
          id: '4',
          email: 'admin@salon.com',
          name: 'Admin User',
        },
      };
    }

    // Normal API call for other credentials
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },
};

