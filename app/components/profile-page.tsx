import { Link, useNavigate, useSearchParams } from "react-router";

import "./profile.css";

export interface ProfileUserSummary {
    username: string;
    organizationName?: string | null;
}

export interface ProfileProjectSummary {
    id: string;
    name: string;
    description?: string | null;
    organizationName?: string | null;
    role: string;
}

export interface AssignedTaskSummary {
    id: string;
    projectId: string;
    projectName: string;
    issueNo: number;
    title: string;
    status: string;
}

export interface ProjectInviteSummary {
    id: string;
    projectId: string;
    projectName: string;
    invitedByUsername: string;
}

export interface ProfilePageData {
    user: ProfileUserSummary;
    ownedProjects: ProfileProjectSummary[];
    memberships: ProfileProjectSummary[];
    assignedTasks: AssignedTaskSummary[];
    invites: ProjectInviteSummary[];
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
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

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
            <section className="profile-header">
                <button
                    type="button"
                    className="profile-back-button"
                    onClick={() => navigate(-1)}
                    aria-label="Go back"
                >
                    ←
                </button>

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

                        <span>
                            {data.user.organizationName ??
                                "No organization"}
                        </span>
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
                    className="profile-tabs"
                    aria-label="Profile sections"
                >
                    {availableTabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            className={
                                activeTab === tab.id
                                    ? "profile-tab active"
                                    : "profile-tab"
                            }
                            onClick={() => changeTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <div className="profile-tab-content">
                    {activeTab === "owned" && (
                        <ProjectList
                            projects={data.ownedProjects}
                            emptyMessage="This user does not own any visible projects."
                        />
                    )}

                    {activeTab === "memberships" && (
                        <ProjectList
                            projects={data.memberships}
                            emptyMessage="This user has no visible project memberships."
                        />
                    )}

                    {activeTab === "tasks" && isOwnProfile && (
                        <AssignedTaskList
                            tasks={data.assignedTasks}
                        />
                    )}

                    {activeTab === "invites" && isOwnProfile && (
                        <InviteList invites={data.invites} />
                    )}
                </div>
            </section>
        </main>
    );
}

interface ProjectListProps {
    projects: ProfileProjectSummary[];
    emptyMessage: string;
}

function ProjectList({
    projects,
    emptyMessage,
}: ProjectListProps) {
    if (projects.length === 0) {
        return (
            <div className="profile-empty-state">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="profile-project-list">
            {projects.map((project) => (
                <article
                    key={project.id}
                    className="profile-project-card"
                >
                    <div className="profile-project-heading">
                        <div>
                            <Link
                                to={`/projects/${project.id}`}
                                className="profile-project-name"
                            >
                                {project.name}
                            </Link>

                            {project.organizationName && (
                                <span className="profile-project-org">
                                    <span aria-hidden="true">♧</span>
                                    {project.organizationName}
                                </span>
                            )}
                        </div>

                        <span className="profile-project-role">
                            {project.role}
                        </span>
                    </div>

                    <p className="profile-project-description">
                        {project.description ||
                            "No project description."}
                    </p>
                </article>
            ))}
        </div>
    );
}

function AssignedTaskList({
    tasks,
}: {
    tasks: AssignedTaskSummary[];
}) {
    if (tasks.length === 0) {
        return (
            <div className="profile-empty-state">
                You have no assigned tasks.
            </div>
        );
    }

    return (
        <div className="profile-task-list">
            {tasks.map((task) => (
                <Link
                    key={task.id}
                    to={`/projects/${task.projectId}/tasks/${task.issueNo}`}
                    className="profile-task-card"
                >
                    <div className="profile-task-heading">
                        <span>
                            #{task.issueNo} {task.title}
                        </span>

                        <span>{task.status}</span>
                    </div>

                    <span className="profile-task-project">
                        {task.projectName}
                    </span>
                </Link>
            ))}
        </div>
    );
}

function InviteList({
    invites,
}: {
    invites: ProjectInviteSummary[];
}) {
    if (invites.length === 0) {
        return (
            <div className="profile-empty-state">
                You have no pending project invites.
            </div>
        );
    }

    return (
        <div className="profile-invite-list">
            {invites.map((invite) => (
                <article
                    key={invite.id}
                    className="profile-invite-card"
                >
                    <div>
                        <Link
                            to={`/projects/${invite.projectId}`}
                            className="profile-project-name"
                        >
                            {invite.projectName}
                        </Link>

                        <p>
                            Invited by{" "}
                            <Link
                                to={`/users/${invite.invitedByUsername}`}
                            >
                                {invite.invitedByUsername}
                            </Link>
                        </p>
                    </div>

                    <div className="profile-invite-actions">
                        {/* Replace these with the invite endpoints later. */}
                        <button type="button">
                            Decline
                        </button>

                        <button type="button">
                            Accept
                        </button>
                    </div>
                </article>
            ))}
        </div>
    );
}