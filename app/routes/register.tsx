import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/register";
import { useAuth } from "../auth/AuthContext";
import { useEffect, useState } from "react";
import { DATABASE_WAKE_MESSAGE, getApiErrorMessage } from "../api/errors";
import { useConnectionMessage } from "../auth/useConnectionMessage";

export function meta() {
    return [
        { title: "Register - Tasked" }
    ];
}

export default function RegisterPage({}: Route.ComponentProps) {
    const {register, isAuthenticated} = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const [submitting, setSubmitting] = useState(false);
    const connectionMessage = useConnectionMessage();
    const displayedError = error === DATABASE_WAKE_MESSAGE ? connectionMessage : error ?? connectionMessage;
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (submitting) return;
        setError(null);
        setSubmitting(true);
        try{
            if(username == "" || password == ""){
                setError("Username and password are required.");
                return;
            } 

            await register(username, password);
            navigate("/");
        }catch (error) {
            setError(getApiErrorMessage(error, "Registration failed."));
        } finally {
            setSubmitting(false);
        }
    }

    useEffect(() => {
        if(isAuthenticated){
            navigate("/");
        }
    });

    return (
        <main className = "simple-layout">
            <div className = "page-main-narrow">
                <form onSubmit={handleSubmit} className = "form" aria-busy={submitting}>
                    <h1>Register</h1>

                    <input
                        type="text"
                        placeholder="Username"
                        autoComplete="username"
                        onChange={(e) => setUsername(e.target.value)} 
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        onChange={(e) => setPassword(e.target.value)} 
                    />

                    {displayedError && (<p className="error" role="alert">{displayedError}</p>)}

                    <button type="submit" disabled={submitting}>{submitting ? "Creating account…" : "Register"}</button>
                    {submitting && <p role="status">Connecting. If the database is waking up, the app will reconnect automatically.</p>}

                    <p>
                        Already have an account?{" "}
                        <Link to="/login">Login here</Link>
                    </p>
                </form>
            </div>
        </main>
    );
}
