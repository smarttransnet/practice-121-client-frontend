export interface AgeInfo {
  years: number;
  months: number;
  formatted: string;
}

export function calculateAge(dobInput?: string | Date | null): AgeInfo {
  if (!dobInput) {
    return { years: 0, months: 0, formatted: '' };
  }

  const dob = typeof dobInput === 'string' ? new Date(dobInput) : dobInput;
  if (isNaN(dob.getTime())) {
    return { years: 0, months: 0, formatted: '' };
  }

  const today = new Date();
  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  const dayDiff = today.getDate() - dob.getDate();

  if (dayDiff < 0) {
    months--;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years < 0) {
    return { years: 0, months: 0, formatted: '0 mos' };
  }

  const parts: string[] = [];
  if (years > 0) {
    parts.push(`${years} yr${years > 1 ? 's' : ''}`);
  }
  if (months > 0 || years === 0) {
    parts.push(`${months} mo${months !== 1 ? 's' : ''}`);
  }

  return {
    years,
    months,
    formatted: parts.join(' '),
  };
}

export function validateChildDob(dobStr: string): { isValid: boolean; error?: string } {
  if (!dobStr || !dobStr.trim()) {
    return { isValid: false, error: 'Date of birth is required.' };
  }

  const dob = new Date(dobStr);
  if (isNaN(dob.getTime())) {
    return { isValid: false, error: 'Invalid date of birth format.' };
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (dob > today) {
    return { isValid: false, error: 'Date of birth must be in the past.' };
  }

  const age = calculateAge(dob);
  if (age.years >= 18) {
    return { isValid: false, error: 'Child patient age must be strictly under 18 years old.' };
  }

  return { isValid: true };
}
