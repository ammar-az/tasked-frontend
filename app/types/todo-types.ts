export enum TodoStatus{
    Backlog = 0,
    InProgress = 1,
    Completed = 2,
    Archived = 3
}

export enum TodoSort{
    IssueNo = 0,
    Title = 1,
    Status = 2
}

export interface TodoDto{
    id: string;
    projectId: string;
    projectName: string;
    projectSlug: string;
    title: string;
    description: string | undefined;
    status: TodoStatus;
    assigned: string | undefined;
    assignedName: string | undefined;
    createdBy: string | undefined;
    createdByName: string | undefined;
    createdAt: string;
    issueNo: number;
}

export interface TodoRequest{
    title: string;
    description: string | undefined;
    status: TodoStatus;
    selfAssign: boolean;
}

export interface TodoUpdateRequest{
    title: string | undefined;
    description: string | undefined;
    status: TodoStatus | undefined;
    assigned: string | undefined;
    unassign: boolean;
}

export interface MultiTodoRequest{
    search: string | undefined;
    status: TodoStatus | undefined;
    assigned: string | undefined;
    sortBy: TodoSort;
    descending: boolean;
    page: number;
    pageSize: number;
}
