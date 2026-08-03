import { httpClient } from './httpClient'

export interface FavoriteMedicine {
  id: string
  genericName: string
  brandName?: string
  category: string
  dose?: string
  frequency?: string
  duration?: string
  doctorSpecialty?: string
  createdAt: string
}

export interface FavoriteMedicinePayload {
  genericName?: string
  brandName?: string
  category?: string
  dose?: string
  frequency?: string
  duration?: string
}

export interface FavoriteSuggestion {
  genericName?: string
  brandName?: string
  category?: string
  dose?: string
  frequency?: string
  duration?: string
  doctorSpecialty?: string
  usageCount: number
}

export const fetchFavorites = async (): Promise<FavoriteMedicine[]> => {
  const { data } = await httpClient.get<FavoriteMedicine[]>('/api/favorites')
  return data
}

export const createFavorite = async (request: FavoriteMedicinePayload): Promise<string> => {
  const { data } = await httpClient.post<string>('/api/favorites', request)
  return data
}

export const bulkCreateFavorites = async (medicines: FavoriteMedicinePayload[]): Promise<number> => {
  const { data } = await httpClient.post<number>('/api/favorites/bulk', { medicines })
  return data
}

export const updateFavorite = async (id: string, request: FavoriteMedicinePayload): Promise<void> => {
  await httpClient.put(`/api/favorites/${id}`, request)
}

export const deleteFavorite = async (id: string): Promise<void> => {
  await httpClient.delete(`/api/favorites/${id}`)
}

export const fetchSmartSuggestions = async (query?: string): Promise<FavoriteSuggestion[]> => {
  const { data } = await httpClient.get<FavoriteSuggestion[]>('/api/favorites/suggestions', {
    params: { query }
  })
  return data
}
