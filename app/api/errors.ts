import axios from "axios";

export const DATABASE_WAKE_MESSAGE =
    "The database is currently paused or resuming, it can take up to 2 minutes to wake up.\n\n The page will automatically refresh once a connection is established.";

export function isApiUnavailable(error: unknown): boolean {
    return axios.isAxiosError(error) && !axios.isCancel(error) &&
        (!error.response || error.response.status >= 500);
}

export function isUnauthorized(error: unknown): boolean {
    return axios.isAxiosError(error) && error.response?.status === 401;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
    if (isApiUnavailable(error)) return DATABASE_WAKE_MESSAGE;
    if (axios.isAxiosError(error) && typeof error.response?.data === "string" && error.response.data) {
        return error.response.data;
    }
    return fallback;
}
