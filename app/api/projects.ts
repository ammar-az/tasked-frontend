import type { MemberDto, MemberOverviewRequest, MemberRoleChangeRequest } from "../types/membership-types";
import type { ProjectDto, ProjectRequest, ProjectUpdateRequest } from "../types/project-types";
import type { MultiTodoRequest, TodoDto } from "../types/todo-types";
import api from "./client";

//endpoint actually returns CreatedAtAction
export async function createProjectEndpoint(request: ProjectRequest): Promise<ProjectDto>{
  const response = await api.post<ProjectDto>("/projects", request);
  console.log(response.headers);
  return response.data;
}

export async function getProjectEndpoint(projectId: string): Promise<ProjectDto> {
  const response = await api.get<ProjectDto>(`/projects/${projectId}`);
  return response.data;
}

export async function editProjectEndpoint(projectId: string, request: ProjectUpdateRequest): Promise<ProjectDto>{
  const response = await api.patch<ProjectDto>(`/projects/${projectId}`, request);
  return response.data
}

export async function deleteProjectEndpoint(projectId: string): Promise<void>{
  await api.delete(`/projects/${projectId}`);
}

//endpoint actually returns CreatedAtAction
export async function joinEndpoint(projectId: string): Promise<MemberDto>{
  const response = await api.post<MemberDto>(`/projects/${projectId}/join`);
  return response.data;
}

export async function leaveEndpoint(projectId: string): Promise<void>{
  await api.delete(`/projects/${projectId}/leave`);
}

//endpoint actually returns CreatedAtAction
export async function inviteEndpoint(projectId: string, userId: string): Promise<MemberDto>{
  const response = await api.post<MemberDto>(`/projects/${projectId}/invite/${userId}`);
  return response.data;
}

export async function rejectEndpoint(projectId: string): Promise<void>{
  await api.delete<MemberDto>(`/projects/${projectId}/reject`);
}

export async function getMembersEndpoint(projectId: string, request: MemberOverviewRequest): Promise<Array<MemberDto>>{
  const response = await api.get<Array<MemberDto>>(`/projects/${projectId}/members`, {params: request});
  return response.data;
}

export async function getProjectTodosEndpoint(projectId: string, request: MultiTodoRequest): Promise<Array<TodoDto>>{
  const response = await api.get<Array<TodoDto>>(`/projects/${projectId}/todos`, {params: request});
  return response.data;
}

export async function roleChangeEndpoint(projectId:string, request: MemberRoleChangeRequest): Promise<MemberDto>{
  const response = await api.patch<MemberDto>(`/projects/${projectId}/members`, request);
  return response.data;
}

export async function banEndpoint(projectId: string, userId: string): Promise<MemberDto>{
  const response = await api.delete<MemberDto>(`/projects/${projectId}/ban/${userId}`);
  return response.data;
}

export async function transferEndpoint(projectId: string, userId: string): Promise<ProjectDto>{
  const response = await api.patch<ProjectDto>(`/projects/${projectId}/transfer/${userId}`);
  return response.data;
}

export async function projectToOrgEndpoint(projectId: string): Promise<ProjectDto>{
  const response = await api.patch<ProjectDto>(`/projects/${projectId}/org`);
  return response.data;
}

export async function projectLeaveOrgEndpoint(projectId: string): Promise<ProjectDto>{
  const response = await api.patch<ProjectDto>(`/projects/${projectId}/org/remove`);
  return response.data;
}