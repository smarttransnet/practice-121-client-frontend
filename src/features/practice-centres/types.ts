export interface PracticeCentre {
  id?: string
  placeName: string
  mohArea: string
  district: string
  clinicName: string
  maxPatients?: number
  sessionGroups: SessionGroup[]
  nurses: Nurse[]
}

export interface SessionGroup {
  id?: string
  daysOfWeek: string[] // e.g. ["MON", "WED"]
  timeBlocks: TimeBlock[]
}

export interface TimeBlock {
  id?: string
  label: string
  startTime: string // "HH:mm"
  endTime: string // "HH:mm"
}

export interface Nurse {
  id?: string
  name: string
  phoneNumber: string
  isActive: boolean
}
