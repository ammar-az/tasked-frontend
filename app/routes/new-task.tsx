import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";

import type { Route } from "./+types/new-task";
import { TodoStatus, TodoRequest } from "../types/todo-types";
import { createTodoEndpoint } from "../api/todos";

import "./task.css";

export default function NewTaskPage({
    params,
}: Route.ComponentProps) {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<TodoStatus>(TodoStatus.Backlog);
    const [assignToSelf, setAssignToSelf] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const trimmedTitle = title.trim();
        const trimmedDescription = description.trim();

        if (!trimmedTitle) {
            setError("A task title is required.");
            return;
        }

        const request: TodoRequest = {
            title: trimmedTitle,
            description: trimmedDescription || undefined,
            status,
            selfAssign: assignToSelf
        };
        
        try {
            setIsSubmitting(true);
            setError(null);
            
            const createdTodo = await createTodoEndpoint(
                params.projectId!,
                request,
            );

            navigate(`/projects/${params.projectId}/tasks/${createdTodo.issueNo}`);
            
            console.log("Create task:", request);
        } catch {
            setError("The task could not be created.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="task-page">
            <Link
                to={`/projects/${params.projectId}`}
                className="task-back-link"
            >
                <span aria-hidden="true">←</span>
                Back to project
            </Link>

            <form
                className="task-page-layout"
                onSubmit={handleSubmit}
            >
                <article className="task-card">
                    <header className="task-card-header">
                        <div className="task-heading">
                            <span className="task-issue-number">
                                New
                            </span>

                            <input
                                className="task-title-input"
                                type="text"
                                value={title}
                                onChange={(event) =>
                                    setTitle(
                                        event.target.value,
                                    )
                                }
                                placeholder="Task title"
                                maxLength={200}
                                required
                                autoFocus
                            />
                        </div>
                    </header>

                    <section className="task-description-section">
                        <h2>Description</h2>

                        <textarea
                            className="task-description-input"
                            value={description}
                            onChange={(event) =>
                                setDescription(
                                    event.target.value,
                                )
                            }
                            placeholder="Describe the task"
                            maxLength={4000}
                        />
                    </section>

                    <footer className="task-edit-footer">
                        {error && (
                            <p className="task-edit-error">
                                {error}
                            </p>
                        )}

                        <div className="task-edit-actions">
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() => navigate(-1)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? "Creating..."
                                    : "Create Task"}
                            </button>
                        </div>
                    </footer>
                </article>

                <aside className="task-sidebar">
                    <section className="task-sidebar-section">
                        <h2>Task Information</h2>

                        <label className="new-task-field">
                            <span>Status</span>

                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(
                                        Number(
                                            event.target
                                                .value,
                                        ) as TodoStatus,
                                    )
                                }
                            >
                                <option
                                    value={
                                        TodoStatus.Backlog
                                    }
                                >
                                    Backlog
                                </option>

                                <option
                                    value={
                                        TodoStatus.InProgress
                                    }
                                >
                                    In Progress
                                </option>
                            </select>
                        </label>

                        <label className="new-task-checkbox">
                            <input
                                type="checkbox"
                                checked={assignToSelf}
                                onChange={(event) =>
                                    setAssignToSelf(
                                        event.target
                                            .checked,
                                    )
                                }
                            />

                            Assign this task to me
                        </label>
                    </section>
                </aside>
            </form>
        </main>
    );
}