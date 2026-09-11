import { Link, useNavigate, useSearchParams } from "react-router";

import type { Route } from "./+types/org";

import "./orgs.css";

import {
    getOrgByNameEndpoint,
    getOrgProjectsEndpoint,
    getOrgUsersEndpoint,
    joinOrgEndpoint,
    leaveOrgEndpoint,
} from "../api/orgs";
import { useAuth } from "../auth/AuthContext";
import { OrgsRequest } from "../types/org-types";
import { ProjectDto } from "../types/project-types";
import { UserDto } from "../types/user-types";

export async function clientLoader({
    params,
    request,
}: Route.ClientLoaderArgs) {
    if (!params.orgName) {
        throw new Response("Org Name is required", {
            status: 400,
        });
    }

    const url = new URL(request.url);
    const view = url.searchParams.get("view") === "users" ? "users" : "projects";

    const orgRequest: OrgsRequest = {
        search: url.searchParams.get("search")?.trim() || undefined,
        descending: url.searchParams.get("descending") === "true",
        page: Math.max(
            1,
            Number(url.searchParams.get("page") ?? 1)
        ),
        pageSize: Math.min(
            100,
            Math.max(
                1,
                Number(url.searchParams.get("pageSize") ?? 20)
            )
        ),
    };

    var projects: Array<ProjectDto> = [];
    var users: Array<UserDto> = [];

    try {
        const org = await getOrgByNameEndpoint(params.orgName);
        if(view === "users"){
            users = await getOrgUsersEndpoint(org.id, orgRequest);
        }else{
            projects = await getOrgProjectsEndpoint(org.id, orgRequest);
        }

        return {
            org,
            projects,
            users,
            orgRequest
        };
    } catch {
        throw new Response("Could not fetch organization data", {
            status: 404,
        });
    }
}

export default function OrgPage({
    loaderData,
}: Route.ComponentProps) {
    const { user, isAuthenticated } = useAuth();
    const { org, projects, users, orgRequest } = loaderData;

    const navigate = useNavigate();
    const [searchParams, setSearchParams] =
        useSearchParams();

    const view =
        searchParams.get("view") ?? "projects";

    const isMember = user?.orgId == org.id;

    async function handleJoin() {
        await joinOrgEndpoint(org.id);
        navigate(0);
    }

    async function handleLeave() {
        await leaveOrgEndpoint(org.id);
        navigate(0);
    }

    function changeView(newView: "projects" | "users") {
        const params = new URLSearchParams(searchParams);

        params.set("view", newView);
        params.delete("search");
        params.set("page", "1");

        setSearchParams(params);
    }

    function handleSearch(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const params = new URLSearchParams(searchParams);

        if (event.target.value.trim()) {
            params.set("search", event.target.value);
        } else {
            params.delete("search");
        }

        params.set("page", "1");

        setSearchParams(params);
    }

    function handleSort() {
        const params = new URLSearchParams(searchParams);

        if(params.get("descending") === "true"){
            params.set("descending", "false");
        }else{
            params.set("descending", "true");
        }

        params.set("page", "1");

        setSearchParams(params);
    }

    return (
        <main className="simple-layout">
            <div className="orgs-page">
                <section className="org-header">
                    <Link
                        to={"/orgs"}
                        className="back-button"
                    >
                        <span aria-hidden="true">←</span>
                </Link>

                    <div className="org-info">
                        <h1>{org.name}</h1>

                        <p>
                            Organization information can go here
                            later. For now just the GUID: {org.id}
                        </p>
                    </div>

                    {isAuthenticated && (
                        <div className="org-actions">
                            {isMember ? (
                                <button
                                    onClick={handleLeave}
                                    type="button"
                                >
                                    Leave Organization
                                </button>
                            ) : (
                                <button
                                    onClick={handleJoin}
                                    type="button"
                                >
                                    Join Organization
                                </button>
                            )}
                        </div>
                    )}
                </section>

                <section className="org-content">
                    <div className="org-tabs">
                        <button
                            type="button"
                            className={
                                view === "projects"
                                    ? "org-tab active"
                                    : "org-tab"
                            }
                            onClick={() =>
                                changeView("projects")
                            }
                        >
                            Projects
                        </button>

                        <button
                            type="button"
                            className={
                                view === "users"
                                    ? "org-tab active"
                                    : "org-tab"
                            }
                            onClick={() =>
                                changeView("users")
                            }
                        >
                            Members
                        </button>
                    </div>

                    <div className="orgs-controls">
                        <input
                            type="search"
                            name="search"
                            placeholder={
                                view === "projects"
                                    ? "Search projects..."
                                    : "Search members..."
                            }
                            defaultValue={orgRequest.search ?? ""}
                            onChange={handleSearch}
                        />

                        <button
                            type="button"
                            name="descending"
                            value={orgRequest.descending ? "false" : "true"}
                            aria-label={
                                orgRequest.descending
                                    ? "Sort ascending"
                                    : "Sort descending"
                            }
                            title={
                                orgRequest.descending
                                    ? "Sort ascending"
                                    : "Sort descending"
                            }
                            onClick={handleSort}
                        >
                            {orgRequest.descending ? "↓" : "↑"}
                        </button>
                    </div>

                    {view === "projects" ? (
                        <div className="org-list">
                            {projects.length === 0 ? (
                                <p className="orgs-empty">
                                    No projects found.
                                </p>
                            ) : (
                                projects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="org-list-item"
                                    >
                                        <div>
                                            <Link
                                                to={`/projects/${project.slug}`}
                                                className="org-project-name"
                                            >
                                                {project.name}
                                            </Link>

                                            <p>
                                                {project.description ??
                                                    "No project description."}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="org-list">
                            {users.length === 0 ? (
                                <p className="orgs-empty">
                                    No members found.
                                </p>
                            ) : (
                                users.map((member) => (
                                    <div
                                        key={member.username}
                                        className="org-list-item"
                                    >
                                        <Link
                                            to={`/users/${member.username}`}
                                            className="org-member-name"
                                        >
                                            {member.username}
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}