import type { AuthResponse } from "../types/auth-types";
import transport from "../api/transport";
import { isApiUnavailable, isUnauthorized } from "../api/errors";
import { setDatabaseUnavailable } from "../api/availability";
import { setAccessToken } from "./tokenStore";
import { AxiosError } from "axios";
import { CONNECTION_RECOVERY_TIMEOUT, CONNECTION_RETRY_DELAY, isDatabaseUnavailable } from "../api/availability";
import { DATABASE_WAKE_MESSAGE } from "../api/errors";

export const SESSION_WAKE_TIMEOUT = CONNECTION_RECOVERY_TIMEOUT;
const RETRY_DELAY = CONNECTION_RETRY_DELAY;

type SessionState = {
    token: AuthResponse["token"] | null;
    user: AuthResponse["user"] | null;
    status: "restoring" | "authenticated" | "anonymous" | "unavailable";
};

const initialSession: SessionState = { token: null, user: null, status: "restoring" };
let session = initialSession;
let refreshPromise: Promise<void> | null = null;
let version = 0;
const listeners = new Set<() => void>();

export const getSession = () => session;
export const getServerSession = () => initialSession;

export function subscribeToSession(listener: () => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
}

function publish(next: SessionState) {
    session = next;
    setAccessToken(next.token);
    listeners.forEach((listener) => listener());
}

export function setSession(auth: AuthResponse | null) {
    version++;
    publish(auth
        ? { ...auth, status: "authenticated" }
        : { token: null, user: null, status: "anonymous" });
}

export async function waitForPendingRefresh(): Promise<void> {
    if (isDatabaseUnavailable()) {
        throw new AxiosError(DATABASE_WAKE_MESSAGE, "ECONNABORTED");
    }
    // Login and logout also change the cookie. Finish a pending rotation first
    // so its response cannot overwrite the cookie for the user's newer action.
    if (!refreshPromise) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
        await Promise.race([
            refreshPromise,
            new Promise<never>((_, reject) => {
                timer = setTimeout(() => {
                    setDatabaseUnavailable(true);
                    reject(new AxiosError(DATABASE_WAKE_MESSAGE, "ECONNABORTED"));
                }, 1000);
            }),
        ]);
    } finally {
        clearTimeout(timer);
    }
}

export async function prepareSessionForRequest() {
    if (session.token || session.status === "anonymous") return;
    // Keep restoration running, but don't hold navigation or forms for minutes.
    void restoreSession().catch(() => undefined);
    await waitForPendingRefresh();
}

export function restoreSession(force = false): Promise<void> {
    if (refreshPromise) return refreshPromise;
    if (!force && (session.status === "authenticated" || session.status === "anonymous")) {
        return Promise.resolve();
    }

    const startedVersion = version;
    const deadline = Date.now() + SESSION_WAKE_TIMEOUT;
    publish({ ...session, status: "restoring" });

    // The server rotates this cookie. Keep refresh alive during a cold start
    // rather than losing the replacement cookie by aborting after five seconds.
    refreshPromise = (async () => {
        while (true) {
            try {
                const response = await transport.post<AuthResponse>("/auth/refresh", undefined, {
                    timeout: Math.max(1, deadline - Date.now()),
                });
                if (version === startedVersion) setSession(response.data);
                return;
            } catch (error) {
                if (version !== startedVersion) return;
                if (isUnauthorized(error)) {
                    setSession(null);
                    setDatabaseUnavailable(false);
                    return;
                }
                if (isApiUnavailable(error) && Date.now() + RETRY_DELAY < deadline) {
                    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
                    if (version !== startedVersion) return;
                    continue;
                }
                // Temporary failures do not invalidate a session or its cookie.
                publish({ ...session, status: "unavailable" });
                throw error;
            }
        }
    })().finally(() => {
        refreshPromise = null;
    });

    return refreshPromise;
}
