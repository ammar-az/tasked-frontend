import { useEffect, useState } from "react";
import { Link } from "react-router";

import type { Route } from "./+types/task";
import { getTodoEndpoint } from "../api/todos";
import type { TodoDto } from "../types/todo-types";

import "./task.css";

export async function clientLoader({
    params,
}: Route.ClientLoaderArgs) {
    // if (!params.projectId) {
    //     throw new Response("Project ID is required", {
    //         status: 400,
    //     });
    // }

    // if (!params.issueNo) {
    //     throw new Response("Task issue number is required", {
    //         status: 400,
    //     });
    // }

    // const issueNo = Number(params.issueNo);

    // if (!Number.isInteger(issueNo)) {
    //     throw new Response("Invalid task issue number", {
    //         status: 400,
    //     });
    // }
    // //endpoint is todo id, maybe use pid + issueno
    // return getTodoEndpoint(params.projectId);
    return getTodoEndpoint(params.issueNo);
}

// type TaskPageDto = TodoDto & {
//     projectName?: string;
//     createdByUsername?: string;
//     assignedUsername?: string | null;
// };

interface TaskDraft {
    title: string;
    description: string;
}

export default function TaskPage({
    loaderData,
    params,
}: Route.ComponentProps) {
    const loadedTask = loaderData as TodoDto;

    const [task, setTask] = useState(loadedTask);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [draft, setDraft] = useState<TaskDraft>({
        title: loadedTask.title,
        description: loadedTask.description ?? "",
    });

    // Replace these with permissions from your auth or membership state.
    const canEditTask = true;
    const canAssignToOthers = true;
    const canChangeStatus = true;

    useEffect(() => {
        setTask(loadedTask);
        setDraft({
            title: loadedTask.title,
            description: loadedTask.description ?? "",
        });
        setIsEditing(false);
        setError(null);
    }, [loadedTask]);

    function beginEditing() {
        setDraft({
            title: task.title,
            description: task.description ?? "",
        });

        setError(null);
        setIsEditing(true);
    }

    function cancelEditing() {
        setDraft({
            title: task.title,
            description: task.description ?? "",
        });

        setError(null);
        setIsEditing(false);
    }

    function saveChanges() {
        const title = draft.title.trim();

        if (!title) {
            setError("A task title is required.");
            return;
        }

        const updatedTask = {
            ...task,
            title,
            description: draft.description.trim(),
        };

        // Replace this local update with your API request:
        //
        // await updateTodoEndpoint(task.id, {
        //     title: updatedTask.title,
        //     description: updatedTask.description,
        // });
        //
        // You can then use the response from the endpoint instead.

        setTask(updatedTask);
        setError(null);
        setIsEditing(false);
    }

    const projectName = task.projectName ?? "Project";
    const creatorName = task.createdByName ?? "Unknown user";
    const assignedName = task.assignedName ?? "Unassigned";

    return (
        <main className="task-page">
            <Link
                to={`/projects/${params.projectId}`}
                className="task-back-link"
            >
                <span aria-hidden="true">←</span>
                Back to {projectName}
            </Link>

            <div className="task-page-layout">
                <article className="task-card">
                    <header className="task-card-header">
                        <div className="task-heading">
                            <span className="task-issue-number">
                                #{task.issueNo}
                            </span>

                            {isEditing ? (
                                <input
                                    className="task-title-input"
                                    value={draft.title}
                                    onChange={(event) =>
                                        setDraft((current) => ({
                                            ...current,
                                            title: event.target.value,
                                        }))
                                    }
                                    aria-label="Task title"
                                />
                            ) : (
                                <h1>{task.title}</h1>
                            )}
                        </div>

                        {canEditTask && !isEditing && (
                            <button
                                type="button"
                                className="task-edit-button"
                                onClick={beginEditing}
                                aria-label="Edit task"
                                title="Edit task"
                            >
                                ✎
                            </button>
                        )}
                    </header>

                    <section className="task-description-section">
                        <h2>Description</h2>

                        {isEditing ? (
                            <textarea
                                className="task-description-input"
                                value={draft.description}
                                onChange={(event) =>
                                    setDraft((current) => ({
                                        ...current,
                                        description: event.target.value,
                                    }))
                                }
                                placeholder="Enter a task description"
                            />
                        ) : (
                            <p className="task-description">
                                {task.description || "No description provided."}
                            </p>
                        )}
                    </section>

                    {isEditing && (
                        <footer className="task-edit-footer">
                            {error && (
                                <p className="task-edit-error">
                                    {error}
                                </p>
                            )}

                            <div className="task-edit-actions">
                                <button
                                    type="button"
                                    onClick={cancelEditing}
                                    className="secondary-button"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={saveChanges}
                                    className="primary-button"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </footer>
                    )}
                </article>

                <aside className="task-sidebar">
                    <section className="task-sidebar-section">
                        <h2>Task Information</h2>

                        <dl className="task-metadata">
                            <div>
                                <dt>Created by</dt>
                                <dd>
                                    <Link to={`/users/${creatorName}`}>
                                        {creatorName}
                                    </Link>
                                </dd>
                            </div>

                            <div>
                                <dt>Created</dt>
                                <dd>
                                    {new Date(
                                        task.createdAt,
                                    ).toLocaleDateString()}
                                </dd>
                            </div>

                            <div>
                                <dt>Assigned to</dt>
                                <dd>{assignedName}</dd>
                            </div>

                            <div>
                                <dt>Status</dt>
                                <dd>{String(task.status)}</dd>
                            </div>
                        </dl>
                    </section>

                    <section className="task-sidebar-section">
                        <h2>Actions</h2>

                        <div className="task-sidebar-actions">
                            <button type="button">
                                Assign to Self
                            </button>

                            {canAssignToOthers && (
                                <button type="button">
                                    Change Assignee
                                </button>
                            )}

                            {canChangeStatus && (
                                <button type="button">
                                    Change Status
                                </button>
                            )}
                        </div>
                    </section>
                </aside>
            </div>
        </main>
    );
}