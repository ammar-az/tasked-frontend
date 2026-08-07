import { Link, useNavigate } from "react-router";

import type { Route } from "./+types/org";

import "./org.css";
import { getOrgEndpoint, joinOrgEndpoint, leaveOrgEndpoint } from "../api/orgs";
import { useAuth } from "../auth/AuthContext";
import { ProjectDto } from "../types/project-types";

export async function clientLoader({
    params,
    //request,
}: Route.ClientLoaderArgs) {
    if (!params.orgId) {
        throw new Response("Org ID is required", {
            status: 400,
        });
    }

    const org = await getOrgEndpoint(params.orgId);

    return {
        org
    };
}

export default function OrgPage({
    loaderData,
    //params,
}: Route.ComponentProps) {
    const {user} = useAuth();
    const {org} = loaderData;

    const navigate = useNavigate();
    
    //later
    const projects: Array<ProjectDto> = [];

    const isMember = user?.orgId == org.id;

    async function handleJoin(){
        await joinOrgEndpoint(org.id);
        navigate(0);
    }

    async function handleLeave(){
        await leaveOrgEndpoint(org.id);
        navigate(0);
    }

    return (
        <main className="org-page">
            <section className="org-header">
                <button
                    type="button"
                    className="org-back-button"
                    onClick={() => navigate(-1)}
                    aria-label="Go back"
                >
                    ←
                </button>

                <div className="org-info">
                    <h1>{org.name}</h1>

                    <p>
                        Organization information can go here later. But I don't know if I want to add those fields so for now just the GUID: {org.id}
                    </p>
                </div>

                <div className="org-actions">
                    {isMember ? (
                        <button onClick={handleLeave} type="button">
                            Leave Organization
                        </button>
                    ) : (
                        <button onClick={handleJoin} type="button">
                            Join Organization
                        </button>
                    )}
                </div>
            </section>

            <section className="org-projects">
                <header className="org-projects-header">
                    <h2>Projects</h2>
                </header>

                {projects.length > 0 ? (
                    <div className="org-project-list">
                        {
                            //Eventually:

                            projects.map((project) => (
                                <article
                                    key={project.id}
                                    className="org-project-card"
                                >
                                    <Link
                                        to={`/projects/${project.id}`}
                                        className="org-project-name"
                                    >
                                        {project.name}
                                    </Link>

                                    <p>
                                        {project.description ??
                                            "No project description."}
                                    </p>
                                </article>
                            ))
                        }
                    </div>
                ) : (
                    <div className="org-empty-state">
                        No projects are registered to this
                        organization.
                    </div>
                )}
            </section>
        </main>
    );
}