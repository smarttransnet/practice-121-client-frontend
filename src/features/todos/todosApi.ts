import { httpClient } from '../../api/httpClient'

export type CreateTodoForm = {
  description: string
  due_date: string | null
  labels: string[]
  is_completed: boolean
  priority: number
}

export async function createTodo(userId: string, input: CreateTodoForm) {
  const payload = {
    userId,
    description: input.description,
    dueDate: input.due_date,
    labels: input.labels,
    priority: input.priority,
    isCompleted: input.is_completed,
  }

  await httpClient.post('/todos', payload)
}

