import { Link } from "react-router";
import "./Navbar.css";

export default function Navbar() {
    return (
        <header className="navbar">
            <div className="navbar-left" />

            <Link to="/" className="navbar-title">
                Tasked
            </Link>

            <div className="navbar-right">
                <Link to="/login" className="navbar-button">
                    Login
                </Link>
            </div>
        </header>
    );
}