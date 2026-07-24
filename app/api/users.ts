import type { MemberOverviewDto, MemberOverviewRequest } from "../types/membership-types";
import type { UserDto, UserUpdateRequest } from "../types/user-types";
import api from "./client";

export async function getUserByIdEndpoint(userId: string): Promise<UserDto> {
    const response = await api.get<UserDto>(`/users/${userId}`);
    return response.data;
}

export async function deleteUserEndpoint(): Promise<void> {
    const response = await api.delete("/users");
    console.log(response.data);
    return;
}

export async function updateUserEndpoint(request: UserUpdateRequest): Promise<UserDto> {
    const response = await api.patch<UserDto>("/users", request);
    return response.data;
}

export async function getUserProjectsEndpoint(userId: string, request: MemberOverviewRequest): Promise<Array<MemberOverviewDto>>{
    const response = await api.get<Array<MemberOverviewDto>>(`/users/${userId}/projects/`, {params: request});
    return response.data;
}
