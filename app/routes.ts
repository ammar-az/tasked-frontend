import {
    index,
    layout,
    route,
    type RouteConfig,
} from "@react-router/dev/routes";

export default [
    layout("./layouts/main-layout.tsx", [
        index("./pages/home.tsx"),

        route(
            "projects/:projectId",
            "./pages/projects/project.tsx",
        ),

        route(
            "projects/:projectId/task/:issueNo",
            "./pages/todos/todo.tsx",
        ),

        route(
            "users/:username",
            "./pages/users/user.tsx",
        ),

        route(
            "login",
            "./pages/login.tsx",
        ),

        route(
            "register",
            "./pages/register.tsx",
        ),

        route(
            "myaccount",
            "./pages/account.tsx",
        ),

        route("*", "./pages/not-found.tsx"),
    ]),
] satisfies RouteConfig;