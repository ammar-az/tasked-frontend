import { useMemo, useState } from "react";
import { Link } from "react-router";

import type { Route } from "./+types/members";

import "./members.css";

type MemberView = "members" | "banned" | "invites";
type SortOption = "name" | "role" | "newest" | "oldest";

interface ProjectMemberSummary {
    id: string;
    username: string;
    role: string;
    joinedAt: string;
    belongsToProjectOrganization: boolean;
    canManage: boolean;
}

interface BannedMemberSummary {
    id: string;
    username: string;
    bannedAt: string;
    bannedByUsername?: string;
}

interface ProjectInviteSummary {
    id: string;
    username: string;
    invitedAt: string;
    invitedByUsername: string;
}

interface ProjectMembersPageData {
    project: {
        id: string;
        name: string;
    };
    members: ProjectMemberSummary[];
    bannedMembers: BannedMemberSummary[];
    invites: ProjectInviteSummary[];
    canManageMembers: boolean;
}

export async function clientLoader({
    params,
}: Route.ClientLoaderArgs): Promise<ProjectMembersPageData> {
    if (!params.projectId) {
        throw new Response("Project ID is required", {
            status: 400,
        });
    }

    /*
     * Replace this placeholder with your project-member endpoint.
     *
     * const data = await getProjectMembersEndpoint(params.projectId);
     * return data;
     */

    return {
        project: {
            id: params.projectId,
            name: "Project Name",
        },

        members: [
            {
                id: "owner-id",
                username: "ownername",
                role: "Owner",
                joinedAt: "2026-01-12T00:00:00Z",
                belongsToProjectOrganization: true,
                canManage: false,
            },
            {
                id: "admin-id",
                username: "adminname",
                role: "Admin",
                joinedAt: "2026-02-04T00:00:00Z",
                belongsToProjectOrganization: true,
                canManage: false,
            },
            {
                id: "member-1",
                username: "contributor-one",
                role: "Contributor",
                joinedAt: "2026-03-18T00:00:00Z",
                belongsToProjectOrganization: true,
                canManage: true,
            },
            {
                id: "member-2",
                username: "external-user",
                role: "External",
                joinedAt: "2026-04-02T00:00:00Z",
                belongsToProjectOrganization: false,
                canManage: true,
            },
            {
                id: "member-3",
                username: "viewer-user",
                role: "Viewer",
                joinedAt: "2026-04-20T00:00:00Z",
                belongsToProjectOrganization: false,
                canManage: true,
            },
        ],

        bannedMembers: [
            {
                id: "banned-user",
                username: "banned-user",
                bannedAt: "2026-05-01T00:00:00Z",
                bannedByUsername: "ownername",
            },
        ],

        invites: [
            {
                id: "invite-id",
                username: "invited-user",
                invitedAt: "2026-05-08T00:00:00Z",
                invitedByUsername: "adminname",
            },
        ],

        // Replace this with the current user's project permissions.
        canManageMembers: true,
    };
}

export default function MembersPage({
    loaderData,
}: Route.ComponentProps) {
    const {
        project,
        members,
        bannedMembers,
        invites,
        canManageMembers,
    } = loaderData;

    const [activeView, setActiveView] =
        useState<MemberView>("members");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] =
        useState<SortOption>("role");

    const visibleMembers = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        const filtered = members.filter((member) =>
            member.username
                .toLowerCase()
                .includes(normalizedSearch),
        );

        return [...filtered].sort((first, second) => {
            switch (sortBy) {
                case "name":
                    return first.username.localeCompare(
                        second.username,
                    );

                case "newest":
                    return (
                        new Date(second.joinedAt).getTime() -
                        new Date(first.joinedAt).getTime()
                    );

                case "oldest":
                    return (
                        new Date(first.joinedAt).getTime() -
                        new Date(second.joinedAt).getTime()
                    );

                case "role":
                default:
                    return (
                        roleOrder(first.role) -
                            roleOrder(second.role) ||
                        first.username.localeCompare(
                            second.username,
                        )
                    );
            }
        });
    }, [members, search, sortBy]);

    const visibleBannedMembers = bannedMembers.filter(
        (member) =>
            member.username
                .toLowerCase()
                .includes(search.trim().toLowerCase()),
    );

    const visibleInvites = invites.filter((invite) =>
        invite.username
            .toLowerCase()
            .includes(search.trim().toLowerCase()),
    );

    function handleMemberAction(
        action: string,
        member: ProjectMemberSummary,
    ) {
        // Replace with the appropriate endpoint or dialog.
        console.log(action, member);
    }

    return (
        <main className="members-page">
            <Link
                to={`/projects/${project.id}`}
                className="members-back-link"
            >
                <span aria-hidden="true">←</span>
                Back to project
            </Link>

            <h1>{project.name}</h1>

            <section className="members-panel">
                <div className="members-toolbar">
                    <label className="members-search">
                        <span aria-hidden="true">⌕</span>

                        <input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search users"
                        />
                    </label>

                    {activeView === "members" && (
                        <select
                            value={sortBy}
                            onChange={(event) =>
                                setSortBy(
                                    event.target
                                        .value as SortOption,
                                )
                            }
                            aria-label="Sort project members"
                        >
                            <option value="role">
                                Sort by role
                            </option>
                            <option value="name">
                                Sort by name
                            </option>
                            <option value="newest">
                                Newest first
                            </option>
                            <option value="oldest">
                                Oldest first
                            </option>
                        </select>
                    )}
                </div>

                <nav
                    className="members-tabs"
                    aria-label="Project member sections"
                >
                    <TabButton
                        active={activeView === "members"}
                        onClick={() =>
                            setActiveView("members")
                        }
                    >
                        Members ({members.length})
                    </TabButton>

                    {canManageMembers && (
                        <>
                            <TabButton
                                active={
                                    activeView === "banned"
                                }
                                onClick={() =>
                                    setActiveView("banned")
                                }
                            >
                                Banned ({bannedMembers.length})
                            </TabButton>

                            <TabButton
                                active={
                                    activeView === "invites"
                                }
                                onClick={() =>
                                    setActiveView("invites")
                                }
                            >
                                Invites ({invites.length})
                            </TabButton>
                        </>
                    )}
                </nav>

                {activeView === "members" && (
                    <div className="member-list">
                        {visibleMembers.length > 0 ? (
                            visibleMembers.map((member) => (
                                <article
                                    key={member.id}
                                    className="member-row"
                                >
                                    <div className="member-identity">
                                        <Link
                                            to={`/users/${member.username}`}
                                            className="member-name"
                                        >
                                            {member.username}
                                        </Link>

                                        <span className="member-joined">
                                            Joined{" "}
                                            {formatDate(
                                                member.joinedAt,
                                            )}
                                        </span>
                                    </div>

                                    <div className="member-org-status">
                                        <span
                                            className={
                                                member.belongsToProjectOrganization
                                                    ? "member-org-badge"
                                                    : "member-org-badge external"
                                            }
                                        >
                                            {member.belongsToProjectOrganization
                                                ? "Organization member"
                                                : "External member"}
                                        </span>
                                    </div>

                                    <Link
                                        to={`/projects/${project.id}/tasks?assignedTo=${encodeURIComponent(member.username)}`}
                                        className="assigned-tasks-link"
                                    >
                                        View assigned tasks
                                    </Link>

                                    <div className="member-role">
                                        <span>Role</span>
                                        <strong>{member.role}</strong>
                                    </div>

                                    {canManageMembers &&
                                        member.canManage && (
                                            <MemberActionMenu
                                                member={member}
                                                onAction={
                                                    handleMemberAction
                                                }
                                            />
                                        )}
                                </article>
                            ))
                        ) : (
                            <EmptyState>
                                No matching members.
                            </EmptyState>
                        )}
                    </div>
                )}

                {activeView === "banned" &&
                    canManageMembers && (
                        <div className="member-list">
                            {visibleBannedMembers.length >
                            0 ? (
                                visibleBannedMembers.map(
                                    (member) => (
                                        <article
                                            key={member.id}
                                            className="member-row banned-member-row"
                                        >
                                            <div className="member-identity">
                                                <Link
                                                    to={`/users/${member.username}`}
                                                    className="member-name"
                                                >
                                                    {
                                                        member.username
                                                    }
                                                </Link>

                                                <span className="member-joined">
                                                    Banned{" "}
                                                    {formatDate(
                                                        member.bannedAt,
                                                    )}
                                                </span>
                                            </div>

                                            <div className="banned-by">
                                                {member.bannedByUsername
                                                    ? `Banned by ${member.bannedByUsername}`
                                                    : "Banned user"}
                                            </div>

                                            <button
                                                type="button"
                                                className="member-secondary-action"
                                            >
                                                Unban
                                            </button>
                                        </article>
                                    ),
                                )
                            ) : (
                                <EmptyState>
                                    No matching banned users.
                                </EmptyState>
                            )}
                        </div>
                    )}

                {activeView === "invites" &&
                    canManageMembers && (
                        <div className="member-list">
                            {visibleInvites.length > 0 ? (
                                visibleInvites.map((invite) => (
                                    <article
                                        key={invite.id}
                                        className="member-row invite-row"
                                    >
                                        <div className="member-identity">
                                            <Link
                                                to={`/users/${invite.username}`}
                                                className="member-name"
                                            >
                                                {invite.username}
                                            </Link>

                                            <span className="member-joined">
                                                Invited{" "}
                                                {formatDate(
                                                    invite.invitedAt,
                                                )}
                                            </span>
                                        </div>

                                        <div className="invited-by">
                                            Invited by{" "}
                                            {
                                                invite.invitedByUsername
                                            }
                                        </div>

                                        <button
                                            type="button"
                                            className="member-secondary-action"
                                        >
                                            Cancel Invite
                                        </button>
                                    </article>
                                ))
                            ) : (
                                <EmptyState>
                                    No matching pending invites.
                                </EmptyState>
                            )}
                        </div>
                    )}

                <footer className="members-pagination">
                    <button type="button" disabled>
                        Previous
                    </button>

                    <span>Page 1</span>

                    <button type="button">
                        Next
                    </button>
                </footer>
            </section>
        </main>
    );
}

function TabButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            className={
                active
                    ? "members-tab active"
                    : "members-tab"
            }
            onClick={onClick}
        >
            {children}
        </button>
    );
}

function MemberActionMenu({
    member,
    onAction,
}: {
    member: ProjectMemberSummary;
    onAction: (
        action: string,
        member: ProjectMemberSummary,
    ) => void;
}) {
    return (
        <details className="member-action-menu">
            <summary aria-label={`Manage ${member.username}`}>
                ⋮
            </summary>

            <div className="member-action-options">
                <button
                    type="button"
                    onClick={() =>
                        onAction("change-role", member)
                    }
                >
                    Change Role
                </button>

                <button
                    type="button"
                    onClick={() =>
                        onAction("remove", member)
                    }
                >
                    Remove from Project
                </button>

                <button
                    type="button"
                    onClick={() =>
                        onAction("ban", member)
                    }
                >
                    Ban User
                </button>
            </div>
        </details>
    );
}

function EmptyState({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="members-empty-state">
            {children}
        </div>
    );
}

function roleOrder(role: string) {
    const roles: Record<string, number> = {
        Owner: 0,
        Admin: 1,
        Contributor: 2,
        External: 3,
        Guest: 4,
        Viewer: 5,
    };

    return roles[role] ?? 99;
}

function formatDate(value: string) {
    return new Date(value).toLocaleDateString();
}