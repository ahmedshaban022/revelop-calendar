import { useMemo, useState, useEffect } from 'react';
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

const formatPhoneNumber = (phone?: string) => {
  if (!phone) return '—';
  const cleaned = phone.replace(/[^\d]/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

const eventCard = (title: string, subtitle?: string, note?: string) => {
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-0.5';

  const titleEl = document.createElement('p');
  titleEl.className = 'text-xs font-semibold text-white';
  titleEl.textContent = title;
  container.appendChild(titleEl);

  if (subtitle) {
    const subtitleEl = document.createElement('p');
    subtitleEl.className = 'text-[10px] text-white/80';
    subtitleEl.textContent = subtitle;
    container.appendChild(subtitleEl);
  }

  if (note) {
    const noteEl = document.createElement('p');
    noteEl.className = 'text-[10px] text-white/70';
    noteEl.textContent = note;
    container.appendChild(noteEl);
  }

  return container;
};

const resourceLabel = (name: string, photo?: string, email?: string) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex items-center gap-2';

  if (photo) {
    const img = document.createElement('img');
    img.src = photo;
    img.alt = name;
    img.className = 'h-7 w-7 rounded-full object-cover shadow-sm';
    wrapper.appendChild(img);
  }

  const textWrapper = document.createElement('div');
  textWrapper.className = 'flex flex-col';

  const nameEl = document.createElement('span');
  nameEl.textContent = name;
  nameEl.className = 'text-sm font-medium';
  textWrapper.appendChild(nameEl);

  if (email) {
    const emailEl = document.createElement('span');
    emailEl.textContent = email;
    emailEl.className = 'text-[11px] text-muted-foreground';
    textWrapper.appendChild(emailEl);
  }

  wrapper.appendChild(textWrapper);

  return wrapper;
};

export const CalendarPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { logout, user } = useAuth();

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

  const serviceMap = useMemo(() => {
    const map = new Map<string, Service>();
    services.forEach((service) => map.set(service.id, service));
    return map;
  }, [services]);

  const employeeMap = useMemo(() => {
    const map = new Map<string, Employee>();
    employees.forEach((employee) => map.set(employee.id, employee));
    return map;
  }, [employees]);

  const resources = useMemo(
    () =>
      employees.map((employee) => ({
        id: employee.id,
        title: employee.name,
        extendedProps: {
          email: employee.email,
          photo: employee.photo,
        },
      })),
    [employees]
  );

  const events = useMemo<EventInput[]>(
    () =>
      bookings.map((booking) => {
        const service = serviceMap.get(booking.serviceId);
        const employee = employeeMap.get(booking.employeeId);
        return {
          id: booking.id,
          resourceId: booking.employeeId,
          title: service?.name || 'Booking',
          start: booking.startTime,
          end: booking.endTime,
          backgroundColor: '#ec4899',
          borderColor: '#ec4899',
          extendedProps: {
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
            customerPhone: booking.customerPhone,
            serviceName: service?.name,
            employeeName: employee?.name,
          },
        };
      }),
    [bookings, serviceMap, employeeMap]
  );

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
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Calendar</h1>
          <p className="text-sm text-muted-foreground">
            Logged in as {user?.name ?? user?.email ?? 'Admin'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setIsModalOpen(true)}>Add Calendar Event</Button>
          <Button onClick={logout} variant="destructive">
            Logout
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <FullCalendar
            plugins={[resourceTimeGridPlugin]}
            initialView="resourceTimeGridDay"
            schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'resourceTimeGridDay,resourceTimeGridWeek',
            }}
            resources={resources}
            events={events}
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            slotDuration="00:15:00"
            height="auto"
            resourceAreaHeaderContent="Team"
            resourceLabelContent={(arg) => {
              const { email, photo } = arg.resource.extendedProps as { email?: string; photo?: string };
              const node = resourceLabel(arg.resource.title, photo, email);
              return { domNodes: [node] };
            }}
            eventContent={(arg) => {
              const { customerName, customerPhone } = arg.event.extendedProps as {
                customerName?: string;
                customerPhone?: string;
              };
              const card = eventCard(
                arg.event.title,
                customerName ?? 'Guest',
                customerPhone ? formatPhoneNumber(customerPhone) : undefined,
              );
              return { domNodes: [card] };
            }}
          />
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Team Members</h2>
            <p className="text-sm text-muted-foreground">
              Bookings are grouped by employee. Each column in the calendar represents a team member.
            </p>
            <div className="mt-4 grid gap-3">
              {employees.length === 0 && (
                <p className="text-sm text-muted-foreground">No team members found.</p>
              )}
              {employees.map((employee) => (
                <div key={employee.id} className="flex items-center gap-3 rounded-md border bg-background p-3">
                  {employee.photo && (
                    <img
                      src={employee.photo}
                      alt={employee.name}
                      className="h-10 w-10 rounded-full object-cover shadow"
                    />
                  )}
                  <div>
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-xs text-muted-foreground">{employee.email ?? 'No email on file'}</p>
                    <p className="text-xs text-muted-foreground">{formatPhoneNumber(employee.phone)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Upcoming Bookings</h2>
            {bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No bookings yet. Create your first event!</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {bookings
                  .slice()
                  .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                  .slice(0, 5)
                  .map((booking) => {
                    const serviceName = serviceMap.get(booking.serviceId)?.name;
                    const employeeName = employeeMap.get(booking.employeeId)?.name;
                    return (
                      <li key={booking.id} className="rounded-md border bg-background p-3">
                        <p className="font-medium">{booking.customerName ?? 'Guest'}</p>
                        <p className="text-xs text-muted-foreground">
                          {serviceName ?? 'Service'} • {employeeName ?? 'Team member'}
                        </p>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
        </aside>
      </div>

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

