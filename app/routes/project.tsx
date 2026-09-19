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
        page: 1,
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
        todos: initialTodos,
        member,
        todoRequest: initialTodoRequest,
    } = loaderData;

    const [todos, setTodos] = useState(initialTodos);
    const [todoRequest, setTodoRequest] = useState(
        initialTodoRequest,
    );
    const [hasMore, setHasMore] = useState(
        initialTodos.length === initialTodoRequest.pageSize,
    );
    const [loadingMore, setLoadingMore] = useState(false);

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
        setTodos(initialTodos);
        setTodoRequest(initialTodoRequest);
        setHasMore(
            initialTodos.length === initialTodoRequest.pageSize,
        );
    }, [initialTodos, initialTodoRequest]);

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

    async function loadMore() {
    if (loadingMore || !hasMore) {
        return;
    }

    setLoadingMore(true);

    try {
        const nextPage = todoRequest.page + 1;

        const response = await getProjectTodosEndpoint(params.slug, {
            ...todoRequest,
            page: nextPage,
        });

        setTodos((current) => [
            ...current,
            ...response,
        ]);

        setTodoRequest((current) => ({
            ...current,
            page: nextPage,
        }));

        setHasMore(
            response.length === todoRequest.pageSize,
        );
    } finally {
        setLoadingMore(false);
    }
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
            <section className="project-header">
                <div className="project-information">
                    <h1>{project.name}</h1>
                    <p>
                        {project.description ||
                            "No project description."}
                    </p>
                </div>

                <aside className="project-actions">
                    <Link to={`/projects/${params.slug}/members`}>
                        Member List
                    </Link>

                    {canContribute(role) && (
                        <Link to={`/projects/${params.slug}/tasks/new`}>
                            New Task
                        </Link>
                    )}

                    {isAdmin(role) && (
                        <Link to={`/projects/${project.slug}/settings`}>
                            Settings
                        </Link>
                    )}

                    {isMember(role) ? (
                        <button type="button" onClick={handleLeave}>
                            Leave Project
                        </button>
                    ) : (
                        project.joinPolicy !== JoinPolicy.Closed && (
                            <button type="button" onClick={handleJoin}>
                                Join Project
                            </button>
                        )
                    )}
                </aside>
            </section>

            <section className="task-workspace">
                <div className="task-list-panel">
                    <div className="task-toolbar">
                        <form
                            className="task-search"
                            onSubmit={(event) => {
                                event.preventDefault();
                                submitSearch();
                            }}
                        >
                            <input
                                type="search"
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(event.target.value)
                                }
                                onKeyDown={handleSearchKeyDown}
                                placeholder="Search tasks"
                            />

                            <button
                                type="submit"
                                aria-label="Search"
                                title="Search"
                            >
                                ⌕
                            </button>
                        </form>

                        <select
                            value={todoRequest.sortBy}
                            onChange={(event) =>
                                changeSort(event.target.value)
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

                        <button
                            type="button"
                            className="task-sort-direction"
                            onClick={() =>
                                changeDescending(!todoRequest.descending)
                            }
                            aria-label={
                                todoRequest.descending
                                    ? "Sort ascending"
                                    : "Sort descending"
                            }
                            title={
                                todoRequest.descending
                                    ? "Ascending"
                                    : "Descending"
                            }
                        >
                            {todoRequest.descending ? "↓" : "↑"}
                        </button>
                    </div>

                    <nav
                        className="tabs task-status-tabs"
                        aria-label="Task status"
                    >
                        <button
                            type="button"
                            className={
                                todoRequest.status == null
                                    ? "tab active"
                                    : "tab"
                            }
                            onClick={() => changeStatus("")}
                        >
                            All
                        </button>

                        <button
                            type="button"
                            className={
                                todoRequest.status === TodoStatus.Backlog
                                    ? "tab active"
                                    : "tab"
                            }
                            onClick={() =>
                                changeStatus(
                                    TodoStatus.Backlog.toString(),
                                )
                            }
                        >
                            Backlog
                        </button>

                        <button
                            type="button"
                            className={
                                todoRequest.status === TodoStatus.InProgress
                                    ? "tab active"
                                    : "tab"
                            }
                            onClick={() =>
                                changeStatus(
                                    TodoStatus.InProgress.toString(),
                                )
                            }
                        >
                            In Progress
                        </button>

                        <button
                            type="button"
                            className={
                                todoRequest.status === TodoStatus.Completed
                                    ? "tab active"
                                    : "tab"
                            }
                            onClick={() =>
                                changeStatus(
                                    TodoStatus.Completed.toString(),
                                )
                            }
                        >
                            Completed
                        </button>

                        <button
                            type="button"
                            className={
                                todoRequest.status === TodoStatus.Archived
                                    ? "tab active"
                                    : "tab"
                            }
                            onClick={() =>
                                changeStatus(
                                    TodoStatus.Archived.toString(),
                                )
                            }
                        >
                            Archived
                        </button>
                    </nav>

                    <div className="task-list-header">
                        <span>#</span>
                        <span>Task</span>
                        <span>Status</span>
                    </div>

                    <div className="enclosed-list project-task-list">
                        {todos.length > 0 ? (
                            todos.map((todo: TodoDto) => (
                                <button
                                    key={todo.id}
                                    type="button"
                                    className={
                                        selectedTodoId === todo.id
                                            ? "enclosed-list-row project-task-row selected"
                                            : "enclosed-list-row project-task-row"
                                    }
                                    onClick={() =>
                                        setSelectedTodoId(todo.id)
                                    }
                                >
                                    <span className="project-task-issue">
                                        #{todo.issueNo}
                                    </span>

                                    <span className="project-task-title">
                                        {todo.title}
                                    </span>

                                    <span className="project-task-status">
                                        {getTodoStatusLabel(todo.status)}
                                    </span>
                                </button>
                            ))
                        ) : (
                            <div className="task-list-empty">
                                No matching tasks.
                            </div>
                        )}

                        <button
                            type="button"
                            className="project-task-load-more"
                            disabled={loadingMore || !hasMore}
                            onClick={loadMore}
                        >
                            {loadingMore
                                ? "Loading..."
                                : hasMore
                                ? "Load More"
                                : "No more tasks"}
                        </button>
                    </div>
                </div>

                <aside className="selected-task-panel">
                    {selectedTodo ? (
                        <>
                            <header className="selected-task-heading">
                                <div>
                                    <span>
                                        #{selectedTodo.issueNo}
                                    </span>

                                    <h2>{selectedTodo.title}</h2>
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
                                    {selectedTodo.assignedName ??
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
                            Select a task to view its details.
                        </div>
                    )}
                </aside>
            </section>
        </main>
    );
}