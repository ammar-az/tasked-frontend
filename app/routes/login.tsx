import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/login";
import { useAuth } from "../auth/AuthContext";
import { useEffect, useState } from "react";

export default function LoginPage({}: Route.ComponentProps) {
    const {handleLogin, isAuthenticated} = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    const navigate = useNavigate();


    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        handleLogin(username, password);
        navigate("/");
    }

    useEffect(() => {
        if(isAuthenticated){
            navigate("/");
        }
    });

    return (
        <main
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
            }}
        >
            <form onSubmit={handleSubmit}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    width: "300px",
                }}
            >
                <h1>Login</h1>

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

                <button type="submit">Login</button>

                <p>
                    Don't have an account?{" "}
                    <Link to="/register">Register here</Link>
                </p>
            </form>
        </main>
    );
}