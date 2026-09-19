import { Link, useSearchParams } from "react-router";

import "./profile.css";
import { MemberOverviewDto } from "../types/membership-types";
import { TodoDto } from "../types/todo-types";
import { getMemberRoleLabel, getTodoStatusLabel } from "../utils/enum-helpers";
import { useState } from "react";
import InviteProjectModal from "./InviteModal";
import { inviteEndpoint } from "../api/projects";
import { UserDto } from "../types/user-types";

export interface ProfilePageData {
    user: UserDto;
    ownedProjects: MemberOverviewDto[];
    memberships: MemberOverviewDto[];
    assignedTasks: TodoDto[];
    invites: MemberOverviewDto[];
    canInviteToProject?: boolean;
}

type ProfileTab =
    | "owned"
    | "memberships"
    | "tasks"
    | "invites";

interface ProfilePageProps {
    data: ProfilePageData;
    isOwnProfile: boolean;
}

const publicTabs: Array<{
    id: ProfileTab;
    label: string;
}> = [
    {
        id: "owned",
        label: "Owned Projects",
    },
    {
        id: "memberships",
        label: "Project Memberships",
    },
];

const accountTabs: Array<{
    id: ProfileTab;
    label: string;
}> = [
    ...publicTabs,
    {
        id: "tasks",
        label: "Assigned Tasks",
    },
    {
        id: "invites",
        label: "Invites",
    },
];

export default function ProfilePage({
    data,
    isOwnProfile,
}: ProfilePageProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [showInvite, setShowInvite] = useState(false);

    const availableTabs = isOwnProfile
        ? accountTabs
        : publicTabs;

    const requestedTab = searchParams.get("view") as ProfileTab | null;

    const activeTab = availableTabs.some(
        (tab) => tab.id === requestedTab,
    )
        ? requestedTab!
        : "owned";

    const initials = data.user.username
        .slice(0, 2)
        .toUpperCase();

    function changeTab(tab: ProfileTab) {
        setSearchParams((current) => {
            const updated = new URLSearchParams(current);
            updated.set("view", tab);
            return updated;
        });
    }

    return (
    <main className="profile-page">
        {showInvite && (
            <InviteProjectModal
                userId={data.user.id}
                onClose={() => setShowInvite(false)}
                onInvite={async (project) => {
                    await inviteEndpoint(
                        project.projectId,
                        data.user.id,
                    );
                }}
            />
        )}

        <section className="profile-header">
            <div
                className="profile-avatar"
                aria-label={`${data.user.username}'s profile picture`}
            >
                {initials}
            </div>

            <div className="profile-identity">
                <h1>{data.user.username}</h1>

                <div className="profile-organization">
                    <span aria-hidden="true">♧</span>

                    {data.user.orgName !== null ? (
                        <Link
                            to={`/orgs/${data.user.orgName}`}
                            className="org-name"
                        >
                            {data.user.orgName}
                        </Link>
                    ) : (
                        "No organization"
                    )}
                </div>
            </div>

            <div className="profile-primary-action">
                {isOwnProfile ? (
                    <Link
                        to="/account/edit"
                        className="profile-action-button"
                    >
                        Edit Account
                    </Link>
                ) : (
                    <button
                        type="button"
                        onClick={() => setShowInvite(true)}
                        className="profile-action-button"
                        disabled={!data.canInviteToProject}
                    >
                        Invite to a Project
                    </button>
                )}
            </div>
        </section>

        <section className="profile-content">
            <nav
                className="tabs"
                aria-label="Profile sections"
            >
                {availableTabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={
                            activeTab === tab.id
                                ? "tab active"
                                : "tab"
                        }
                        onClick={() => changeTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            <div className="profile-tab-content">
                {activeTab === "owned" && (
                    <div className="enclosed-list">
                        {data.ownedProjects.length > 0 ? (
                            data.ownedProjects.map((project) => (
                                <article
                                    key={project.projectId}
                                    className="enclosed-list-row"
                                >
                                    <div className="enclosed-list-identity">
                                        <Link
                                            to={`/projects/${project.projectSlug}`}
                                            className="enclosed-list-name"
                                        >
                                            {project.projectName}
                                        </Link>

                                        <span className="profile-list-label">
                                            {getMemberRoleLabel(project.role)}
                                        </span>

                                        <span className="enclosed-list-description">
                                            {project.projectDesc ?? "No description."}
                                        </span>
                                    </div>
                                    <span className="profile-list-label">
                                        {getMemberRoleLabel(project.role)}
                                    </span>
                                </article>
                            ))
                        ) : (
                            <div className="profile-empty-state">
                                This user owns no visible projects.
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "memberships" && (
                    <div className="enclosed-list">
                        {data.memberships.length > 0 ? (
                            data.memberships.map((project) => (
                                <article
                                    key={project.projectId}
                                    className="enclosed-list-row"
                                >
                                    <div className="enclosed-list-identity">
                                        <Link
                                            to={`/projects/${project.projectSlug}`}
                                            className="enclosed-list-name"
                                        >
                                            {project.projectName}
                                        </Link>

                                        <span className="profile-list-label">
                                            {getMemberRoleLabel(project.role)}
                                        </span>

                                        <span className="enclosed-list-description">
                                            {project.projectDesc ?? "No description"}
                                        </span>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <div className="profile-empty-state">
                                This user has no visible project memberships.
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "tasks" && isOwnProfile && (
                    <div className="enclosed-list">
                        {data.assignedTasks.length > 0 ? (
                            data.assignedTasks.map((task) => (
                                <article
                                    key={task.id}
                                    className="enclosed-list-row"
                                >
                                    <div className="enclosed-list-identity">
                                        <Link
                                            to={`/projects/${task.projectSlug}/tasks/${task.issueNo}`}
                                            className="enclosed-list-name"
                                        >
                                            {task.title}
                                        </Link>

                                        <span className="profile-list-label">
                                            {getTodoStatusLabel(task.status)}
                                        </span>

                                        <span className="enclosed-list-description">
                                            {task.description ?? "..."}
                                        </span>
                                    </div>
                                </article>


                            ))
                        ) : (
                            <div className="profile-empty-state">
                                You have no assigned tasks.
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "invites" && isOwnProfile && (
                    <div className="enclosed-list">
                        {data.invites.length > 0 ? (
                            data.invites.map((invite) => (
                                <article
                                    key={invite.projectId}
                                    className="enclosed-list-row"
                                >
                                    <div className="enclosed-list-identity">
                                        <Link
                                            to={`/projects/${invite.projectSlug}`}
                                            className="enclosed-list-name"
                                        >
                                            {invite.projectName}
                                        </Link>

                                        {/* <span className="enclosed-list-secondary">
                                            {invite.message}
                                        </span> */}
                                    </div>

                                    <div className="profile-invite-actions">
                                        <button type="button">
                                            Accept
                                        </button>
                                        <button type="button">
                                            Decline
                                        </button>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <div className="profile-empty-state">
                                You have no pending project invites.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    </main>
);
}

