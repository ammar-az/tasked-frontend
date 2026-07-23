import { LoginRequest, AuthResponse, RegisterRequest } from "../types/auth-types";
import { UserDto } from "../types/user-types";
import api from "./client";

export async function register(request: RegisterRequest) : Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/register", request);
  return response.data;
}

export async function login(request: LoginRequest) : Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", request);
    return response.data;
}

export async function getMe(): Promise<UserDto> {
  const response = await api.get<UserDto>("/auth/me");
  return response.data;
}