import { useState } from 'react';
import type { FormEvent } from 'react';
import { addMinutes, isValid } from 'date-fns';
import { toast } from 'sonner';
import { bookingsApi } from '../api/bookings';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Service, Employee, CreateBookingRequest } from '../api/types';

interface AddBookingModalProps {
  services: Service[];
  employees: Employee[];
  onClose: () => void;
  onSuccess: () => void;
}

interface BookingFormState {
  serviceId: string;
  employeeId: string;
  appointmentDateTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes: string;
}

const INITIAL_FORM: BookingFormState = {
  serviceId: '',
  employeeId: '',
  appointmentDateTime: '',
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  notes: '',
};

export const AddBookingModal = ({ services, employees, onClose, onSuccess }: AddBookingModalProps) => {
  const [formData, setFormData] = useState<BookingFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const selectedService = services.find((service) => service.id === formData.serviceId);
  const computedDuration = selectedService?.duration ?? 60; // default to 60 minutes if duration missing

  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return false;
    const numeric = phone.replace(/[^\d+]/g, '');
    return numeric.length >= 7;
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};

    if (!formData.serviceId) {
      newErrors.serviceId = 'Service is required';
    }
    if (!formData.employeeId) {
      newErrors.employeeId = 'Employee is required';
    }
    if (!formData.appointmentDateTime) {
      newErrors.appointmentDateTime = 'Date and time are required';
    }
    if (!validatePhone(formData.customerPhone)) {
      newErrors.customerPhone = 'Customer phone is required';
    }
    if (formData.customerEmail && !validateEmail(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }

    const startDate = formData.appointmentDateTime ? new Date(formData.appointmentDateTime) : null;
    if (startDate && !isValid(startDate)) {
      newErrors.appointmentDateTime = 'Please provide a valid date and time';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!startDate) {
      toast.error('Please select a valid appointment date and time');
      return;
    }

    const endDate = addMinutes(startDate, computedDuration);

    const payload: CreateBookingRequest = {
      serviceId: formData.serviceId,
      employeeId: formData.employeeId,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      customerName: formData.customerName || undefined,
      customerEmail: formData.customerEmail || undefined,
      customerPhone: formData.customerPhone,
      notes: formData.notes || undefined,
    };

    setLoading(true);
    try {
      await bookingsApi.create(payload);
      toast.success('Booking created successfully!');
      resetForm();
      onSuccess();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof BookingFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Calendar Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => handleChange('customerName', e.target.value)}
                placeholder="Jane Doe"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Customer Phone *</Label>
              <Input
                id="customerPhone"
                value={formData.customerPhone}
                onChange={(e) => handleChange('customerPhone', e.target.value)}
                placeholder="e.g. +1 555 123 4567"
                className={errors.customerPhone ? 'border-destructive' : ''}
                disabled={loading}
              />
              {errors.customerPhone && (
                <p className="text-sm text-destructive">{errors.customerPhone}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="serviceId">Service *</Label>
              <Select
                id="serviceId"
                value={formData.serviceId}
                onChange={(e) => handleChange('serviceId', e.target.value)}
                className={errors.serviceId ? 'border-destructive' : ''}
                disabled={loading}
              >
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                    {service.duration ? ` • ${service.duration} min` : ''}
                  </option>
                ))}
              </Select>
              {errors.serviceId && (
                <p className="text-sm text-destructive">{errors.serviceId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee *</Label>
              <Select
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) => handleChange('employeeId', e.target.value)}
                className={errors.employeeId ? 'border-destructive' : ''}
                disabled={loading}
              >
                <option value="">Select an employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </Select>
              {errors.employeeId && (
                <p className="text-sm text-destructive">{errors.employeeId}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="appointmentDateTime">Date & Time *</Label>
            <Input
              id="appointmentDateTime"
              type="datetime-local"
              value={formData.appointmentDateTime}
              onChange={(e) => handleChange('appointmentDateTime', e.target.value)}
              className={errors.appointmentDateTime ? 'border-destructive' : ''}
              disabled={loading}
            />
            {selectedService?.duration && (
              <p className="text-xs text-muted-foreground">
                Appointment will last approximately {selectedService.duration} minutes.
              </p>
            )}
            {errors.appointmentDateTime && (
              <p className="text-sm text-destructive">{errors.appointmentDateTime}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">Customer Email</Label>
            <Input
              id="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={(e) => handleChange('customerEmail', e.target.value)}
              className={errors.customerEmail ? 'border-destructive' : ''}
              placeholder="Optional"
              disabled={loading}
            />
            {errors.customerEmail && (
              <p className="text-sm text-destructive">{errors.customerEmail}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Add internal notes or special requests"
              disabled={loading}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Booking'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

