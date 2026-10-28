export const CONNECTION_RECOVERY_TIMEOUT = 300_000;
export const CONNECTION_RETRY_DELAY = 5000;

type ConnectionState = {
    status: "checking" | "connected" | "retrying" | "failed";
    recovery: number;
};
const initialState: ConnectionState = { status: "checking", recovery: 0 };
let state = initialState;
const listeners = new Set<() => void>();

export const getConnectionState = () => state;
export const getServerConnectionState = () => initialState;

export function isDatabaseUnavailable() {
    return state.status === "retrying" || state.status === "failed";
}

export function subscribeToAvailability(listener: () => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
}

export function setDatabaseUnavailable(value: boolean) {
    const status = value ? (state.status === "failed" ? "failed" : "retrying") : "connected";
    if (state.status === status) return;
    state = { status, recovery: state.recovery + (!value && isDatabaseUnavailable() ? 1 : 0) };
    listeners.forEach((listener) => listener());
}

export function setConnectionFailed() {
    state = { ...state, status: "failed" };
    listeners.forEach((listener) => listener());
}

export function beginConnectionCheck() {
    state = { ...state, status: "checking" };
    listeners.forEach((listener) => listener());
}
