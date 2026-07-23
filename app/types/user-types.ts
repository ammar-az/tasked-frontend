
export interface UserDto{
    id: string;
    username: string;
    orgId: string | undefined;
    orgName: string | undefined;
    email: string;
}

export interface UserUpdateRequest{
    username: string | undefined;
    email: string | undefined;
}