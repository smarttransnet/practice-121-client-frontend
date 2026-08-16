export interface PracticeCentre {
  id?: string
  placeId?: string
  placeName: string
  mohArea: string
  mohAreaId?: string
  isNewPlace?: boolean
  district: string
  clinicName: string
  maxPatients?: number
  sessionGroups: SessionGroup[]
  nurses: Nurse[]
}

export interface SessionGroup {
  id?: string
  daysOfWeek: string[] // e.g. ["MON", "WED"]
  specificDates?: string[] // e.g. ["YYYY-MM-DD"]
  timeBlocks: TimeBlock[]
  daysOff?: string[] // "YYYY-MM-DD"
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
