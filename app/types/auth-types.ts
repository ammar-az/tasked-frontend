import { UserDto } from "./user-types";

export interface RegisterRequest{
    username: string;
    password: string;
}

export interface LoginRequest{
    username: string,
    password: string;
}

export interface AuthResponse{
    token: string;
    user: UserDto;
}