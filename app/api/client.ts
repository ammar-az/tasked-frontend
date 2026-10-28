import { getAccessToken } from "../auth/tokenStore";
import { prepareSessionForRequest } from "../auth/session";
import api from "./transport";

api.interceptors.request.use(async (config) => {
    // Loaders can run before AuthProvider mounts. Share its refresh before
    // requesting data so a pending session isn't mistaken for a signed-out one.
    if (!config.url?.startsWith("/auth/") || config.url === "/auth/me") {
        await prepareSessionForRequest();
    }
    const token = getAccessToken();

    if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
});

export default api;
