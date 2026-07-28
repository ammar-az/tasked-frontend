import type { Route } from "./+types/account";

import ProfilePage, {
    type ProfilePageData,
} from "../components/profile-page";

export async function clientLoader(): Promise<ProfilePageData> {
    /*
     * Replace this return value with:
     *
     * const user = await getMeEndpoint();
     * const ownedProjects = await ...;
     * const memberships = await ...;
     * const assignedTasks = await ...;
     * const invites = await ...;
     */

    return {
        user: {
            username: "Current user",
            organizationName: "Organization name",
        },

        ownedProjects: [
            {
                id: "placeholder-owned-project",
                name: "Owned project",
                description:
                    "A placeholder owned project shown until the endpoint is connected.",
                organizationName: "Organization name",
                role: "Owner",
            },
        ],

        memberships: [
            {
                id: "placeholder-membership",
                name: "Project membership",
                description:
                    "A placeholder project membership shown until the endpoint is connected.",
                organizationName: "Organization name",
                role: "Contributor",
            },
        ],

        assignedTasks: [
            {
                id: "placeholder-task",
                projectId: "placeholder-project",
                projectName: "Project name",
                issueNo: 12,
                title: "Placeholder assigned task",
                status: "In Progress",
            },
        ],

        invites: [
            {
                id: "placeholder-invite",
                projectId: "placeholder-invited-project",
                projectName: "Invited project",
                invitedByUsername: "another-user",
            },
        ],
    };
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