export enum JoinPolicy{
    Open = 0,
    InviteOnly = 1,
    Closed = 2,
    ViewOnly = 3,
}

export interface ProjectDto{
    id: string;
    ownerId: string;
    ownerName: string;
    name: string;
    description: string | undefined;
    orgId: string | undefined;
    orgName: string | undefined;
    isVisible: boolean;
    joinPolicy: JoinPolicy;
    createdAt: string;
}

export interface ProjectRequest{
    name: string;
    description: string | undefined;
    org: boolean;
    isVisible: boolean;
    joinPolicy: JoinPolicy;
}

export interface ProjectUpdateRequest{
    name: string | undefined;
    description: string | undefined;
    isVisible: boolean | undefined;
    joinPolicy: JoinPolicy | undefined;
}
