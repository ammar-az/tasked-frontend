import type { MemberOverviewRequest} from "../types/membership-types";
import { MemberRole } from "../types/membership-types";

import type { MultiTodoRequest} from "../types/todo-types";
import { parseTodoStatus } from "./enum-helpers";

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
        owner: false,
        sort: url.searchParams.get("sort") ?? "role",
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
        sort: url.searchParams.get("sort") ?? "issueNo",
        descending: url.searchParams.get("descending") !== "false",
        page: Math.max(1, Number(url.searchParams.get("page") ?? 1)),
        pageSize: Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") ?? 20))),
    };
}