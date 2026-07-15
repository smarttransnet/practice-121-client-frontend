import { httpClient } from './httpClient'

export interface FavoriteMedicine {
  id: string
  verifiedName: string
  category: string
  createdAt: string
}

export interface CreateFavoriteMedicineRequest {
  verifiedName: string
  category: string
}

export const fetchFavorites = async (): Promise<FavoriteMedicine[]> => {
  const { data } = await httpClient.get<FavoriteMedicine[]>('/api/favorites')
  return data
}

export const createFavorite = async (request: CreateFavoriteMedicineRequest): Promise<string> => {
  const { data } = await httpClient.post<string>('/api/favorites', request)
  return data
}

export const bulkCreateFavorites = async (medicines: CreateFavoriteMedicineRequest[]): Promise<number> => {
  const { data } = await httpClient.post<number>('/api/favorites/bulk', { medicines })
  return data
}

export const updateFavorite = async (id: string, request: CreateFavoriteMedicineRequest): Promise<void> => {
  await httpClient.put(`/api/favorites/${id}`, request)
}

export const deleteFavorite = async (id: string): Promise<void> => {
  await httpClient.delete(`/api/favorites/${id}`)
}
