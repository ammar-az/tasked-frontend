import { MemberRole } from "../types/membership-types";
import { TodoStatus } from "../types/todo-types";

export function parseTodoStatus(value: string | null): TodoStatus | undefined {
    if (value === null) return undefined;
    
    const parsed = Number(value);

    return Object.values(TodoStatus).includes(parsed)
        ? (parsed as TodoStatus)
        : undefined;
}

export function getTodoStatusLabel(status: TodoStatus) {
    switch (status) {
        case TodoStatus.Backlog:
            return "Backlog";

        case TodoStatus.InProgress:
            return "In Progress";

        case TodoStatus.Completed:
            return "Completed";

        case TodoStatus.Archived:
            return "Archived";

        default:
            return "Unknown";
    }
}

export function parseMemberRole(
    value: string | null,
): MemberRole | undefined {
    if (value === null || value === "") {
        return undefined;
    }

    const parsed = Number(value);

    return Object.values(MemberRole).includes(parsed as MemberRole)
        ? (parsed as MemberRole)
        : undefined;
}

export function getMemberRoleLabel(role: MemberRole) {
    switch (role) {
        case MemberRole.Owner:
            return "Owner";

        case MemberRole.Admin:
            return "Admin";

        case MemberRole.Contributor:
            return "Contributor";

        case MemberRole.Viewer:
            return "Viewer";

        case MemberRole.Banned:
            return "Banned";

        case MemberRole.Invited:
            return "Invited";

        default:
            return "Unknown";
    }
}

export function isMember(role: MemberRole): boolean{
    return(role !== undefined && role !== MemberRole.Banned && role !== MemberRole.Invited);
}

export function isAdmin(role: MemberRole): boolean{
        return(role === MemberRole.Owner || role === MemberRole.Admin);
}

export function canContribute(role: MemberRole): boolean{
        return(role === MemberRole.Owner || role === MemberRole.Admin || role === MemberRole.Contributor);
}