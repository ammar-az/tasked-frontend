import { useEffect, useState } from "react";
import {
    Link,
    useNavigate,
    useSearchParams,
} from "react-router";

import type { Route } from "./+types/project";

import { getMemberEndpoint, getProjectEndpoint, getProjectTodosEndpoint, joinEndpoint, leaveEndpoint } from "../api/projects";

import type { MultiTodoRequest } from "../types/todo-types";
import {
    TodoSort,
    TodoStatus,
    type TodoDto,
} from "../types/todo-types";

import "./project.css";
import { getTodoStatusLabel, parseTodoStatus, isMember, isAdmin, canContribute, parseTodoSort } from "../utils/enum-helpers";
import { JoinPolicy } from "../types/project-types";

export async function clientLoader({
    params,
    request,
}: Route.ClientLoaderArgs) {
    if (!params.slug) {
        throw new Response("Project ID is required", {
            status: 400,
        });
    }

    const url = new URL(request.url);

    const todoRequest: MultiTodoRequest = {
        search: url.searchParams.get("search")?.trim() || undefined,
        status: parseTodoStatus(url.searchParams.get("status")),
        assigned:url.searchParams.get("assigned")?.trim() || undefined,
        sortBy: parseTodoSort(url.searchParams.get("sort")) ?? TodoSort.IssueNo,
        descending: url.searchParams.get("descending") === "true",
        page: Math.max(1, Number(url.searchParams.get("page") ?? 1)),
        pageSize: Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") ?? 20))),
    };

    try
    {    const [project, todos, member] = await Promise.all([
            getProjectEndpoint(params.slug),

            getProjectTodosEndpoint(
                params.slug,
                todoRequest,
            ),
            getMemberEndpoint(params.slug),
        ]);

        return {
            project,
            todos,
            member,
            todoRequest,
        };
    }catch{
        throw new Response("This project doesn't exist or you don't have permission to view it.", {
            status: 404,
        });
    }
}

export default function ProjectPage({
    loaderData,
    params,
}: Route.ComponentProps) {
    const {
        project,
        todos,
        member,
        todoRequest,
    } = loaderData;

    const navigate = useNavigate();
    
    const [_, setSearchParams] =
        useSearchParams();

    const [searchInput, setSearchInput] = useState(
        todoRequest.search ?? "",
    );

    const [selectedTodoId, setSelectedTodoId] =
        useState<string | null>(
            todos[0]?.id ?? null,
        );

    useEffect(() => {
        setSearchInput(todoRequest.search ?? "");
    }, [todoRequest.search]);

    useEffect(() => {
        const selectedStillExists = todos.some(
            (todo: TodoDto) =>
                todo.id === selectedTodoId,
        );

        if (!selectedStillExists) {
            setSelectedTodoId(
                todos[0]?.id ?? null,
            );
        }
    }, [todos, selectedTodoId]);

    const selectedTodo =
        todos.find(
            (todo: TodoDto) =>
                todo.id === selectedTodoId,
        ) ?? null;

    const role = member?.role;

    function updateQueryParameter(
        name: string,
        value: string | undefined,
        resetPage = true,
    ) {
        setSearchParams((current) => {
            const next =
                new URLSearchParams(current);

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

    function handleSearchKeyDown(
        event: React.KeyboardEvent<HTMLInputElement>,
    ) {
        if (event.key === "Enter") {
            submitSearch();
        }
    }

    function changeStatus(value: string) {
        updateQueryParameter(
            "status",
            value || undefined,
        );
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

    async function handleJoin(){
        await joinEndpoint(project.id);
        navigate(0); 
    }

    async function handleLeave(){
        await leaveEndpoint(project.id);
        navigate(0); 
    }

    return (
        <main className="project-page">
            <section className="project-summary">
                <div className="project-information">
                    <h1>{project.name}</h1>

                    <p>
                        {project.description ||
                            "No project description."}
                    </p>
                </div>

                <div className="project-actions">
                    <Link
                        to={`/projects/${params.slug}/members`}
                    >
                        Member List
                    </Link>

                   {canContribute(role) && ( <Link
                        to={`/projects/${params.slug}/tasks/new`}
                    >
                        New Task
                    </Link>)}
                    
                    {isAdmin(role) && (
                        <Link to={`/projects/${project.slug}/settings`}>
                            Settings
                        </Link>
                    )}

                    {isMember(role) ? (
                        <button onClick={handleLeave}>Leave Project</button>
                    ) : (project.joinPolicy != JoinPolicy.Closed && (
                        <button onClick={handleJoin}>Join Project</button>
                    ))}
                    
                </div>
            </section>

            <section className="task-workspace">
                <div className="task-list-panel">
                    <div className="task-toolbar">
                        <div className="task-search">
                            <input
                                type="search"
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(
                                        event.target.value,
                                    )
                                }
                                onKeyDown={
                                    handleSearchKeyDown
                                }
                                placeholder="Search tasks"
                            />

                            <button
                                type="button"
                                onClick={submitSearch}
                            >
                                Search
                            </button>
                        </div>

                        <select
                            value={
                                todoRequest.status ??
                                ""
                            }
                            onChange={(event) =>
                                changeStatus(
                                    event.target.value,
                                )
                            }
                            aria-label="Filter by status"
                        >
                            <option value="">
                                All statuses
                            </option>

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

                            <option
                                value={
                                    TodoStatus.Completed
                                }
                            >
                                Completed
                            </option>

                            <option
                                value={
                                    TodoStatus.Archived
                                }
                            >
                                Archived
                            </option>
                        </select>

                        <select
                            value={todoRequest.sortBy}
                            onChange={(event) =>
                                changeSort(
                                    event.target.value,
                                )
                            }
                            aria-label="Sort tasks"
                        >
                            <option value={TodoSort.IssueNo}>
                                Issue Number
                            </option>

                            <option value={TodoSort.Title}>
                                Title
                            </option>

                            <option value={TodoSort.Status}>
                                Status
                            </option>
                        </select>

                        <select
                            value={
                                todoRequest.descending
                                    ? "descending"
                                    : "ascending"
                            }
                            onChange={(event) =>
                                changeDescending(
                                    event.target.value ===
                                        "descending",
                                )
                            }
                            aria-label="Sort direction"
                        >
                            <option value="descending">
                                Descending
                            </option>

                            <option value="ascending">
                                Ascending
                            </option>
                        </select>
                    </div>

                    <div className="task-list-header">
                        <span>#</span>
                        <span>Task</span>
                        <span>Status</span>
                    </div>

                    <div className="task-list">
                        {todos.length > 0 ? (
                            todos.map(
                                (todo: TodoDto) => (
                                    <button
                                        key={todo.id}
                                        type="button"
                                        className={
                                            selectedTodoId ===
                                            todo.id
                                                ? "task-row selected"
                                                : "task-row"
                                        }
                                        onClick={() =>
                                            setSelectedTodoId(
                                                todo.id,
                                            )
                                        }
                                    >
                                        <span>
                                            #
                                            {
                                                todo.issueNo
                                            }
                                        </span>

                                        <span>
                                            {todo.title}
                                        </span>

                                        <span>
                                            {getTodoStatusLabel(
                                                todo.status,
                                            )}
                                        </span>
                                    </button>
                                ),
                            )
                        ) : (
                            <div className="task-list-empty">
                                No matching tasks.
                            </div>
                        )}
                    </div>

                    <footer className="task-pagination">
                        <button
                            type="button"
                            disabled={
                                todoRequest.page <= 1
                            }
                            onClick={() =>
                                changePage(
                                    todoRequest.page -
                                        1,
                                )
                            }
                        >
                            Previous
                        </button>

                        <span>
                            Page {todoRequest.page}
                        </span>

                        <button
                            type="button"
                            disabled={
                                todos.length <
                                todoRequest.pageSize
                            }
                            onClick={() =>
                                changePage(
                                    todoRequest.page +
                                        1,
                                )
                            }
                        >
                            Next
                        </button>
                    </footer>
                </div>

                <div className="selected-task-panel">
                    {selectedTodo ? (
                        <>
                            <header className="selected-task-heading">
                                <div>
                                    <span>
                                        #
                                        {
                                            selectedTodo.issueNo
                                        }
                                    </span>

                                    <h2>
                                        {
                                            selectedTodo.title
                                        }
                                    </h2>
                                </div>

                                <Link
                                    to={`/projects/${params.slug}/tasks/${selectedTodo.issueNo}`}
                                >
                                    Open Task
                                </Link>
                            </header>

                            <div className="selected-task-details">
                                <span>
                                    Assigned to:{" "}
                                    {selectedTodo
                                        .assignedName ??
                                        "Unassigned"}
                                </span>

                                <span>
                                    {getTodoStatusLabel(
                                        selectedTodo.status,
                                    )}
                                </span>
                            </div>

                            <div className="selected-task-description">
                                {selectedTodo.description ||
                                    "No description provided."}
                            </div>
                        </>
                    ) : (
                        <div className="no-task-selected">
                            Select a task to view its
                            details.
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}