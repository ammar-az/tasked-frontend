import {
    index,
    route,
    type RouteConfig,
} from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),

    route(
        "projects/:slug",
        "routes/project.tsx",
    ),

    route(
        "projects/:slug/tasks/:issueNo",
        "routes/task.tsx",
    ),

    route(
        "projects/:slug/tasks/new",
        "routes/new-task.tsx",
    ),

    route(
        "projects/:slug/members/",
        "routes/members.tsx",
    ),

    route(
        "projects/:slug/settings/",
        "routes/settings.tsx",
    ),

    route(
        "users/:username",
        "routes/user.tsx",
    ),

    route(
        "orgs",
        "routes/orgs.tsx",
    ),

    route(
        "orgs/:orgId",
        "routes/org.tsx",
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
