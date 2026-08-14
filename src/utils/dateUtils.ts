/**
 * Date utility functions for standardizing UI display dates for Sri Lanka (DD/MM/YYYY)
 * while preserving ISO 8601 (YYYY-MM-DD) format for API payloads and internal state.
 */

/**
 * Parses a string or Date into a valid Date object.
 * Handles ISO strings ("YYYY-MM-DD", "YYYY-MM-DDTHH:mm:ssZ") and Date instances.
 */
export function parseDate(dateInput: Date | string | null | undefined): Date | null {
  if (!dateInput) return null
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput
  }

  // Handle "YYYY-MM-DD" without timezone shift by treating it as local midnight
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [year, month, day] = dateInput.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const parsed = new Date(dateInput)
  return isNaN(parsed.getTime()) ? null : parsed
}

/**
 * Formats a Date or ISO date string to standard Sri Lankan UI format: "DD/MM/YYYY" (e.g., 25/07/2026).
 */
export function formatDisplayDate(dateInput: Date | string | null | undefined): string {
  const d = parseDate(dateInput)
  if (!d) return ''

  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()

  return `${day}/${month}/${year}`
}

/**
 * Formats a Date or ISO date string to a long Sri Lankan display format: "Weekday, DD/MM/YYYY" (e.g., Saturday, 25/07/2026).
 */
export function formatDisplayDateLong(dateInput: Date | string | null | undefined): string {
  const d = parseDate(dateInput)
  if (!d) return ''

  const weekday = d.toLocaleDateString('en-LK', { weekday: 'long' })
  const formattedDate = formatDisplayDate(d)

  return `${weekday}, ${formattedDate}`
}

/**
 * Strictly formats a Date object to ISO "YYYY-MM-DD" for API requests and database queries.
 * DO NOT alter this format as backend endpoints require YYYY-MM-DD.
 */
export function formatIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * Calculates age in years from a date of birth string or Date.
 */
export function calculateAge(dateOfBirth: Date | string | null | undefined): number | null {
  const dob = parseDate(dateOfBirth)
  if (!dob) return null
  
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  
  return age
}
