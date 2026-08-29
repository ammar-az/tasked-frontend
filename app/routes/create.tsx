import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { JoinPolicy, ProjectRequest } from "../types/project-types";
import { createProjectEndpoint } from "../api/projects";
import { useAuth } from "../auth/AuthContext";

import "./create.css";

export default function CreateProjectPage() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [createForOrganization, setCreateForOrganization] = useState(false);
    const [visibility, setVisibility] = useState(true);
    const [joinPolicy, setJoinPolicy] = useState<JoinPolicy>(JoinPolicy.Open);

    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {user, isAuthenticated} = useAuth();

    useEffect(() => {
        if(!isAuthenticated){
            navigate("/login");
        }
    });

    const canCreateOrganizationProject = user?.orgId != null;

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
            isVisible: visibility,
            joinPolicy: joinPolicy,
        };
        
        try {
            setIsSubmitting(true);
            setError(null);
        
            const project = await createProjectEndpoint(request);
            navigate(`/projects/${project.slug}`);
            
            console.log("Create project:", request);
        } catch {
            setError("The project could not be created.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="page-layout">
            <div className = "page-side">
                <button
                        type="button"
                        className="back-button"
                        onClick={() => navigate(-1)}
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
                    <h1>Create New Project</h1>

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

                    <div className="create-project-options-row">
                        <fieldset className="form-option-group form-option-group-2">
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

                        <fieldset className="form-option-group form-option-group-2">
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

                    <fieldset className="form-option-group form-option-group-4">
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

                    <label className="form-description">
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
                        <p className="error">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Creating..."
                            : "Create Project"}
                    </button>
                </form>
            </div>
            <div className = "page-side"></div>
        </main>
    );
}