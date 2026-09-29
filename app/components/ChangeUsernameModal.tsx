import { useState } from "react";

import "./selection-modal.css";
import { updateUserEndpoint } from "../api/users";
import axios from "axios";


interface ChangeUsernameModalProps {
    currentUsername: string;
    onClose: () => void;
}

export default function ChangeUsernameModal({
    currentUsername,
    onClose,
}: ChangeUsernameModalProps) {
    const [username, setUsername] = useState(currentUsername);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const trimmedUsername = username.trim();

    const canSubmit =
        trimmedUsername.length > 0 &&
        trimmedUsername !== currentUsername &&
        !submitting;

    async function handleSubmit() {
        if (!canSubmit) {
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            await updateUserEndpoint({username: trimmedUsername});

            onClose();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    setError(error.response.data ?? "Name change failed.");
                } else {
                    setError("Could not reach the api. Ensure you are connected to the internet and try again.");
                }
            } else {
                setError("An unexpected error occurred.");
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div
            className="selection-modal-backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <section
                className="selection-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="change-username-title"
            >
                <button
                    type="button"
                    className="selection-modal-close"
                    onClick={onClose}
                    aria-label="Close"
                    disabled={submitting}
                >
                    ×
                </button>

                <h2 id="change-username-title">
                    Change Username
                </h2>

                <label htmlFor="new-username">
                    new username
                </label>

                <input
                    id="new-username"
                    type="text"
                    className="selection-modal-search"
                    value={username}
                    onChange={(event) => {
                        setUsername(event.target.value);
                        setError(null);
                    }}
                    autoFocus
                    disabled={submitting}
                />

                {error && (
                    <p className="error">
                        {error}
                    </p>
                )}

                <div className="selection-modal-footer">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        disabled={!canSubmit}
                        onClick={handleSubmit}
                    >
                        {submitting ? "Saving..." : "Submit"}
                    </button>
                </div>
            </section>
        </div>
    );
}