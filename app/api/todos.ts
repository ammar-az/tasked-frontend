import type { TodoAssignRequest, TodoDto, TodoRequest, TodoUpdateRequest } from "../types/todo-types";
import api from "./client";

export async function createTodoEndpoint(projectSlug: string, request: TodoRequest): Promise<number>{
  const response = await api.post<number>(`/todos/project/${projectSlug}`, request);
  return response.data;
}

export async function getTodoEndpoint(todoId: string): Promise<TodoDto>{
  const response = await api.get<TodoDto>(`/todos/${todoId}`);
  return response.data;
}

export async function getTodoByNoEndpoint(projectSlug: string, issueNo: number): Promise<TodoDto>{
  const response = await api.get<TodoDto>(`/todos/project/${projectSlug}/${issueNo}`);
  return response.data;
}

export async function deleteTodoEndpoint(todoId: string): Promise<void>{
  await api.delete(`/todos/${todoId}`);
}

export async function updateTodoEndpoint(todoId: string, request: TodoUpdateRequest): Promise<TodoDto>{
  const response = await api.patch<TodoDto>(`/todos/${todoId}`, request);
  return response.data;
}

export async function assignTodoEndpoint(todoId:string, request: TodoAssignRequest): Promise<TodoDto>{
  const response = await api.patch<TodoDto>(`/todos/assign/${todoId}`, request);
  return response.data;
}
