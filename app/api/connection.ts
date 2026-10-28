import axios from "axios";
import {
    CONNECTION_RECOVERY_TIMEOUT, CONNECTION_RETRY_DELAY, beginConnectionCheck,
    getConnectionState, setConnectionFailed, setDatabaseUnavailable, subscribeToAvailability,
} from "./availability";

// Independent of authentication: probing must never wait for cookie rotation.
export const connectionProbe = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 5000,
    withCredentials: true,
});

let connectionPromise: Promise<void> | null = null;

export function checkConnection(): Promise<void> {
    if (connectionPromise) return connectionPromise;
    if (getConnectionState().status === "failed") beginConnectionCheck();
    const deadline = Date.now() + CONNECTION_RECOVERY_TIMEOUT;
    const noticeTimer = setTimeout(() => {
        if (getConnectionState().status === "checking") setDatabaseUnavailable(true);
    }, 1500);

    connectionPromise = (async () => {
        while (Date.now() < deadline) {
            try {
                // This public endpoint queries the database and has no side effects.
                await connectionProbe.get("/orgs", {
                    params: { page: 1, pageSize: 1 },
                    timeout: Math.min(5000, deadline - Date.now()),
                });
                setDatabaseUnavailable(false);
                return;
            } catch {
                // Another successful application request can establish readiness.
                if (getConnectionState().status === "connected") return;
                setDatabaseUnavailable(true);
            }
            const remaining = deadline - Date.now();
            if (remaining > 0) {
                await new Promise((resolve) => setTimeout(resolve, Math.min(CONNECTION_RETRY_DELAY, remaining)));
            }
            if (getConnectionState().status === "connected") return;
        }
        setConnectionFailed();
    })().finally(() => {
        clearTimeout(noticeTimer);
        connectionPromise = null;
    });
    return connectionPromise;
}

export function startConnectionMonitor() {
    const unsubscribe = subscribeToAvailability(() => {
        if (getConnectionState().status === "retrying") void checkConnection();
    });
    void checkConnection();
    return unsubscribe;
}
