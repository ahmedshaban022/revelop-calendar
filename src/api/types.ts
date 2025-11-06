// API Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface Service {
  id: string;
  name: string;
  duration?: number;
  price?: number;
}

export interface Employee {
  id: string;
  name: string;
  email?: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  employeeId: string;
  startTime: string;
  endTime: string;
  customerName?: string;
  customerEmail?: string;
  notes?: string;
}

export interface CreateBookingRequest {
  serviceId: string;
  employeeId: string;
  startTime: string;
  endTime: string;
  customerName?: string;
  customerEmail?: string;
  notes?: string;
}

