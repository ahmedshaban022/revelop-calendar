// API Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  message?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
    user_type?: string;
    phone?: string;
  };
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration?: number;
  price?: number;
}

export interface Employee {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  photo?: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  employeeId: string;
  startTime: string;
  endTime: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
}

export interface CreateBookingRequest {
  serviceId: string;
  employeeId: string;
  startTime: string;
  endTime: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
}

