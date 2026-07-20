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
