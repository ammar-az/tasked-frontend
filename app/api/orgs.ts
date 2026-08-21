import type { OrgDto, OrgsRequest } from "../types/org-types";
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

export async function getOrgEndpoint(orgId:string): Promise<OrgDto>{
  const response = await api.get<OrgDto>(`/orgs/${orgId}/`);
  return response.data;
}

export async function getOrgsEndpoint(request: OrgsRequest): Promise<Array<OrgDto>>{
  const response = await api.get<Array<OrgDto>>("/orgs", {params: request});
  return response.data;
}