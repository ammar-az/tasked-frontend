export enum TodoStatus{
    Backlog = 0,
    InProgress = 1,
    Completed = 2,
    Archived = 3
}

export interface TodoDto{
    id: string;
    projectId: string;
    projectName: string;
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
    assigned: string;
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
    sort: string;
    descending: boolean;
    page: number;
    pageSize: number;
}
