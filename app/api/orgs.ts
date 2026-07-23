import type { OrgDto } from "../types/org-types";
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