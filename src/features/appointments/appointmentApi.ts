const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000';

export interface DayAvailability {
  date: string;          // YYYY-MM-DD
  totalSlots: number | null;
  bookedCount: number;
  isFull: boolean;
}

export interface BookAppointmentResult {
  ticketId: string;
  queueNumber: number;
  visitDate: string;     // YYYY-MM-DD
}

export const getCentreAvailability = async (
  doctorAccountId: string,
  centreId: string,
): Promise<DayAvailability[]> => {
  const today = new Date();
  const from = formatDateLocal(today);
  const toDate = new Date(today);
  toDate.setDate(today.getDate() + 27);
  const to = formatDateLocal(toDate);

  const res = await fetch(
    `${API_BASE}/api/public/doctors/${doctorAccountId}/practice-centres/${centreId}/availability?from=${from}&to=${to}`,
  );
  if (!res.ok) {
    throw new Error('Failed to load availability');
  }
  return res.json();
};

export const bookAppointment = async (data: {
  patientMobile: string;
  doctorAccountId: string;
  practiceCentreId: string;
  visitDate: string; // YYYY-MM-DD
  patientId?: string;
}): Promise<BookAppointmentResult> => {
  const res = await fetch(`${API_BASE}/api/public/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientMobile: data.patientMobile,
      doctorAccountId: data.doctorAccountId,
      practiceCentreId: data.practiceCentreId,
      visitDate: data.visitDate,
      patientId: data.patientId,
    }),
  });

  if (!res.ok) {
    let errorDetail = 'Failed to book appointment';
    try {
      const errorBody = await res.json();
      errorDetail = errorBody.detail || errorBody.title || errorDetail;
    } catch (_) {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return res.json();
};

export const getPatientByMobilePublic = async (
  mobileNumber: string,
): Promise<{
  primaryPatient: { id: string; firstName: string; lastName?: string; nicNumber?: string; dateOfBirth?: string; gender?: string; mobileNumber: string; parentId?: string };
  children: { id: string; firstName: string; lastName?: string; nicNumber?: string; dateOfBirth?: string; gender?: string; mobileNumber: string; parentId?: string }[];
} | null> => {
  const res = await fetch(
    `${API_BASE}/api/patients/by-mobile?mobileNumber=${encodeURIComponent(mobileNumber)}`,
  );
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error('Failed to search patient');
  }
  return res.json();
};

export const searchPatientsPublic = async (params: {
  firstName?: string;
  lastName?: string;
  nicNumber?: string;
}): Promise<{ id: string; firstName: string; lastName?: string; nicNumber: string; mobileNumber: string }[]> => {
  const parts: string[] = [];
  if (params.firstName) {
    parts.push(`firstName=${encodeURIComponent(params.firstName)}`);
  }
  if (params.lastName) {
    parts.push(`lastName=${encodeURIComponent(params.lastName)}`);
  }
  if (params.nicNumber) {
    parts.push(`nicNumber=${encodeURIComponent(params.nicNumber)}`);
  }
  const res = await fetch(`${API_BASE}/api/patients/search?${parts.join('&')}`);
  if (!res.ok) {
    throw new Error('Failed to search patients');
  }
  return res.json();
};

function formatDateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
