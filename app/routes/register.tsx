import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/register";
import { useAuth } from "../auth/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";

export default function RegisterPage({}: Route.ComponentProps) {
    const {register, isAuthenticated} = useAuth();
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

            await register(username, password);
            navigate("/");
        }catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    setError(error.response.data ?? "Registration failed.");
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
        <main className = "simple-layout">
            <div className = "page-main-narrow">
                <form onSubmit={handleSubmit} className = "form">
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

                    {error && (<p className="error">{error}</p>)} 

                    <button type="submit">Register</button>

                    <p>
                        Already have an account?{" "}
                        <Link to="/login">Login here</Link>
                    </p>
                </form>
            </div>
        </main>
    );
}
