import type { MemberOverviewRequest} from "../types/membership-types";
import { MemberRole } from "../types/membership-types";

import { TodoSort, type MultiTodoRequest} from "../types/todo-types";
import { parseMemberSort, parseTodoSort, parseTodoStatus } from "./enum-helpers";

export type PublicProfileView =
    | "owned"
    | "memberships";

export type AccountProfileView =
    | PublicProfileView
    | "tasks"
    | "invites";


export function getPublicProfileView(
    url: URL,
): PublicProfileView {
    return url.searchParams.get("view") === "memberships"
        ? "memberships"
        : "owned";
}

export function getAccountProfileView(
    url: URL,
): AccountProfileView {
    const view = url.searchParams.get("view");

    switch (view) {
        case "memberships":
        case "tasks":
        case "invites":
            return view;

        default:
            return "owned";
    }
}

export function createMemberRequest(
    url: URL,
    role?: MemberRole,
): MemberOverviewRequest {
    return {
        search: url.searchParams.get("search")?.trim() || undefined,
        role,
        roleMin: false,
        sortBy: parseMemberSort(url.searchParams.get("sort") ?? "name",),
        descending: url.searchParams.get("descending") !== "false",
        page: Math.max(1, Number(url.searchParams.get("page") ?? 1)),
        pageSize: Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") ?? 20))),
    };
}

export function createTodoRequest(
    url: URL,
): MultiTodoRequest {
    return {
        search: url.searchParams.get("search")?.trim() || undefined,
        status: parseTodoStatus(url.searchParams.get("status")),
        assigned: url.searchParams.get("assigned")?.trim() || undefined,
        sortBy: parseTodoSort(url.searchParams.get("sort")) ?? TodoSort.IssueNo,
        descending: url.searchParams.get("descending") !== "false",
        page: Math.max(1, Number(url.searchParams.get("page") ?? 1)),
        pageSize: Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") ?? 20))),
    };
}