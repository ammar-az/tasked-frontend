import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/login";
import { useAuth } from "../auth/AuthContext";
import { useEffect, useState } from "react";

export default function LoginPage({}: Route.ComponentProps) {
    const {login, isAuthenticated} = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try{
            if(username == "" || password == "") throw new Error;

            await login(username, password);
            navigate("/");
        }catch{
            setError("Could not log in. Ensure the username and password are both correct.");
        }
    }

    useEffect(() => {
        if(isAuthenticated){
            navigate("/");
        }
    });

    return (
        <main
            className = "simple-layout"
        >
            <div className = "page-main-narrow">
                <form onSubmit={handleSubmit}
                    className = "form"
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
                    {error && (<p className="error">{error}</p>)} 
                    
                    <button type="submit">Login</button>

                    <p>
                        Don't have an account?{" "}
                        <Link to="/register">Register here</Link>
                    </p>
                </form>
            </div>
        </main>
    );
}
