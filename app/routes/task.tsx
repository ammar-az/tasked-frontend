import { useEffect, useState } from "react";
import { Link } from "react-router";

import type { Route } from "./+types/task";
import { assignTodoEndpoint, getTodoByNoEndpoint, updateTodoEndpoint } from "../api/todos";
import { TodoStatus, type TodoDto, type TodoUpdateRequest } from "../types/todo-types";

import "./task.css";
import { canContribute, getTodoStatusLabel, isAdmin } from "../utils/enum-helpers";
import { getMemberEndpoint } from "../api/projects";
import { MemberOverviewDto } from "../types/membership-types";
import AssignTaskModal from "../components/AssignModal";

export async function clientLoader({
    params,
}: Route.ClientLoaderArgs): Promise<{
    todo: TodoDto;
    member: MemberOverviewDto;
}> {
    if (!params.slug) {
        throw new Response("Project ID is required", {
            status: 400,
        });
    }

    if (!params.issueNo) {
        throw new Response("Task issue number is required", {
            status: 400,
        });
    }

    const issueNo = Number(params.issueNo);

    if (!Number.isInteger(issueNo)) {
        throw new Response("Invalid task issue number", {
            status: 400,
        });
    }
    try{
        const [todo, member] = await Promise.all([
            getTodoByNoEndpoint(params.slug, issueNo),
            getMemberEndpoint(params.slug)
        ]); 

        return{
            todo,
            member
        }
    }catch{
        throw new Response("This task doesn't exist or you don't have permission to view it.", {
            status: 404,
        });
    }
}

export default function TaskPage({
    loaderData,
    params,
}: Route.ComponentProps) {
    const {todo, member} = loaderData;

    const [task, setTask] = useState(todo);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAssign, setShowAssign] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<TodoStatus>(task.status);

    const [draft, setDraft] = useState<TodoUpdateRequest>({
        title: todo.title,
        description: todo.description ?? "",
        status: todo.status,
        assigned: todo.assigned,
        unassign: false
    });

    const canEditTask = canContribute(member?.role);
    const canAssignToOthers = isAdmin(member?.role);

    useEffect(() => {
        setTask(todo);
        setDraft({
            title: todo.title,
            description: todo.description ?? "",
            status: todo.status,
            assigned: undefined,
            unassign: false
        });
        setIsEditing(false);
        setError(null);
    }, [todo]);

    function beginEditing() {
        setDraft({
            title: todo.title,
            description: todo.description ?? "",
            status: todo.status,
            assigned: undefined,
            unassign: false
        });

        setError(null);
        setIsEditing(true);
    }

    function cancelEditing() {
        setDraft({
            title: todo.title,
            description: todo.description ?? "",
            status: todo.status,
            assigned: undefined,
            unassign: false
        });

        setError(null);
        setIsEditing(false);
    }

    async function saveChanges() {
        setDraft(current => ({
            ...current,
            title: current.title?.trim(),
            description: current.description?.trim(),
        }))

        // if (!title) {
        //     setError("A task title is required.");
        //     return;
        // }

        try {
            setError(null);
            
            const updatedTodo = await updateTodoEndpoint(
                task.id,
                draft,
            );

            setTask(updatedTodo);
            
        } catch {
            setError("The task could not be created.");
        } finally {
            setIsEditing(false);
        }
    }

    const projectName = task.projectName ?? "Project";
    const creatorName = task.createdByName ?? "Unknown user";
    const assignedName = task.assignedName ?? "Unassigned";

    return (
        <main className="page-layout task-page">
            <aside className="page-side">
                <Link
                    to={`/projects/${params.slug}`}
                    className="back-button"
                >
                    <span aria-hidden="true">←</span>
                    Back to {projectName}
                </Link>
            </aside>

            {showAssign && (
                <AssignTaskModal
                    todoId={task.id}
                    projectSlug={params.slug}
                    onClose={() => setShowAssign(false)}
                    onAssign={async (member) => {
                        await assignTodoEndpoint(
                            task.id,
                            member.userId
                        );
                    }}
                />
            )}

            <div className="page-main-wide task-page-form">
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
                                {task.description ||
                                    "No description provided."}
                            </p>
                        )}

                        {isEditing && (
                            <fieldset className="form-option-group form-option-group-4">
                                <legend>Status</legend>

                                <label>
                                    <input
                                        type="radio"
                                        name="status-update"
                                        checked={
                                            draft.status ===
                                            TodoStatus.Backlog
                                        }
                                        onChange={() =>
                                            setDraft((current) => ({
                                                ...current,
                                                status: TodoStatus.Backlog,
                                            }))
                                        }
                                    />
                                    Backlog
                                </label>

                                <label>
                                    <input
                                        type="radio"
                                        name="status-update"
                                        checked={
                                            draft.status ===
                                            TodoStatus.InProgress
                                        }
                                        onChange={() =>
                                            setDraft((current) => ({
                                                ...current,
                                                status: TodoStatus.InProgress,
                                            }))
                                        }
                                    />
                                    In Progress
                                </label>

                                <label>
                                    <input
                                        type="radio"
                                        name="status-update"
                                        checked={
                                            draft.status ===
                                            TodoStatus.Completed
                                        }
                                        onChange={() =>
                                            setDraft((current) => ({
                                                ...current,
                                                status: TodoStatus.Completed,
                                                unassign: true,
                                            }))
                                        }
                                    />
                                    Completed
                                </label>

                                <label>
                                    <input
                                        type="radio"
                                        name="status-update"
                                        checked={
                                            draft.status ===
                                            TodoStatus.Archived
                                        }
                                        onChange={() =>
                                            setDraft((current) => ({
                                                ...current,
                                                status: TodoStatus.Archived,
                                                unassign: true,
                                            }))
                                        }
                                    />
                                    Archived
                                </label>

                            </fieldset>
                        )}
                    </section>

                    {isEditing && (
                        <footer className="task-edit-footer">
                            {error && (
                                <p className="error">
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
                    <section className="panel">
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
                                <dd>
                                    {getTodoStatusLabel(task.status)}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    {canEditTask && (
                        <section className="panel">
                            <h2>Actions</h2>

                            <div className="task-sidebar-actions">
                                <button type="button">
                                    Assign to Self
                                </button>

                                {canAssignToOthers && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowAssign(true)
                                        }
                                    >
                                        Change Assignee
                                    </button>
                                )}
                            </div>
                        </section>
                    )}
                    {canEditTask && (
                        <section className="panel task-status-panel">
                            <h2>Status</h2>

                            <div className="task-status-options">
                                <label>
                                    <input
                                        type="radio"
                                        name="task-status"
                                        value={TodoStatus.Backlog}
                                        checked={selectedStatus === TodoStatus.Backlog}
                                        onChange={() =>
                                            setSelectedStatus(TodoStatus.Backlog)
                                        }
                                    />
                                    Backlog
                                </label>

                                <label>
                                    <input
                                        type="radio"
                                        name="task-status"
                                        value={TodoStatus.InProgress}
                                        checked={selectedStatus === TodoStatus.InProgress}
                                        onChange={() =>
                                            setSelectedStatus(TodoStatus.InProgress)
                                        }
                                    />
                                    In Progress
                                </label>

                                <label>
                                    <input
                                        type="radio"
                                        name="task-status"
                                        value={TodoStatus.Completed}
                                        checked={selectedStatus === TodoStatus.Completed}
                                        onChange={() =>
                                            setSelectedStatus(TodoStatus.Completed)
                                        }
                                    />
                                    Completed
                                </label>

                                <label>
                                    <input
                                        type="radio"
                                        name="task-status"
                                        value={TodoStatus.Archived}
                                        checked={selectedStatus === TodoStatus.Archived}
                                        onChange={() =>
                                            setSelectedStatus(TodoStatus.Archived)
                                        }
                                    />
                                    Archived
                                </label>
                            </div>

                            <button
                                type="button"
                                className="primary-button"
                                onClick={()=>console.log()}
                                disabled={selectedStatus === task.status}
                            >
                                Change Status
                            </button>
                        </section>
                    )}
                </aside>
            </div>

            <aside className="page-side" />
        </main>
    );
}