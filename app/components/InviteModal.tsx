import { useEffect, useState } from "react";

import type { MemberOverviewDto, MemberOverviewRequest } from "../types/membership-types";
import { getMemberRoleLabel} from "../utils/enum-helpers";
import { getUserProjectsEndpoint } from "../api/users";

import "./selection-modal.css";
import { useAuth } from "../auth/AuthContext";

interface InviteProjectModalProps {
    userId: string;
    onClose: () => void;
    onInvite: (project: MemberOverviewDto) => Promise<void>;
}

export default function InviteProjectModal({
    userId,
    onClose,
    onInvite,
}: InviteProjectModalProps) {
    const [search, setSearch] = useState("");
    const [projects, setProjects] = useState<MemberOverviewDto[]>([]);
    const [selectedProject, setSelectedProject] =
        useState<MemberOverviewDto | null>(null);

    const [loading, setLoading] = useState(false);
    const [inviting, setInviting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {user} = useAuth();
    useEffect(() => {
        let cancelled = false;

        async function loadProjects() {
            try {
                setLoading(true);
                setError(null);

                const request: MemberOverviewRequest = {
                    search: search.trim() || undefined,
                    role: undefined,
                    owner: false,
                    sort: "projectName",
                    descending: false,
                    page: 1,
                    pageSize: 20,
                };

                //Need to allow for searching owner+admin here or do two at a time
                const result =
                    await getUserProjectsEndpoint(
                        user!.id,
                        request,
                    );

                if (!cancelled) {
                    setProjects(result);
                }
            } catch {
                if (!cancelled) {
                    setError(
                        "Unable to load your projects.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadProjects();

        return () => {
            cancelled = true;
        };
    }, [userId, search]);

    async function handleInvite() {
        if (!selectedProject) {
            return;
        }

        try {
            setInviting(true);
            setError(null);

            await onInvite(selectedProject);

            onClose();
        } catch {
            setError(
                "Unable to send the project invite.",
            );
        } finally {
            setInviting(false);
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
                aria-labelledby="invite-project-title"
            >
                <button
                    type="button"
                    className="selection-modal-close"
                    onClick={onClose}
                    aria-label="Close"
                >
                    ×
                </button>

                <h2 id="invite-project-title">
                    Invite to Project
                </h2>

                <input
                    type="search"
                    className="selection-modal-search"
                    placeholder="Search projects..."
                    value={search}
                    onChange={(event) =>
                        setSearch(event.target.value)
                    }
                    autoFocus
                />

                <div className="selection-modal-results">
                    {loading && (
                        <p className="selection-modal-message">
                            Loading projects...
                        </p>
                    )}

                    {!loading &&
                        projects.length === 0 && (
                            <p className="selection-modal-message">
                                No projects found.
                            </p>
                        )}

                    {!loading &&
                        projects.map((project) => {
                            const selected =
                                selectedProject?.projectId ===
                                project.projectId;

                            return (
                                <button
                                    type="button"
                                    key={project.projectId}
                                    className={`selection-modal-item ${
                                        selected
                                            ? "selected"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setSelectedProject(
                                            project,
                                        )
                                    }
                                >
                                    <span>
                                        {project.projectName}
                                    </span>

                                    <span className="selection-modal-role">
                                        {getMemberRoleLabel(
                                            project.role,
                                        )}
                                    </span>
                                </button>
                            );
                        })}
                </div>

                {error && (
                    <p className="selection-modal-error">
                        {error}
                    </p>
                )}

                <div className="selection-modal-footer">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={inviting}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        disabled={
                            selectedProject === null ||
                            inviting
                        }
                        onClick={handleInvite}
                    >
                        {inviting
                            ? "Inviting..."
                            : "Invite"}
                    </button>
                </div>
            </section>
        </div>
    );
}