import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/login";
import { useAuth } from "../auth/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";

export default function LoginPage({}: Route.ComponentProps) {
    const {login, isAuthenticated} = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try{
            if(username == "" || password == ""){
                setError("Username and password are required.");
                return;
            } 

            await login(username, password);
            navigate("/");
        }catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    setError(error.response.data ?? "Login failed.");
                } else {
                    setError("Could not reach the api. Ensure you are connected to the internet and try again.");
                }
            } else {
                setError("An unexpected error occurred.");
            }
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
