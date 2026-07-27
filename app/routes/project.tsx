import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";

import type { Route } from "./+types/project";
import { getProjectEndpoint } from "../api/projects";
import type { ProjectDto } from "../types/project-types";

import "./project.css";

export async function clientLoader({
    params,
}: Route.ClientLoaderArgs) {
    if (!params.projectId) {
        throw new Response("Project ID is required", {
            status: 400,
        });
    }

    return getProjectEndpoint(params.projectId);
}

type TaskStatus = "Todo" | "In Progress" | "Completed";

interface TaskSummary {
    id: string;
    issueNo: number;
    title: string;
    description: string;
    status: TaskStatus;
    assignedUsername?: string;
    createdByUsername: string;
    createdAt: string;
}

type ProjectViewData = ProjectDto & {
    ownerUsername?: string;
    ownerName?: string;
    createdByUsername?: string;
    createdAt?: string;
    isVisible?: boolean;
};

// Replace this with the project-tasks endpoint later.
const mockTasks: TaskSummary[] = [
    {
        id: "1",
        issueNo: 14,
        title: "Create the initial project page",
        description:
            "Create the main project page containing the searchable task list and selected-task panel.",
        status: "In Progress",
        assignedUsername: "user",
        createdByUsername: "user",
        createdAt: "2026-07-27T12:00:00Z",
    },
    {
        id: "2",
        issueNo: 13,
        title: "Build project member list",
        description:
            "Add a page that lists project members and provides administrative member controls.",
        status: "Todo",
        createdByUsername: "user",
        createdAt: "2026-07-26T12:00:00Z",
    },
    {
        id: "3",
        issueNo: 12,
        title: "Finish authentication context",
        description:
            "Connect the authentication context to the current-user endpoint.",
        status: "Completed",
        assignedUsername: "user",
        createdByUsername: "user",
        createdAt: "2026-07-25T12:00:00Z",
    },
];

const taskStatuses: TaskStatus[] = [
    "Todo",
    "In Progress",
    "Completed",
];

export default function ProjectPage({
    loaderData,
    params,
}: Route.ComponentProps) {
    const project = loaderData as ProjectViewData;
    const projectId = params.projectId;

    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [visibleStatuses, setVisibleStatuses] =
        useState<TaskStatus[]>(taskStatuses);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
        mockTasks[0]?.id ?? null,
    );

    // Replace these with values from your auth/membership state.
    const canManageProject = true;
    const isProjectMember = true;

    const creatorUsername =
        project.ownerUsername ??
        project.ownerName ??
        project.createdByUsername ??
        "Unknown user";

    const filteredTasks = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        const tasks = mockTasks.filter((task) => {
            const matchesSearch =
                normalizedSearch.length === 0 ||
                task.title.toLowerCase().includes(normalizedSearch) ||
                task.issueNo.toString().includes(normalizedSearch);

            return (
                matchesSearch &&
                visibleStatuses.includes(task.status)
            );
        });

        return [...tasks].sort((first, second) => {
            switch (sortBy) {
                case "oldest":
                    return first.issueNo - second.issueNo;

                case "title":
                    return first.title.localeCompare(second.title);

                case "status":
                    return first.status.localeCompare(second.status);

                case "newest":
                default:
                    return second.issueNo - first.issueNo;
            }
        });
    }, [search, sortBy, visibleStatuses]);

    const selectedTask =
        mockTasks.find((task) => task.id === selectedTaskId) ?? null;

    function toggleStatus(status: TaskStatus) {
        setVisibleStatuses((current) =>
            current.includes(status)
                ? current.filter((item) => item !== status)
                : [...current, status],
        );
    }

    return (
        <main className="project-page">
            <section className="project-summary">
                <button
                    type="button"
                    className="back-button"
                    onClick={() => navigate("/")}
                    aria-label="Go back"
                >
                    ←
                </button>

                <div className="project-information">
                    <div className="project-title-row">
                        <h1>{project.name}</h1>

                        {canManageProject && (
                            <Link
                                to={`/projects/${projectId}/settings`}
                                className="project-settings-link"
                                aria-label="Project settings"
                            >
                                ⚙
                            </Link>
                        )}
                    </div>

                    <div className="project-description">
                        {project.description || "No project description."}
                    </div>
                </div>

                <div className="project-metadata">
                    <span>
                        {project.isVisible ? "Public" : "Private"}
                    </span>

                    <span>
                        Created by:{" "}
                        <Link to={`/users/${creatorUsername}`}>
                            {creatorUsername}
                        </Link>
                    </span>

                    {project.createdAt && (
                        <span>
                            Created:{" "}
                            {new Date(
                                project.createdAt,
                            ).toLocaleDateString()}
                        </span>
                    )}
                </div>

                <div className="project-actions">
                    <button type="button">
                        {isProjectMember ? "Leave Project" : "Join Project"}
                    </button>

                    <Link
                        to={`/projects/${projectId}/members`}
                        className="button-link"
                    >
                        Member List
                    </Link>
                </div>
            </section>

            <section className="task-workspace">
                <div className="task-list-panel">
                    <div className="task-toolbar">
                        <label className="task-search">
                            <span aria-hidden="true">⌕</span>

                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search tasks"
                            />
                        </label>

                        <details className="status-filter">
                            <summary>Status</summary>

                            <div className="status-filter-menu">
                                {taskStatuses.map((status) => (
                                    <label key={status}>
                                        <input
                                            type="checkbox"
                                            checked={visibleStatuses.includes(
                                                status,
                                            )}
                                            onChange={() =>
                                                toggleStatus(status)
                                            }
                                        />

                                        {status}
                                    </label>
                                ))}
                            </div>
                        </details>

                        <select
                            value={sortBy}
                            onChange={(event) =>
                                setSortBy(event.target.value)
                            }
                            aria-label="Sort tasks"
                        >
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="title">Title</option>
                            <option value="status">Status</option>
                        </select>

                        <Link
                            to={`/projects/${projectId}/tasks/new`}
                            className="button-link new-task-link"
                        >
                            New Task
                        </Link>
                    </div>

                    <div className="task-list-header">
                        <span>#</span>
                        <span>Task</span>
                        <span>Status</span>
                    </div>

                    <div className="task-list">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => (
                                <button
                                    key={task.id}
                                    type="button"
                                    className={`task-row ${
                                        selectedTaskId === task.id
                                            ? "selected"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setSelectedTaskId(task.id)
                                    }
                                >
                                    <span>#{task.issueNo}</span>
                                    <span>{task.title}</span>
                                    <span>{task.status}</span>
                                </button>
                            ))
                        ) : (
                            <div className="task-list-empty">
                                No matching tasks.
                            </div>
                        )}
                    </div>
                </div>

                <div className="selected-task-panel">
                    {selectedTask ? (
                        <>
                            <div className="selected-task-heading">
                                <div>
                                    <span className="selected-task-number">
                                        #{selectedTask.issueNo}
                                    </span>

                                    <h2>{selectedTask.title}</h2>
                                </div>

                                <Link
                                    to={`/projects/${projectId}/tasks/${selectedTask.issueNo}`}
                                    className="open-task-link"
                                >
                                    Open Task
                                </Link>
                            </div>

                            <div className="selected-task-details">
                                <span>
                                    Assigned to:{" "}
                                    {selectedTask.assignedUsername ??
                                        "Unassigned"}
                                </span>

                                <span>{selectedTask.status}</span>
                            </div>

                            <div className="selected-task-description">
                                <p>{selectedTask.description}</p>
                            </div>

                            <footer className="selected-task-footer">
                                <div>
                                    <span>
                                        Created by:{" "}
                                        {selectedTask.createdByUsername}
                                    </span>

                                    <span>
                                        {new Date(
                                            selectedTask.createdAt,
                                        ).toLocaleDateString()}
                                    </span>
                                </div>

                                <Link
                                    to={`/projects/${projectId}/tasks/${selectedTask.issueNo}`}
                                    className="edit-task-link"
                                    aria-label="Edit task"
                                >
                                    ✎
                                </Link>
                            </footer>
                        </>
                    ) : (
                        <div className="no-task-selected">
                            Select a task to view its details.
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}