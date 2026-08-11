import type { Route } from "./+types/account";

import ProfilePage, {
    type ProfilePageData,
} from "../components/profile-page";

import { getMe } from "../api/auth";
import {
    getUserProjectsEndpoint,
    getUserTodosEndpoint,
} from "../api/users";

import { MemberRole } from "../types/membership-types";

import { createMemberRequest, createTodoRequest, getAccountProfileView } from "../utils/profile-loader-helpers";
import { redirect } from "react-router";

export async function clientLoader({
    request,
}: Route.ClientLoaderArgs): Promise<ProfilePageData> {
    const url = new URL(request.url);
    const activeView = getAccountProfileView(url);

    var user = null;
    
    try{
        user = await getMe();
    }catch{
        throw redirect("/login");
    }

    if (activeView === "tasks") {
        const todoRequest = createTodoRequest(url);

        const [user, todos] = await Promise.all([
            getMe(),
            getUserTodosEndpoint(todoRequest),
        ]);

        return {
            user,
            ownedProjects: [],
            memberships: [],
            assignedTasks: todos,
            invites: [],
        };
    }

    const requestedRole =
        activeView === "owned"
            ? MemberRole.Owner
            : activeView === "invites"
              ? MemberRole.Invited
              : undefined;

    const memberRequest = createMemberRequest(
        url,
        requestedRole,
    );

    const projects = await getUserProjectsEndpoint(
        user.id,
        memberRequest,
    );

    const baseData = {
        user,

        ownedProjects: [],
        memberships: [],
        assignedTasks: [],
        invites: [],
    } satisfies ProfilePageData;

    switch (activeView) {
        case "memberships":
            return {
                ...baseData,
                memberships: projects,
            };

        case "invites":
            return {
                ...baseData,
                invites: projects,
            };

        case "owned":
        default:
            return {
                ...baseData,
                ownedProjects: projects,
            };
    }
}

export default function AccountPage({
    loaderData,
}: Route.ComponentProps) {
    return (
        <ProfilePage
            data={loaderData}
            isOwnProfile
        />
    );
}