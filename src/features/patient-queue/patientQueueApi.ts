import { httpClient } from '../../api/httpClient';

export interface PatientQueueTicket {
  id: string;
  queueNumber: number;
  queueOrder: number;
  patientMobile: string;
  patientName: string;
  patientId?: string;
  doctorId: string;
  practiceCentreId: string;
  visitDate: string;
  sessionId?: string;
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
  sessionId?: string;
}): Promise<string> => {
  const sanitizedSessionId =
    data.sessionId && data.sessionId !== 'ALL' && data.sessionId.trim() !== ''
      ? data.sessionId
      : undefined;

  const payload = {
    ...data,
    sessionId: sanitizedSessionId,
  };

  const response = await httpClient.post<string>('/api/patient-queue', payload);
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

export interface NextPatientResponse {
  completedPatient?: PatientQueueTicket;
  activePatient?: PatientQueueTicket;
  remainingQueueCount: number;
  hasNextPatient: boolean;
}

export const advanceNextPatient = async (
  doctorId: string,
  practiceCentreId?: string,
  visitDate?: string
): Promise<NextPatientResponse> => {
  const response = await httpClient.post<NextPatientResponse>('/api/v1/queue/next-patient', {
    doctorId,
    practiceCentreId,
    visitDate,
  });
  return response.data;
};

export interface SendOtpResponse {
  patientExists: boolean;
  sessionId?: string;
  maskedMobile?: string;
  expiresInSeconds?: number;
  cooldownSeconds?: number;
}

export interface VerifyOtpResponse {
  verified: boolean;
  verificationToken?: string;
  errorMessage?: string;
}

export interface ResendOtpResponse {
  success: boolean;
  errorMessage?: string;
  cooldownSeconds?: number;
}

export const sendPatientOtp = async (mobileNumber: string): Promise<SendOtpResponse> => {
  const response = await httpClient.post<SendOtpResponse>('/api/patients/otp/send', { mobileNumber });
  return response.data;
};

export const verifyPatientOtp = async (sessionId: string, otpCode: string): Promise<VerifyOtpResponse> => {
  const response = await httpClient.post<VerifyOtpResponse>('/api/patients/otp/verify', { sessionId, otpCode });
  return response.data;
};

export const resendPatientOtp = async (sessionId: string): Promise<ResendOtpResponse> => {
  const response = await httpClient.post<ResendOtpResponse>('/api/patients/otp/resend', { sessionId });
  return response.data;
};

export const getPatientByMobile = async (
  mobileNumber: string,
  verificationToken?: string,
): Promise<PatientLookupResponse | null> => {
  try {
    let url = `/api/patients/by-mobile?mobileNumber=${encodeURIComponent(mobileNumber)}`;
    if (verificationToken) {
      url += `&verificationToken=${encodeURIComponent(verificationToken)}`;
    }
    const response = await httpClient.get<PatientLookupResponse>(url);
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
