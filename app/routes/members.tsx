import {
    useEffect,
    useState,
    type ReactNode,
} from "react";
import {
    Link,
    useRevalidator,
    useSearchParams,
} from "react-router";

import type { Route } from "./+types/members";

import { banEndpoint, getMemberEndpoint, getProjectEndpoint, roleChangeEndpoint, transferEndpoint } from "../api/projects";
import { getMembersEndpoint } from "../api/projects";

import type { ProjectDto } from "../types/project-types";
import {
    MemberOverviewDto,
    MemberRole,
    MemberSort,
    type MemberDto,
    type MemberOverviewRequest,
} from "../types/membership-types";


import "./members.css";
import { canContribute, getMemberRoleLabel, isAdmin, isMember, parseMemberRole, parseMemberSort } from "../utils/enum-helpers";

type MemberView = "members" | "contributors" | "admins" | "banned" | "invited";

function getActiveView(
    role: MemberRole | undefined,
): MemberView {

    if (role === MemberRole.Contributor) {
        return "contributors";
    }

    if (role === MemberRole.Admin) {
        return "admins";
    }

    if (role === MemberRole.Banned) {
        return "banned";
    }

    if (role === MemberRole.Invited) {
        return "invited";
    }

    return "members";
}

function formatDate(value?: string) {
    if (!value) {
        return null;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? null
        : date.toLocaleDateString();
}

export async function clientLoader({
    params,
    request,
}: Route.ClientLoaderArgs): Promise<{
    project: ProjectDto;
    me: MemberOverviewDto;
    members: MemberDto[];
    memberRequest: MemberOverviewRequest;
}> {
    if (!params.slug) {
        throw new Response("Project slug is required", {
            status: 400,
        });
    }

    const url = new URL(request.url);

    const memberRequest: MemberOverviewRequest = {
        search: url.searchParams.get("search")?.trim() || undefined,

        role: parseMemberRole(url.searchParams.get("role"),),
        
        roleMin: url.searchParams.get("include") !== "false",

        sortBy: parseMemberSort(url.searchParams.get("sort")) ?? MemberSort.Role,

        descending: url.searchParams.get("descending") !== "false",

        page: Math.max(1, Number(url.searchParams.get("page") ?? 1)),
        pageSize: Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") ?? 20))),
    };

    try{
        const [project, me, members] = await Promise.all([
            getProjectEndpoint(params.slug),
            getMemberEndpoint(params.slug),
            getMembersEndpoint(
                params.slug,
                memberRequest,
            ),
        ]);
        return {
            project,
            me,
            members,
            memberRequest,
        };
    }catch{
        throw new Response("This project doesn't exist or you don't have permission to view it.", {
            status: 404,
        });
    }
}

export default function MembersPage({
    loaderData,
}: Route.ComponentProps) {
    const {
        project,
        me,
        members,
        memberRequest,
    } = loaderData;

    const [_, setSearchParams] =
        useSearchParams();

    const [searchInput, setSearchInput] = useState(
        memberRequest.search ?? "",
    );

    const activeView = getActiveView(
        memberRequest.role,
    );

    const canManageMembers = isAdmin(me?.role);
    const owns = me?.role == MemberRole.Owner;

    useEffect(() => {
        setSearchInput(memberRequest.search ?? "");
    }, [memberRequest.search]);

    function updateQueryParameter(
        name: string,
        value: string | undefined,
        resetPage = true,
    ) {
        setSearchParams((current) => {
            const next = new URLSearchParams(current);

            if (
                value === undefined ||
                value === ""
            ) {
                next.delete(name);
            } else {
                next.set(name, value);
            }

            if (resetPage) {
                next.set("page", "1");
            }

            return next;
        });
    }

    function submitSearch() {
        updateQueryParameter(
            "search",
            searchInput.trim() || undefined,
        );
    }

    function changeView(view: MemberView) {
        setSearchParams((current) => {
            const next = new URLSearchParams(current);

            switch (view) {
                case "contributors":
                    next.set(
                        "role",
                        String(MemberRole.Contributor),
                    );
                    next.set("include", "true");
                    break;
                case "admins":
                    next.set(
                        "role",
                        String(MemberRole.Admin),
                    );
                    next.set("include", "true");
                    break;
                case "banned":
                    next.set(
                        "role",
                        String(MemberRole.Banned),
                    );
                    next.set("include", "false");
                    break;

                case "invited":
                    next.set(
                        "role",
                        String(MemberRole.Invited),
                    );
                    next.set("include", "false");
                    break;

                case "members":
                default:
                    next.delete("role");
                    next.set("include", "false");
                    break;
            }

            next.set("page", "1");

            return next;
        });
    }

    function changeSort(value: string) {
        updateQueryParameter("sort", value);
    }

    function changeDescending(
        descending: boolean,
    ) {
        updateQueryParameter(
            "descending",
            String(descending),
        );
    }

    function changePage(page: number) {
        updateQueryParameter(
            "page",
            String(page),
            false,
        );
    }

    const revalidator = useRevalidator();

    async function handleMemberAction(
        action: string,
        member: MemberDto,
    ) {
        
        switch (action){
            case "admin":
                //check if owner
                await roleChangeEndpoint(member.projectId, {user: member.userId, role: MemberRole.Admin});
                break;
            case "contributor":
                await roleChangeEndpoint(member.projectId, {user: member.userId, role: MemberRole.Contributor});
                break;
            case "viewer":
                await roleChangeEndpoint(member.projectId, {user: member.userId, role: MemberRole.Viewer});
                break;
            case "ban":
                await banEndpoint(member.projectId, member.userId);
                break
            case "unban":
                await roleChangeEndpoint(member.projectId, {user: member.userId, role: MemberRole.Viewer});
                break;
            case "transfer":
                await transferEndpoint(member.projectId, member.userId);
                break;
            default:
                break;
        }

        console.log(action, member);
        await revalidator.revalidate();
    }

    return (
        <main className="page-layout">
            <aside className="page-side">
                <Link
                    to={`/projects/${project.slug}`}
                    className="back-button"
                >
                    <span aria-hidden="true">←</span>
                    Back to {project.slug}
                </Link>
            </aside>
            <div className="members-page">
                <h1>{project.name} Members</h1>

                <form
                    className="members-toolbar"
                    onSubmit={(event) => {
                        event.preventDefault();
                        submitSearch();
                    }}
                >
                    <div className="members-search">
                        <input
                            type="search"
                            value={searchInput}
                            onChange={(event) =>
                                setSearchInput(event.target.value)
                            }
                            placeholder="Search users"
                        />

                        <button
                            type="submit"
                            aria-label="Search"
                            title="Search"
                        >
                            ⌕
                        </button>
                    </div>

                    <select
                        className="members-sort"
                        value={memberRequest.sortBy}
                        onChange={(event) =>
                            changeSort(event.target.value)
                        }
                        aria-label="Sort members"
                    >
                        <option value={MemberSort.Role}>
                            Role
                        </option>

                        <option value={MemberSort.Name}>
                            Username
                        </option>

                        <option value={MemberSort.Time}>
                            Date joined
                        </option>
                    </select>

                    <button
                        type="button"
                        className="members-sort-direction"
                        onClick={() =>
                            changeDescending(
                                !memberRequest.descending,
                            )
                        }
                        aria-label={
                            memberRequest.descending
                                ? "Sort ascending"
                                : "Sort descending"
                        }
                        title={
                            memberRequest.descending
                                ? "Ascending"
                                : "Descending"
                        }
                    >
                        {memberRequest.descending ? "↓" : "↑"}
                    </button>
                </form>

                
                    <nav
                        className="members-tabs"
                        aria-label="Project member sections"
                    >
                        <TabButton
                            active={activeView === "members"}
                            onClick={() => changeView("members")}
                        >
                            Members
                        </TabButton>
                        
                        <TabButton
                            active={activeView === "contributors"}
                            onClick={() => changeView("contributors")}
                        >
                            Contributors
                        </TabButton>

                        <TabButton
                            active={activeView === "admins"}
                            onClick={() => changeView("admins")}
                        >
                            Admins
                        </TabButton>
                        {canManageMembers && (
                        <>
                            <TabButton
                                active={activeView === "banned"}
                                onClick={() => changeView("banned")}
                            >
                                Banned
                            </TabButton>

                            <TabButton
                                active={activeView === "invited"}
                                onClick={() => changeView("invited")}
                            >
                                Invites
                            </TabButton>
                        </>
                    )}
                    </nav>
                

                <div className="member-list">
                    {members.length > 0 ? (
                        members.map((member) => (
                            <MemberRow
                                key={member.userId}
                                project={project}
                                member={member}
                                activeView={activeView}
                                canManageMembers={canManageMembers}
                                owns={owns}
                                onAction={handleMemberAction}
                            />
                        ))
                    ) : (
                        <div className="members-empty-state">
                            {activeView === "banned"
                                ? "No banned users found."
                                : activeView === "invited"
                                ? "No pending invites found."
                                : "No matching members found."}
                        </div>
                    )}
                </div>

                <footer className="members-pagination">
                    <button
                        type="button"
                        disabled={memberRequest.page <= 1}
                        onClick={() =>
                            changePage(memberRequest.page - 1)
                        }
                    >
                        Previous
                    </button>

                    <span>
                        Page {memberRequest.page}
                    </span>

                    <button
                        type="button"
                        disabled={
                            members.length <
                            memberRequest.pageSize
                        }
                        onClick={() =>
                            changePage(memberRequest.page + 1)
                        }
                    >
                        Next
                    </button>
                </footer>
            </div>
            <aside className="page-side"></aside>
        </main>
    );
}

function MemberRow({
    project,
    member,
    activeView,
    canManageMembers,
    owns,
    onAction,
}: {
    project: ProjectDto;
    member: MemberDto;
    activeView: MemberView;
    canManageMembers: boolean;
    owns: boolean;
    onAction: (
        action: string,
        member: MemberDto,
    ) => void;
}) {
    const memberDate = formatDate(
        member.joinTime,
    );

    return (
        <div className="row-wrapper">
            <article className="member-row">
                <div className="member-identity">
                    <Link
                        to={`/users/${member.username}`}
                        className="member-name"
                    >
                        {member.username}
                    </Link>

                    {memberDate && (
                        <span className="member-joined">
                            {activeView === "banned"
                                ? "Banned"
                                : activeView ===
                                    "invited"
                                ? "Invited"
                                : "Joined"}{" "}
                            {memberDate}
                        </span>
                    )}
                </div>

                {activeView !== "banned" && activeView !== "invited" && (
                    <>
                    {project.orgId != null && (
                            <>
                            <div className="member-org-status">
                                <span
                                    className={
                                        member.orgId === project.orgId
                                            ? "member-org-badge"
                                            : "member-org-badge external"
                                    }
                                >
                                    {member.orgId === project.orgId
                                        ? "Organization member"
                                        : "External member"}
                                </span>
                            </div>
                        </>
                    )}

                        {canContribute(member.role) ? (
                            <Link
                                to={`/projects/${project.slug}?assigned=${encodeURIComponent(member.username)}`}
                                className="assigned-tasks-link"
                            >
                                View assigned tasks
                            </Link>)
                            : <span className="assigned-tasks-link"></span>
                        }
                    </>
                )}

                <div className="member-role">
                    <span>Role</span>

                    <strong>
                        {getMemberRoleLabel(
                            member.role,
                        )}
                    </strong>
                </div>
            </article>
            {canManageMembers &&
                member.role !== MemberRole.Owner && (
                    <MemberActionMenu
                        member={member}
                        owns={owns}
                        activeView={activeView}
                        onAction={onAction}
                    />
            )}
        </div>
    );
}

function MemberActionMenu({
    member,
    owns,
    activeView,
    onAction,
}: {
    member: MemberDto;
    owns: boolean;
    activeView: MemberView;
    onAction: (
        action: string,
        member: MemberDto,
    ) => void;
}) {
    return (
        <details className="member-action-menu">
            <summary
                aria-label={`Manage ${member.username}`}
            >
                ⋮
            </summary>

            <div className="member-action-options">
                {isMember(member.role) && (
                    <>
                        {member.role == MemberRole.Admin && owns && (<button
                            type="button"
                            onClick={() =>
                                onAction(
                                    "transfer",
                                    member,
                                )
                            }
                        >
                            Transfer Project Ownership
                        </button>)}

                        {member.role != MemberRole.Admin && owns && (<button
                            type="button"
                            onClick={() =>
                                onAction(
                                    "admin",
                                    member,
                                )
                            }
                        >
                            Promote to Admin
                        </button>)}

                        {member.role == MemberRole.Admin && owns && (<button
                            type="button"
                            onClick={() =>
                                onAction(
                                    "contributor",
                                    member,
                                )
                            }
                        >
                            Demote to Contributor
                        </button>)}

                        {member.role == MemberRole.Admin && owns && (<button
                            type="button"
                            onClick={() =>
                                onAction(
                                    "viewer",
                                    member,
                                )
                            }
                        >
                            Demote to Viewer
                        </button>)}

                        {member.role == MemberRole.Viewer && (<button
                            type="button"
                            onClick={() =>
                                onAction(
                                    "contributor",
                                    member,
                                )
                            }
                        >
                            Promote to Contributor
                        </button>)}

                        {member.role == MemberRole.Contributor && (<button
                            type="button"
                            onClick={() =>
                                onAction(
                                    "viewer",
                                    member,
                                )
                            }
                        >
                            Demote to Viewer
                        </button>)}

                        <button
                            type="button"
                            onClick={() =>
                                onAction(
                                    "ban",
                                    member,
                                )
                            }
                        >
                            Ban User
                        </button>
                    </>
                )}

                {member.role == MemberRole.Banned && (
                    <button
                        type="button"
                        onClick={() =>
                            onAction(
                                "unban",
                                member,
                            )
                        }
                    >
                        Unban User
                    </button>
                )}

                {activeView === "invited" && (
                    <button
                        type="button"
                        onClick={() =>
                            onAction(
                                "cancel-invite",
                                member,
                            )
                        }
                    >
                        Cancel Invite
                    </button>
                )}
            </div>
        </details>
    );
}

function TabButton({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: ReactNode;
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