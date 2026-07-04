import { httpClient } from './httpClient'

export type ExampleItem = {
  id: number
  title: string
}

// Example typed GET call. Replace the path with your real API endpoint.
export async function fetchExampleItems() {
  const response = await httpClient.get<ExampleItem[]>('/example-items')
  return response.data
}

