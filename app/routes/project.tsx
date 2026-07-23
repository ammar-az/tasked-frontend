import type { Route } from "./+types/project";
import { getProjectEndpoint } from "../api/projects";
import { ProjectDto } from "../types/project-types";

import "./project.css";

export async function clientLoader({params,}: Route.ClientLoaderArgs) {
    if (!params.projectId) {
        throw new Response("Project ID is required", {
            status: 400,
        });
    }

    return getProjectEndpoint(params.projectId);
}

export default function ProjectPage({
    loaderData,
}: Route.ComponentProps)  {
    const project: ProjectDto = loaderData;
    return (
        <main className="project-page">
            <section className="project-header">
                <p>Project ID: {project.id}</p>

                <button className="new-task-button">
                    New Task
                </button>
            </section>

            <section className="project-description">
                <p>
                    This is where the project description will go.
                    It can span multiple lines and provide information
                    about the project.
                </p>
            </section>

            <section className="task-section">
                <input
                    className="task-search"
                    type="text"
                    placeholder="Search tasks..."
                />

                <div className="task-list">
                    <div className="task-card">Issue #1</div>
                    <div className="task-card">Issue #2</div>
                    <div className="task-card">Issue #3</div>
                </div>
            </section>
        </main>
    );
}