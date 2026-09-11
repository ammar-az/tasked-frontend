import { Link } from "react-router";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router";

import "./Navbar.css";

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/");
    }

    return (
        <header className="navbar">
            <div className="navbar-left">
                {isAuthenticated && (
                    <button
                        type="button"
                        onClick={() => navigate("/create")}
                    >
                        Create Project
                    </button>
                )}

                <Link to="/orgs" className="navbar-link">
                    Orgs
                </Link>
            </div>

            <Link to="/" className="navbar-title">
                Tasked
            </Link>

            <div className="navbar-right">
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
