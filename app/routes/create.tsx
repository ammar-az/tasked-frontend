import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { JoinPolicy, ProjectRequest } from "../types/project-types";
import { createProjectEndpoint } from "../api/projects";

import "./create.css";

// type JoinPolicy =
//     | "Open"
//     | "Viewer"
//     | "InviteOnly"
//     | "Closed";


export default function CreateProjectPage() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [createForOrganization, setCreateForOrganization] = useState(false);
    const [visibility, setVisibility] = useState(true);
    const [joinPolicy, setJoinPolicy] = useState<JoinPolicy>(JoinPolicy.Open);

    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Replace this with a value from the current user/auth data.
    const canCreateOrganizationProject = false;

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmedName = name.trim();
        const trimmedDescription = description.trim();

        if (!trimmedName) {
            setError("A project name is required.");
            return;
        }

        const request: ProjectRequest = {
            name: trimmedName,
            description: trimmedDescription,
            org: createForOrganization,
            visible: visibility,
            joinPolicy: joinPolicy,
        };
        
        console.log

        try {
            setIsSubmitting(true);
            setError(null);
        
            const project = await createProjectEndpoint(request);
            navigate(`/projects/${project.id}`);
            
            console.log("Create project:", request);
        } catch {
            setError("The project could not be created.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="create-project-page">
            <button
                type="button"
                className="create-project-back"
                onClick={() => navigate(-1)}
                aria-label="Go back"
            >
                ←
            </button>

            <form
                className="create-project-form"
                onSubmit={handleSubmit}
            >
                <h1>Create New Project</h1>

                <label className="create-project-name">
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

                <div className="create-project-options-row">
                    <fieldset className="create-project-option-group">
                        <legend>Create as organization project?</legend>

                        <label>
                            <input
                                type="radio"
                                name="organization-project"
                                checked={!createForOrganization}
                                onChange={() =>
                                    setCreateForOrganization(false)
                                }
                            />

                            No
                        </label>

                        <label>
                            <input
                                type="radio"
                                name="organization-project"
                                checked={createForOrganization}
                                disabled={
                                    !canCreateOrganizationProject
                                }
                                onChange={() =>
                                    setCreateForOrganization(true)
                                }
                            />

                            Yes
                        </label>
                    </fieldset>

                    <fieldset className="create-project-option-group">
                        <legend>Visibility</legend>

                        <label>
                            <input
                                type="radio"
                                name="visibility"
                                checked={visibility === true}
                                onChange={() =>
                                    setVisibility(true)
                                }
                            />

                            Public
                        </label>

                        <label>
                            <input
                                type="radio"
                                name="visibility"
                                checked={visibility === false}
                                onChange={() =>
                                    setVisibility(false)
                                }
                            />

                            Private
                        </label>
                    </fieldset>
                </div>

                <fieldset className="create-project-join-policy">
                    <legend>Configure join policy</legend>

                    <label>
                        <input
                            type="radio"
                            name="join-policy"
                            checked={joinPolicy === JoinPolicy.Open}
                            onChange={() =>
                                setJoinPolicy(JoinPolicy.Open)
                            }
                        />

                        Open
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="join-policy"
                            checked={joinPolicy === JoinPolicy.ViewOnly}
                            onChange={() =>
                                setJoinPolicy(JoinPolicy.ViewOnly)
                            }
                        />

                        Join as Viewer
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="join-policy"
                            checked={joinPolicy === JoinPolicy.InviteOnly}
                            onChange={() =>
                                setJoinPolicy(JoinPolicy.InviteOnly)
                            }
                        />

                        Invite Only
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="join-policy"
                            checked={joinPolicy === JoinPolicy.Closed}
                            onChange={() =>
                                setJoinPolicy(JoinPolicy.Closed)
                            }
                        />

                        Closed
                    </label>
                </fieldset>

                <label className="create-project-description">
                    <span>Description</span>

                    <textarea
                        value={description}
                        onChange={(event) =>
                            setDescription(event.target.value)
                        }
                        placeholder="Describe the project"
                        maxLength={2000}
                    />
                </label>

                {error && (
                    <p className="create-project-error">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    className="create-project-submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting
                        ? "Creating..."
                        : "Create Project"}
                </button>
            </form>
        </main>
    );
}