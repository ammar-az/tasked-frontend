import { Link } from "react-router";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router";

import "./Navbar.css";
import { useState } from "react";
import { getApiErrorMessage } from "../api/errors";

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            setError(null);
            await logout();
            navigate("/");
        } catch (error) {
            setError(getApiErrorMessage(error, "Could not log out. Please try again."));
        }
    }

    return (
        <header className="navbar">
            <div className="navbar-left">
                <div className="navbar-create-slot">
                {isAuthenticated ? (
                    <button
                        type="button"
                        onClick={() => navigate("/create")}
                    >
                        Create Project
                    </button>
                ) : null}
                </div>

                <Link to="/orgs" className="navbar-link">
                    Orgs
                </Link>
            </div>

            <Link to="/" className="navbar-title">
                Tasked
                <img src="/tasked-ico.svg" alt="" className="navbar-logo" />
            </Link>

            <div className="navbar-right">
                {error && <span className="navbar-error" role="alert">{error}</span>}
                {isAuthenticated ? (
                    <>
                        <Link
                            to="/myaccount"
                            className="navbar-link navbar-user"
                        >
                            {user!.username}
                        </Link>

                        <button
                            type="button"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            to="/register"
                            className="navbar-link"
                        >
                            Register
                        </Link>

                        <Link
                            to="/login"
                            className="navbar-link"
                        >
                            Login
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}
