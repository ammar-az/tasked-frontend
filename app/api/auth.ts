import { LoginRequest, AuthResponse, RegisterRequest } from "../types/auth-types";
import { UserDto } from "../types/user-types";
import api from "./client";

export async function registerUser(request: RegisterRequest): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/register", request);
  return response.data;
}

export async function loginUser(request: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", request);
    return response.data;
}

export async function logoutUser(): Promise<void> {
  await api.post("/auth/logout");
} 

export async function refreshSession(): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/refresh");
  return response.data;
} 

export async function getMe(): Promise<UserDto> {
  const response = await api.get<UserDto>("/auth/me");
  return response.data;
}
