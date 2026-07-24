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
        "projects/:projectId/task/:issueNo",
        "routes/todo.tsx",
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

    route("*", "./routes/not-found.tsx")
] satisfies RouteConfig;
