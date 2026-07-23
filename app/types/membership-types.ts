export enum MemberRole{
    Owner = 0,
    Admin = 1,
    Contributor = 2,
    Viewer = 3,
    Banned = 4,
    Invited = 5
}

export interface MemberDto{
    userId: string;
    username: string;
    projectId: string;
    projectName: string;
    role: MemberRole;
    joinTime: string;
    orgId: string | undefined;
    orgname: string | undefined;
}

export interface MemberOverviewDto{
    projectId: string;
    projectName: string;
    role: MemberRole;
    description: string | undefined;
    orgId: string | undefined;
    orgname: string | undefined;
}

export interface MemberOverviewRequest{
    search: string | undefined;
    role: MemberRole | undefined;
    owner: boolean | undefined;
    sort: string;
    descending: boolean;
    page: number;
    pageSize: number;
}

export interface MemberRoleChangeRequest{
    userId: string;
    role: MemberRole;
}