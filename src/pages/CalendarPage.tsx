import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import { toast } from 'sonner';
import { servicesApi } from '../api/services';
import { employeesApi } from '../api/employees';
import { bookingsApi } from '../api/bookings';
import { useAuth } from '../contexts/AuthContext';
import { AddBookingModal } from '../components/AddBookingModal';
import { Button } from '@/components/ui/button';
import type { Service, Employee, Booking } from '../api/types';
import type { EventInput } from '@fullcalendar/core';

export const CalendarPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { logout } = useAuth();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [servicesData, employeesData, bookingsData] = await Promise.all([
        servicesApi.getAll(),
        employeesApi.getAll(),
        bookingsApi.getAll(),
      ]);
      setServices(servicesData);
      setEmployees(employeesData);
      setBookings(bookingsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      toast.error(`Error loading data: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookingAdded = () => {
    fetchData();
    setIsModalOpen(false);
  };

  // Convert employees to FullCalendar resources
  const resources = employees.map((employee) => ({
    id: employee.id,
    title: employee.name,
  }));

  // Convert bookings to FullCalendar events
  const events: EventInput[] = bookings.map((booking) => {
    const service = services.find((s) => s.id === booking.serviceId);
    return {
      id: booking.id,
      resourceId: booking.employeeId,
      title: service?.name || 'Booking',
      start: booking.startTime,
      end: booking.endTime,
      extendedProps: {
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        notes: booking.notes,
      },
    };
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading calendar...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="mb-4 text-destructive">Error: {error}</div>
        <Button onClick={fetchData}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsModalOpen(true)}>
            Add Calendar Event
          </Button>
          <Button onClick={logout} variant="destructive">
            Logout
          </Button>
        </div>
      </div>
      <FullCalendar
        plugins={[resourceTimeGridPlugin]}
        initialView="resourceTimeGridDay"
        resources={resources}
        events={events}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'resourceTimeGridDay,resourceTimeGridWeek'
        }}
        height="auto"
      />
      {isModalOpen && (
        <AddBookingModal
          services={services}
          employees={employees}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleBookingAdded}
        />
      )}
    </div>
  );
};

