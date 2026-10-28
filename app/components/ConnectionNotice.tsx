import { useEffect, useRef, useSyncExternalStore } from "react";
import { useLocation, useNavigation, useRevalidator } from "react-router";
import { getConnectionState, getServerConnectionState, subscribeToAvailability } from "../api/availability";
import { DATABASE_WAKE_MESSAGE } from "../api/errors";
import { restoreSession } from "../auth/session";
import { checkConnection, startConnectionMonitor } from "../api/connection";

export default function ConnectionNotice() {
    const connection = useSyncExternalStore(subscribeToAvailability, getConnectionState, getServerConnectionState);
    const handledRecovery = useRef(0);
    const revalidator = useRevalidator();
    const navigation = useNavigation();
    const location = useLocation();

    useEffect(() => startConnectionMonitor(), []);

    useEffect(() => {
        if (connection.status !== "connected" || connection.recovery <= handledRecovery.current) return;
        handledRecovery.current = connection.recovery;
        async function recover() {
            try {
                await restoreSession();
                await revalidator.revalidate();
            } catch { /* Monitoring continues for transient failures. */ }
        }
        void recover();
    }, [connection.status, connection.recovery, revalidator]);

    if (connection.status !== "retrying" && connection.status !== "failed") {
        return navigation.state === "idle" ? null : (
            <div className="navigation-progress" role="status">Opening page…</div>
        );
    }
    // Authentication forms show connection feedback in their own error box.
    if (location.pathname === "/login" || location.pathname === "/register") {
        return navigation.state === "idle" ? null : (
            <div className="navigation-progress" role="status">Opening page…</div>
        );
    }
    return (
        <aside className="connection-notice" role="status" aria-live="polite">
            <p>{connection.status === "failed"
                ? "Connection to the database could not be established within 5 minutes. Check your connection or try again later."
                : DATABASE_WAKE_MESSAGE}</p>
            {connection.status === "failed" && (
                <button type="button" onClick={() => { void checkConnection(); }}>Reconnect</button>
            )}
        </aside>
    );
}
