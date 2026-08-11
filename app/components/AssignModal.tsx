import { useEffect, useState } from "react";
import { getMembersEndpoint } from "../api/projects";
import {
    MemberRole,
    type MemberDto,
    type MemberOverviewRequest,
} from "../types/membership-types";


import "./selection-modal.css";
import { getMemberRoleLabel } from "../utils/enum-helpers";

interface AssignTaskModalProps {
    todoId: string;
    projectSlug: string;
    onClose: () => void;
    onAssign: (member: MemberDto) => Promise<void>;
}

export default function AssignTaskModal({
    todoId,
    projectSlug,
    onClose,
    onAssign,
}: AssignTaskModalProps) {
    const [search, setSearch] = useState("");
    const [members, setMembers] = useState<MemberDto[]>([]);
    const [selectedMember, setSelectedMember] =
        useState<MemberDto | null>(null);

    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [error, setError] = useState<string | null>(null);

        useEffect(() => {
            let cancelled = false;
    
            async function loadMembers() {
                try {
                    setLoading(true);
                    setError(null);
    
                    const request: MemberOverviewRequest = {
                        search: search.trim() || undefined,
                        role: MemberRole.Contributor,
                        owner: false,
                        sort: "name",
                        descending: false,
                        page: 1,
                        pageSize: 20,
                    };
    
                    //Need to allow for searching owner+admin+contributor here or do multiple
                    const result =
                        await getMembersEndpoint(
                            projectSlug,
                            request,
                        );
    
                    if (!cancelled) {
                        setMembers(result);
                    }
                } catch {
                    if (!cancelled) {
                        setError(
                            "Unable to load project members.",
                        );
                    }
                } finally {
                    if (!cancelled) {
                        setLoading(false);
                    }
                }
            }
    
            loadMembers();
    
            return () => {
                cancelled = true;
            };
        }, [todoId, search]);

        async function handleAssign() {
        if (!selectedMember) {
            return;
        }

        try {
            setAssigning(true);
            setError(null);

            await onAssign(selectedMember);

            onClose();
        } catch {
            setError(
                "Unable to assign the task",
            );
        } finally {
            setAssigning(false);
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
                            members.length === 0 && (
                                <p className="selection-modal-message">
                                    No members found.
                                </p>
                            )}
    
                        {!loading &&
                            members.map((member) => {
                                const selected =
                                    selectedMember?.userId ===
                                    member.userId;
    
                                return (
                                    <button
                                        type="button"
                                        key={member.projectId}
                                        className={`selection-modal-item ${
                                            selected
                                                ? "selected"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setSelectedMember(
                                                member,
                                            )
                                        }
                                    >
                                        <span>
                                            {member.username}
                                        </span>
    
                                        <span className="selection-modal-role">
                                            {getMemberRoleLabel(
                                                member.role,
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
                            disabled={assigning}
                        >
                            Cancel
                        </button>
    
                        <button
                            type="button"
                            disabled={
                                selectedMember === null ||
                                assigning
                            }
                            onClick={handleAssign}
                        >
                            {assigning
                                ? "assigning..."
                                : "Assign"}
                        </button>
                    </div>
                </section>
            </div>
        );
}