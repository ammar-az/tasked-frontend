import type { Route } from "./+types/demo";

import { getProjectEndpoint, getProjectTodosEndpoint, getMemberEndpoint, createDemoEndpoint } from "../api/projects";
import { MultiTodoRequest, TodoSort } from "../types/todo-types";
import { parseTodoStatus, parseTodoSort } from "../utils/enum-helpers";

import {ProjectPageData, ProjectView} from "./project"
import { getMe } from "../api/auth";
import { useNavigate, useRevalidator } from "react-router";

import "./demo.css";

export async function clientLoader({
    request,
}: Route.ClientLoaderArgs) {
    var user;
    try{
        user = await getMe();
    }catch{
        user = null;
    }
    const slug = user == null
        ? "explore-tasked"
        : `explore-tasked-${user.id}`;

    const url = new URL(request.url);

    const todoRequest: MultiTodoRequest = {
        search: url.searchParams.get("search")?.trim() || undefined,
        status: parseTodoStatus(url.searchParams.get("status")),
        assigned: url.searchParams.get("assigned")?.trim() || undefined,
        sortBy: parseTodoSort(url.searchParams.get("sort")) ?? TodoSort.IssueNo,
        descending: url.searchParams.get("descending") === "true",
        page: 1,
        pageSize: Math.min(
            100,
            Math.max(1, Number(url.searchParams.get("pageSize") ?? 20))
        ),
    };

    var project;
    
    try{
        project = await getProjectEndpoint(slug);
    } catch {
        return null;
    }

    try {
        const [todos, member] = await Promise.all([
            getProjectTodosEndpoint(slug, todoRequest),
            getMemberEndpoint(slug),
        ]);

        return {
            project,
            todos,
            member,
            todoRequest,
        };
    } catch {
        throw new Response("Demo could not be loaded.", {
            status: 404,
        });
    }
}

interface DemoEntryPageProps {
    onStart: () => void;
}

export function DemoEntryPage({
    onStart,
}: DemoEntryPageProps) {
    const navigate = useNavigate();
    return (
        <main className="demo-entry-page">
            <div className="demo-entry-content">
                <h1>It seems like you haven't started exploring Tasked</h1>

                <div className="demo-entry-actions">
                    <button onClick={() => navigate("/projects/explore-tasked")} >
                        Check it out
                    </button>

                    <button type="button" onClick={onStart}>
                        Start exploring
                    </button>
                </div>
            </div>
        </main>
    );
}

export default function DemoPage({
    loaderData,
}: {
    loaderData: ProjectPageData | null;
}) {    
    const revalidator = useRevalidator();

    async function handleStartDemo(){
        await createDemoEndpoint();
        revalidator.revalidate();
    }

    if(loaderData === null)
        return (
            <DemoEntryPage onStart={(handleStartDemo)} />
        );

    else 
        return (
            <ProjectView
                loaderData={loaderData}
            />
        );
}
