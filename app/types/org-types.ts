export interface OrgDto{
    id: string;
    name: string;
}

export interface OrgsRequest{
    search: string | undefined;
    descending: boolean;
    page: number;
    pageSize: number;
}