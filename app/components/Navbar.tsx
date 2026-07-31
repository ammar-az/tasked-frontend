import { Link } from "react-router";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router";

import "./Navbar.css";

export default function Navbar() {
    const { isAuthenticated, username, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate("/");
    }

    return (
        <header className="navbar">
            <div className="navbar-left">
                <button onClick={()=> navigate("/create")}>Create Project</button>
            </div>
            <Link to="/" className="navbar-title">
                Tasked
            </Link>
            
            <div className="navbar-right">
            {(!isAuthenticated) 
            ? <Link to="/login" className="navbar-button">Login</Link>
            : ( <div>
                    <button onClick={handleLogout}>Logout {username}</button>
            </div>)
            }
            </div>
        </header>
    );
}
