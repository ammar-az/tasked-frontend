import type { Route } from "./+types/user";

import ProfilePage, {
    type ProfilePageData,
} from "../components/profile-page";

export async function clientLoader({
    params,
}: Route.ClientLoaderArgs): Promise<ProfilePageData> {
    if (!params.username) {
        throw new Response("Username is required", {
            status: 400,
        });
    }

    /*
     * Replace this return value with:
     *
     * const user = await getUserByUsernameEndpoint(params.username);
     * const ownedProjects = await ...;
     * const memberships = await ...;
     *
     * Keep the returned shape matching ProfilePageData.
     */

    return {
        user: {
            username: params.username,
            organizationName: "Organization name",
        },

        ownedProjects: [
            {
                id: "placeholder-owned-project",
                name: "Owned project",
                description:
                    "A placeholder project description shown until the project endpoint is connected.",
                organizationName: "Organization name",
                role: "Owner",
            },
        ],

        memberships: [
            {
                id: "placeholder-membership",
                name: "Project membership",
                description:
                    "A placeholder membership shown until the project endpoint is connected.",
                organizationName: "Organization name",
                role: "Contributor",
            },
        ],

        assignedTasks: [],
        invites: [],

        // Replace this with a real permission check.
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