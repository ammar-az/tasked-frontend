
export interface UserDto{
    id: string;
    username: string;
    orgId: string | undefined;
    orgName: string | undefined;
}

export interface UserUpdateRequest{
    username: string | undefined;
}
