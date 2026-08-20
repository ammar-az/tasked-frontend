export enum MemberRole{
    Owner = 0,
    Admin = 1,
    Contributor = 2,
    Viewer = 3,
    Banned = 4,
    Invited = 5
}

export enum MemberSort{
    Name = 0,
    Role = 1,
    Time = 2
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
    projectSlug: string;
    projectDesc: string | undefined;
    role: MemberRole;
    orgId: string | undefined;
    orgname: string | undefined;
}

export interface MemberOverviewRequest{
    search: string | undefined;
    role: MemberRole | undefined;
    roleMin: boolean;
    sortBy: MemberSort | undefined;
    descending: boolean;
    page: number;
    pageSize: number;
}

export interface MemberRoleChangeRequest{
    user: string;
    role: MemberRole;
}
