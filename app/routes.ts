import {
    index,
    route,
    type RouteConfig,
} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),

    route(
        "projects/:projectId",
        "routes/project.tsx",
    ),

    route(
        "projects/:projectId/tasks/:issueNo",
        "routes/task.tsx",
    ),

    route(
        "projects/:projectId/tasks/new",
        "routes/todo.tsx",
    ),

    route(
        "projects/:projectId/members/",
        "routes/members.tsx",
    ),

    route(
        "users/:username",
        "routes/user.tsx",
    ),

    route(
        "login",
        "routes/login.tsx",
    ),

    route(
        "register",
        "routes/register.tsx",
    ),

    route(
        "myaccount",
        "routes/account.tsx",
    ),

    route(
        "create",
        "routes/create.tsx",
    ),

    route("*", "./routes/not-found.tsx")
] satisfies RouteConfig;
