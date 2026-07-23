import type { TodoDto, TodoRequest, TodoUpdateRequest } from "../types/todo-types";
import api from "./client";

//endpoint actually returns CreatedAtAction
export async function createTodoEndpoint(projectId: string, request: TodoRequest): Promise<TodoDto>{
  const response = await api.post<TodoDto>(`/todos/project/${projectId}`, request);
  console.log(response.headers);
  return response.data;
}

export async function getTodoEndpoint(todoId: string): Promise<TodoDto>{
  const response = await api.get<TodoDto>(`/todos/${todoId}`);
  return response.data;
}

export async function deleteTodoEndpoint(todoId: string): Promise<void>{
  await api.delete(`/todos/${todoId}`);
}

export async function updateTodoEndpoint(todoId: string, request: TodoUpdateRequest): Promise<TodoDto>{
  const response = await api.patch<TodoDto>(`/todos/${todoId}`, request);
  return response.data;
}

export async function assignTodoEndpoint(todoId:string, userId: string): Promise<TodoDto>{
  const response = await api.patch<TodoDto>(`/todos/${todoId}/assign/${userId}`);
  return response.data;
}
