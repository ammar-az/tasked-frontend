import { Link } from "react-router";
import type { Route } from "./+types/register";

export default function RegisterPage({}: Route.ComponentProps) {
    return (
        <main
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
            }}
        >
            <form
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    width: "300px",
                }}
            >
                <h1>Register</h1>

                <input
                    type="text"
                    placeholder="Username"
                    autoComplete="username"
                />

                <input
                    type="text"
                    placeholder="Email"
                    autoComplete="email"
                />

                <input
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                />

                <button type="submit">Register</button>

                <p>
                    Already have an account?{" "}
                    <Link to="/login">Login here</Link>
                </p>
            </form>
        </main>
    );
}