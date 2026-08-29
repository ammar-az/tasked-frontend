import {
    useEffect,
    useState,
    type FormEvent,
} from "react";
import {
    useNavigate,
    useRevalidator,
} from "react-router";

import type { Route } from "./+types/settings";

import {
    getProjectEndpoint,
    editProjectEndpoint,
    deleteProjectEndpoint,
    projectToOrgEndpoint,
    projectLeaveOrgEndpoint,
} from "../api/projects";

import { getMemberEndpoint } from "../api/projects";

import {
    JoinPolicy,
    ProjectUpdateRequest,
    type ProjectDto,
} from "../types/project-types";

import {
    MemberRole,
    type MemberOverviewDto,
} from "../types/membership-types";

import "./settings.css";
import { isAdmin } from "../utils/enum-helpers";

export async function clientLoader({
    params,
}: Route.ClientLoaderArgs): Promise<{
    project: ProjectDto;
    member: MemberOverviewDto;
}> {
    if (!params.slug) {
        throw new Response("Project ID is required", {
            status: 400,
        });
    }

    try{
        const [project, member] = await Promise.all([
            getProjectEndpoint(params.slug),
            getMemberEndpoint(params.slug),
        ]);

        const canEditProject = isAdmin(member.role);

        if (!canEditProject) {
            throw new Response("You cannot edit this project.", {
                status: 403,
            });
        }

        return {
            project,
            member,
        };
    }catch{
        throw new Response("This project doesn't exist or you don't have permission to view it.", {
            status: 404,
        });
    }
}

export default function ProjectSettingsPage({
    loaderData,
}: Route.ComponentProps) {
    const { project, member } = loaderData;

    const navigate = useNavigate();
    const revalidator = useRevalidator();

    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(
        project.description ?? "",
    );
    const [isVisible, setIsVisible] = useState(
        project.isVisible,
    );
    const [joinPolicy, setJoinPolicy] =
        useState<JoinPolicy>(project.joinPolicy);

    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(
        null,
    );

    const [isSaving, setIsSaving] = useState(false);
    const [isUpdatingOrganization, setIsUpdatingOrganization] =
        useState(false);

    const [showDeleteConfirmation, setShowDeleteConfirmation] =
        useState(false);
    const [deleteConfirmation, setDeleteConfirmation] =
        useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const isOwner = member.role === MemberRole.Owner;
    const isOrganizationProject =
        project.orgId !== undefined &&
        project.orgId !== null;

    useEffect(() => {
        setName(project.name);
        setDescription(project.description ?? "");
        setIsVisible(project.isVisible);
        setJoinPolicy(project.joinPolicy);
    }, [project]);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const trimmedName = name.trim();
        const trimmedDescription = description.trim();

        if (!trimmedName) {
            setError("A project name is required.");
            return;
        }

        const request: ProjectUpdateRequest = {
            name: trimmedName,
            description:
                trimmedDescription || undefined,
            isVisible,
            joinPolicy,
        };

        try {
            setIsSaving(true);
            setError(null);
            setMessage(null);

            await editProjectEndpoint(
                project.id,
                request,
            );

            setMessage("Project changes saved.");

            await revalidator.revalidate();
        } catch {
            setError("The project could not be updated.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleOrganizationChange() {
        if (!isOwner) {
            return;
        }

        try {
            setIsUpdatingOrganization(true);
            setError(null);
            setMessage(null);

            if (isOrganizationProject) {
                await projectLeaveOrgEndpoint(
                    project.id,
                );

                setMessage(
                    "Project removed from the organization.",
                );
            } else {
                await projectToOrgEndpoint(
                    project.id,
                );

                setMessage(
                    "Project added to your organization.",
                );
            }

            await revalidator.revalidate();
        } catch {
            setError(
                isOrganizationProject
                    ? "The project could not be removed from the organization."
                    : "The project could not be added to your organization.",
            );
        } finally {
            setIsUpdatingOrganization(false);
        }
    }

    async function handleDeleteProject() {
        if (
            !isOwner ||
            deleteConfirmation !== project.name
        ) {
            return;
        }

        try {
            setIsDeleting(true);
            setError(null);

            await deleteProjectEndpoint(project.id);

            navigate("/myaccount?view=owned", {
                replace: true,
            });
        } catch {
            setError("The project could not be deleted.");
            setIsDeleting(false);
        }
    }

    return (
        <main className = "page-layout">
            <div className = "page-side">
                <button
                        type="button"
                        className="back-button"
                        onClick={() =>
                            navigate(`/projects/${project.slug}`)
                        }
                        aria-label="Back to project"
                    >
                        ←
                    </button>
            </div>
                
            <div className="page-main">
                <form
                    className="form"
                    onSubmit={handleSubmit}
                >
                    <h1>Project Settings</h1>

                    <p className="project-settings-role">
                        Your role:{" "}
                        <strong>
                            {isOwner ? "Owner" : "Admin"}
                        </strong>
                    </p>

                    <label className="form-name">
                        <span>Project name</span>

                        <input
                            type="text"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            maxLength={100}
                            required
                        />
                    </label>

                    <fieldset className="form-option-group form-option-group-2">
                        <legend>Visibility</legend>

                        <label>
                            <input
                                type="radio"
                                name="visibility"
                                checked={isVisible}
                                onChange={() =>
                                    setIsVisible(true)
                                }
                            />

                            Public
                        </label>

                        <label>
                            <input
                                type="radio"
                                name="visibility"
                                checked={!isVisible}
                                onChange={() =>
                                    setIsVisible(false)
                                }
                            />

                            Private
                        </label>
                    </fieldset>

                    <fieldset className="form-option-group form-option-group-4 ">
                        <legend>Configure join policy</legend>

                        <label>
                            <input
                                type="radio"
                                name="join-policy"
                                checked={
                                    joinPolicy === JoinPolicy.Open
                                }
                                onChange={() =>
                                    setJoinPolicy(
                                        JoinPolicy.Open,
                                    )
                                }
                            />

                            Open
                        </label>

                        <label>
                            <input
                                type="radio"
                                name="join-policy"
                                checked={
                                    joinPolicy ===
                                    JoinPolicy.ViewOnly
                                }
                                onChange={() =>
                                    setJoinPolicy(
                                        JoinPolicy.ViewOnly,
                                    )
                                }
                            />

                            Join as Viewer
                        </label>

                        <label>
                            <input
                                type="radio"
                                name="join-policy"
                                checked={
                                    joinPolicy ===
                                    JoinPolicy.InviteOnly
                                }
                                onChange={() =>
                                    setJoinPolicy(
                                        JoinPolicy.InviteOnly,
                                    )
                                }
                            />

                            Invite Only
                        </label>

                        <label>
                            <input
                                type="radio"
                                name="join-policy"
                                checked={
                                    joinPolicy === JoinPolicy.Closed
                                }
                                onChange={() =>
                                    setJoinPolicy(
                                        JoinPolicy.Closed,
                                    )
                                }
                            />

                            Closed
                        </label>
                    </fieldset>

                    <label className="form-description">
                        <span>Description</span>

                        <textarea
                            value={description}
                            onChange={(event) =>
                                setDescription(
                                    event.target.value,
                                )
                            }
                            placeholder="Describe the project"
                            maxLength={2000}
                        />
                    </label>

                    {error && (
                        <p className="error">
                            {error}
                        </p>
                    )}

                    {message && (
                        <p className="message">
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={isSaving}
                    >
                        {isSaving
                            ? "Saving..."
                            : "Save Changes"}
                    </button>

                    {isOwner && (
                        <section className="panel">
                            <h2>Owner Settings</h2>

                            <div className="project-organization-setting">
                                <div>
                                    <h3>Organization</h3>

                                    <p>
                                        {isOrganizationProject
                                            ? "This project currently belongs to an organization."
                                            : "This project is currently a personal project."}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        handleOrganizationChange
                                    }
                                    disabled={
                                        isUpdatingOrganization
                                    }
                                >
                                    {isUpdatingOrganization
                                        ? "Updating..."
                                        : isOrganizationProject
                                        ? "Remove from Organization"
                                        : "Add to My Organization"}
                                </button>
                            </div>
                        </section>
                    )}

                    {isOwner && (
                        <section className="panel panel-danger">
                            <h2>Danger Zone</h2>

                            <p>
                                Deleting a project permanently
                                removes the project and its related
                                data.
                            </p>

                            {!showDeleteConfirmation ? (
                                <button
                                    type="button"
                                    className="danger-button"
                                    onClick={() =>
                                        setShowDeleteConfirmation(
                                            true,
                                        )
                                    }
                                >
                                    Delete Project
                                </button>
                            ) : (
                                <div className="project-delete-confirmation">
                                    <label>
                                        <span>
                                            Enter{" "}
                                            <strong>
                                                {project.name}
                                            </strong>{" "}
                                            to confirm.
                                        </span>

                                        <input
                                            type="text"
                                            value={
                                                deleteConfirmation
                                            }
                                            onChange={(event) =>
                                                setDeleteConfirmation(
                                                    event.target
                                                        .value,
                                                )
                                            }
                                            autoComplete="off"
                                        />
                                    </label>

                                    <div className="project-delete-actions">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowDeleteConfirmation(
                                                    false,
                                                );
                                                setDeleteConfirmation(
                                                    "",
                                                );
                                            }}
                                            disabled={isDeleting}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="button"
                                            className="danger-button"
                                            disabled={
                                                isDeleting ||
                                                deleteConfirmation !==
                                                    project.name
                                            }
                                            onClick={
                                                handleDeleteProject
                                            }
                                        >
                                            {isDeleting
                                                ? "Deleting..."
                                                : "Permanently Delete Project"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}
                </form>
            </div>
            <div className = "page-side"></div>
        </main>
    );
}