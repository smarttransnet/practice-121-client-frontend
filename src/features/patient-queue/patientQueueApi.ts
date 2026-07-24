import { httpClient } from '../../api/httpClient';

export interface PatientQueueTicket {
  id: string;
  queueNumber: number;
  queueOrder: number;
  patientMobile: string;
  patientName: string;
  doctorId: string;
  practiceCentreId: string;
  visitDate: string;
  status: number; // PatientQueueStatus
  priority: number; // PatientQueuePriority
  createdAt: string;
  calledAt?: string;
  completedAt?: string;
}

export interface Patient {
  id: string;
  nicNumber?: string;
  firstName: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  mobileNumber: string;
  parentId?: string;
}

export interface PatientLookupResponse {
  primaryPatient: Patient;
  children: Patient[];
}

export const getPatientQueue = async (
  practiceCentreId: string,
  doctorId?: string,
  visitDate?: string
): Promise<PatientQueueTicket[]> => {
  let url = `/api/patient-queue?practiceCentreId=${practiceCentreId}`;
  if (doctorId) {
    url += `&doctorId=${doctorId}`;
  }
  if (visitDate) {
    url += `&visitDate=${visitDate}`;
  }

  const response = await httpClient.get<PatientQueueTicket[]>(url);
  return response.data;
};

export const addPatientQueueTicket = async (data: {
  patientMobile: string;
  doctorId: string;
  practiceCentreId: string;
  priority: number;
  visitDate?: string;
  patientId?: string;
}): Promise<string> => {
  const response = await httpClient.post<string>('/api/patient-queue', data);
  return response.data;
};

export const updatePatientQueueTicketStatus = async (
  ticketId: string,
  status: number
): Promise<void> => {
  await httpClient.put(`/api/patient-queue/${ticketId}/status`, { status });
};

export const reorderPatientQueue = async (ticketIds: string[]): Promise<void> => {
  await httpClient.put('/api/patient-queue/reorder', { ticketIds });
};

export const getPatientByMobile = async (mobileNumber: string): Promise<PatientLookupResponse | null> => {
  try {
    const response = await httpClient.get<PatientLookupResponse>(`/api/patients/by-mobile?mobileNumber=${encodeURIComponent(mobileNumber)}`);
    return response.data;
  } catch (err: any) {
    if (err.response?.status === 404) {
      return null;
    }
    throw err;
  }
};

export const searchPatients = async (params: {
  firstName?: string;
  lastName?: string;
  nicNumber?: string;
}): Promise<Patient[]> => {
  const queryParts: string[] = [];
  if (params.firstName) queryParts.push(`firstName=${encodeURIComponent(params.firstName)}`);
  if (params.lastName) queryParts.push(`lastName=${encodeURIComponent(params.lastName)}`);
  if (params.nicNumber) queryParts.push(`nicNumber=${encodeURIComponent(params.nicNumber)}`);

  const response = await httpClient.get<Patient[]>(`/api/patients/search?${queryParts.join('&')}`);
  return response.data;
};

export const updatePatientMobile = async (patientId: string, mobileNumber: string): Promise<void> => {
  await httpClient.put(`/api/patients/${patientId}/mobile`, { mobileNumber });
};
