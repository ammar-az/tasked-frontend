import { useSyncExternalStore } from "react";
import { getConnectionState, getServerConnectionState, subscribeToAvailability } from "../api/availability";
import { DATABASE_WAKE_MESSAGE } from "../api/errors";

export function useConnectionMessage() {
    const connection = useSyncExternalStore(subscribeToAvailability, getConnectionState, getServerConnectionState);
    if (connection.status === "retrying") return DATABASE_WAKE_MESSAGE;
    if (connection.status === "failed") return "Connection to the database could not be established within 5 minutes. Check your connection or try again later.";
    return null;
}
