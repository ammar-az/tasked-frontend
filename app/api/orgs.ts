import type { OrgDto, OrgsRequest } from "../types/org-types";
import { ProjectDto } from "../types/project-types";
import { UserDto } from "../types/user-types";
import api from "./client";

//endpoint actually returns CreatedAtAction
export async function createOrgEndpoint(name: string): Promise<OrgDto>{
  const response = await api.post<OrgDto>("/orgs", name);
  console.log(response.headers);
  return response.data;
}

export async function joinOrgEndpoint(orgId: string): Promise<void>{
  await api.patch<OrgDto>(`/orgs/${orgId}/join`);
}

export async function leaveOrgEndpoint(orgId: string): Promise<void>{
  await api.patch<OrgDto>(`/orgs/${orgId}/leave`);
}

export async function getOrgByIdEndpoint(orgId:string): Promise<OrgDto>{
  const response = await api.get<OrgDto>(`/orgs/id/${orgId}/`);
  return response.data;
}

export async function getOrgByNameEndpoint(orgName:string): Promise<OrgDto>{
  const response = await api.get<OrgDto>(`/orgs/${orgName}/`);
  return response.data;
}

export async function getOrgsEndpoint(request: OrgsRequest): Promise<Array<OrgDto>>{
  const response = await api.get<Array<OrgDto>>("/orgs", {params: request});
  return response.data;
}

export async function getOrgUsersEndpoint(orgId: string, request: OrgsRequest): Promise<Array<UserDto>>{
  const response = await api.get<Array<UserDto>>(`/orgs/${orgId}/users`, {params: request});
  return response.data;
}

export async function getOrgProjectsEndpoint(orgId: string, request: OrgsRequest): Promise<Array<ProjectDto>>{
  const response = await api.get<Array<ProjectDto>>(`/orgs/${orgId}/projects`, {params: request});
  return response.data;
}