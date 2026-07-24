export type PracticeCentreData = {
  id: string
  clinicName?: string
  districtName?: string
  mohAreaName?: string
  placeName?: string
  sessionGroups?: {
    id: string
    daysOfWeek: string[]
    timeBlocks: {
      id: string
      label?: string
      startTime: string
      endTime: string
    }[]
  }[]
}

export type DoctorProfileData = {
  accountId: string
  fullName: string
  firstName?: string
  lastName?: string
  specialty?: string
  subSpecialty?: string
  profilePictureUrl?: string
  bio?: string
  qualifications?: { name: string }[]
  telephone?: string
  socialLinks?: string[]
}

export interface DoctorSeoMetadata {
  title: string
  description: string
  canonicalUrl: string
  robots: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  ogType: string
  ogUrl: string
  twitterCard: string
}

const PLATFORM_NAME = 'Practice121'

/**
 * Strips HTML tags from rich text strings like Quill bio HTML.
 */
export function stripHtml(html?: string): string {
  if (!html) return ''
  return html.replace(/<[^>]*>?/gm, '').trim()
}

/**
 * Formats full image URL if relative.
 */
export function getFullImageUrl(url?: string | null): string {
  if (!url) return 'https://storage.googleapis.com/practice121-fe-client/assets/default-doctor.png'
  if (url.startsWith('http')) return url
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'
  return `${apiBase.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
}

/**
 * Constructs the canonical public profile URL for a doctor.
 */
export function getCanonicalProfileUrl(id: string): string {
  const origin = window.location.origin
  const pathname = window.location.pathname
  return `${origin}${pathname}#/doctor/${id}`
}

/**
 * Generates dynamic SEO & GEO metadata for Doctor Public Profile.
 */
export function buildDoctorSeoMetadata(
  id: string,
  profile: DoctorProfileData | null,
  practiceCentres: PracticeCentreData[] = []
): DoctorSeoMetadata {
  if (!profile) {
    return {
      title: `Doctor Profile | ${PLATFORM_NAME}`,
      description: `View doctor details, qualifications, practice locations, and book appointment online at ${PLATFORM_NAME}.`,
      canonicalUrl: getCanonicalProfileUrl(id),
      robots: 'index, follow',
      ogTitle: `Doctor Profile | ${PLATFORM_NAME}`,
      ogDescription: `View doctor details and book appointment online at ${PLATFORM_NAME}.`,
      ogImage: getFullImageUrl(null),
      ogType: 'profile',
      ogUrl: getCanonicalProfileUrl(id),
      twitterCard: 'summary_large_image',
    }
  }

  const doctorName = profile.fullName.trim()
  const specialty = profile.specialty ? profile.specialty.trim() : 'Medical Specialist'
  
  // Determine location string from first available practice centre
  let locationStr = ''
  if (practiceCentres.length > 0) {
    const mainCentre = practiceCentres[0]
    const area = mainCentre.mohAreaName || mainCentre.placeName || mainCentre.clinicName
    const district = mainCentre.districtName
    if (area && district) {
      locationStr = `${area}, ${district}`
    } else if (district) {
      locationStr = district
    } else if (area) {
      locationStr = area
    }
  }

  const titleLocation = locationStr ? ` in ${locationStr}` : ''
  const title = `${doctorName}, ${specialty}${titleLocation} | ${PLATFORM_NAME}`

  // Qualifications string
  const qualificationsList = profile.qualifications && profile.qualifications.length > 0
    ? profile.qualifications.map(q => q.name).join(', ')
    : ''

  // Bio clean excerpt
  const cleanBio = stripHtml(profile.bio)
  const bioExcerpt = cleanBio.length > 120 ? `${cleanBio.slice(0, 117)}...` : cleanBio

  const descriptionParts: string[] = [
    `Book an appointment online with ${doctorName}, ${specialty}${locationStr ? ` based in ${locationStr}` : ''}.`,
  ]
  if (qualificationsList) {
    descriptionParts.push(`Qualifications: ${qualificationsList}.`)
  }
  if (bioExcerpt) {
    descriptionParts.push(bioExcerpt)
  }
  descriptionParts.push(`View available sessions and book directly on ${PLATFORM_NAME}.`)

  const description = descriptionParts.join(' ')
  const canonicalUrl = getCanonicalProfileUrl(id)
  const imageUrl = getFullImageUrl(profile.profilePictureUrl)

  return {
    title,
    description,
    canonicalUrl,
    robots: 'index, follow',
    ogTitle: `${doctorName} - ${specialty} | ${PLATFORM_NAME}`,
    ogDescription: description,
    ogImage: imageUrl,
    ogType: 'profile',
    ogUrl: canonicalUrl,
    twitterCard: 'summary_large_image',
  }
}

/**
 * Builds Schema.org JSON-LD object for "Physician" entity.
 */
export function buildPhysicianJsonLd(
  id: string,
  profile: DoctorProfileData | null,
  practiceCentres: PracticeCentreData[] = []
): Record<string, unknown> | null {
  if (!profile) return null

  const canonicalUrl = getCanonicalProfileUrl(id)
  const imageUrl = getFullImageUrl(profile.profilePictureUrl)
  const cleanBio = stripHtml(profile.bio)

  // Map alumni/qualifications
  const alumniOf = profile.qualifications?.map(q => ({
    '@type': 'EducationalOrganization',
    name: q.name,
  })) || []

  // Map address / work locations from practice centres
  const workLocations = practiceCentres.map(centre => {
    return {
      '@type': 'MedicalClinic',
      name: centre.clinicName || centre.placeName || 'Medical Practice Centre',
      address: {
        '@type': 'PostalAddress',
        addressLocality: centre.mohAreaName || centre.placeName || '',
        addressRegion: centre.districtName || '',
        streetAddress: centre.placeName || centre.clinicName || '',
      },
    }
  })

  // Primary address if available
  const primaryAddress = practiceCentres.length > 0 ? {
    '@type': 'PostalAddress',
    addressLocality: practiceCentres[0].mohAreaName || practiceCentres[0].placeName || '',
    addressRegion: practiceCentres[0].districtName || '',
    streetAddress: practiceCentres[0].clinicName || practiceCentres[0].placeName || '',
  } : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: profile.fullName,
    givenName: profile.firstName,
    familyName: profile.lastName,
    jobTitle: profile.specialty || 'Physician',
    medicalSpecialty: profile.specialty || 'General Medical Practice',
    description: cleanBio || `Public doctor profile for ${profile.fullName} on ${PLATFORM_NAME}.`,
    url: canonicalUrl,
    image: imageUrl,
    telephone: profile.telephone || undefined,
    ...(primaryAddress ? { address: primaryAddress } : {}),
    ...(alumniOf.length > 0 ? { alumniOf } : {}),
    ...(workLocations.length > 0 ? { location: workLocations } : {}),
    ...(profile.socialLinks && profile.socialLinks.length > 0 ? { sameAs: profile.socialLinks } : {}),
  }
}
