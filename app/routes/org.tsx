import { Link, useRevalidator, useSearchParams } from "react-router";

import type { Route } from "./+types/org";

import "./orgs.css";

import { getOrgByNameEndpoint, getOrgProjectsEndpoint, getOrgUsersEndpoint, joinOrgEndpoint, leaveOrgEndpoint } from "../api/orgs";
import { useAuth } from "../auth/AuthContext";
import { OrgsRequest } from "../types/org-types";
import { ProjectDto } from "../types/project-types";
import { UserDto } from "../types/user-types";
import { useEffect, useState } from "react";

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
        page: Math.max(1,Number(url.searchParams.get("page") ?? 1)),
        pageSize: Math.min(100,Math.max(1,Number(url.searchParams.get("pageSize") ?? 20))),
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
    const { 
        org, 
        projects: initialProjects, 
        users: initialUsers, 
        orgRequest: initialOrgRequest 
    } = loaderData;


    const [orgRequest, setOrgRequest] = useState(initialOrgRequest);
    const [projects, setProjects] = useState(initialProjects);
    const [users, setUsers] = useState(initialUsers);
    const [hasMore, setHasMore] = useState(initialProjects.length === initialOrgRequest.pageSize);
    const [loadingMore, setLoadingMore] = useState(false);

    const revalidator = useRevalidator();
    
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchInput, setSearchInput] = useState(orgRequest.search ?? "");
    const view = searchParams.get("view") ?? "projects";

    const isMember = user?.orgId == org.id;

    useEffect(() => {
        if(view == "users"){
            setUsers(initialUsers);
            setHasMore(initialUsers.length === initialOrgRequest.pageSize);
        }else{
            setProjects(initialProjects);
            setHasMore(initialProjects.length === initialOrgRequest.pageSize);
        }

        setOrgRequest(initialOrgRequest);

    }, [initialProjects, initialUsers, initialOrgRequest]);
    
    useEffect(() => {
        if(searchInput === "") submitSearch();
    }, [searchInput])

    async function handleJoin() {
        await joinOrgEndpoint(org.id);
        await revalidator.revalidate();
    }

    async function handleLeave() {
        await leaveOrgEndpoint(org.id);
        await revalidator.revalidate();
    }

    function updateQueryParameter(
    name: string,
    value: string | undefined,
    ) {
        setSearchParams((current) => {
            const next = new URLSearchParams(current);

            if (value === undefined || value === "") {
                next.delete(name);
            } else {
                next.set(name, value);
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

    function changeDescending(
        descending: boolean,
    ) {
        updateQueryParameter(
            "descending",
            String(descending),
        );
    }

    function changeView(newView: "projects" | "users") {
        const params = new URLSearchParams(searchParams);

        params.set("view", newView);
        params.delete("search");
        params.set("page", "1");

        setSearchParams(params);
    }

        async function loadMore() {
            if (loadingMore || !hasMore) {
                return;
            }
    
            setLoadingMore(true);
    
            try {
                const nextPage = orgRequest.page + 1;
                var load = false;
                if(view === "users"){
                    const response = await getOrgUsersEndpoint(org.id, {
                        ...orgRequest,
                        page: nextPage,
                    });

                    setUsers((current) => [
                        ...current,
                        ...response,
                    ]);

                    if(response.length === orgRequest.pageSize) load = true;
                }else{
                    const response = await getOrgProjectsEndpoint(org.id, {
                        ...orgRequest,
                        page: nextPage,
                    });

                    setProjects((current) => [
                        ...current,
                        ...response,
                    ]);

                    if(response.length === orgRequest.pageSize) load = true;
                }
    
                setOrgRequest((current) => ({
                    ...current,
                    page: nextPage,
                }));
    
                setHasMore(load);
            } finally {
                setLoadingMore(false);
            }
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

                    <form 
                        className="orgs-controls"
                            onSubmit={(event) => {
                            event.preventDefault();
                            submitSearch();
                        }}
                    >
                        <input
                            type="search"
                            name="search"
                            placeholder={
                                view === "projects"
                                    ? "Search projects..."
                                    : "Search members..."
                            }
                            defaultValue={orgRequest.search ?? ""}
                            onChange={(event) =>
                                setSearchInput(event.target.value)
                            }
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
                            onClick={() =>
                                changeDescending(!orgRequest.descending)
                            }
                        >
                            {orgRequest.descending ? "↓" : "↑"}
                        </button>
                    </form>

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
                    {(users.length > 0 && view == "users" || projects.length > 0 && view == "projects") && 
                            <button
                                type="button"
                                className="org-list-item"
                                disabled={loadingMore || !hasMore}
                                onClick={loadMore}
                            >
                                {loadingMore
                                    ? "Loading..."
                                    : hasMore
                                    ? "Load More"
                                    : view === "projects"
                                    ? "No more projects"
                                    : "No more users"}
                            </button>
                    }
                </section>
            </div>
        </main>
    );
}