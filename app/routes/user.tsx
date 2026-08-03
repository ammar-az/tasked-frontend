import type { Route } from "./+types/user";

import ProfilePage, {
    type ProfilePageData,
} from "../components/profile-page";

import {
    getUserByNameEndpoint,
    getUserProjectsEndpoint,
} from "../api/users";

import { MemberRole } from "../types/membership-types";

import { createMemberRequest, getPublicProfileView } from "../utils/profile-loader-helpers";

export async function clientLoader({
    params,
    request,
}: Route.ClientLoaderArgs): Promise<ProfilePageData> {
    if (!params.username) {
        throw new Response("User ID is required", {
            status: 400,
        });
    }

    const url = new URL(request.url);
    const activeView = getPublicProfileView(url);

    const user = await getUserByNameEndpoint(
        params.username,
    );

    const memberRequest = createMemberRequest(
        url,
        activeView === "owned"
            ? MemberRole.Owner
            : undefined,
    );

    const projects = await getUserProjectsEndpoint(
        user.id,
        memberRequest,
    );
    return {
        user: {
            username: user.username,
            organizationName: user.orgName,
        },

        ownedProjects: projects,

        memberships: projects,

        assignedTasks: [],
        invites: [],

        // Replace with the real permission check later.
        canInviteToProject: true,
    };
}

export default function UserPage({
    loaderData,
}: Route.ComponentProps) {
    return (
        <ProfilePage
            data={loaderData}
            isOwnProfile={false}
        />
    );
}