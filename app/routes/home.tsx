import { Link } from "react-router";
import type { Route } from "./+types/home";
import { useAuth } from "../auth/AuthContext";
import "./home.css";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "Tasked" },
        {
            name: "description",
            content:
                "Task management and collaboration built around your projects.",
        },
    ];
}

const features = [
    {
        title: "Projects",
        description:
            "pretty important stuff should let em know",
        link: "/projects",
        linkText: "Explore Projects",
    },
    {
        title: "Tasks",
        description:
            "Track individual pieces of work, assign them to team members, and move them through their lifecycle.",
        link: "/projects",
        linkText: "View Tasks",
    },
    {
        title: "Collaboration",
        description:
            "Nah no way this page makes the cut lmao",
        link: "/orgs",
        linkText: "Explore Organizations",
    },
    {
        title: "Organizations",
        description:
            "Well it's a proof of concept but you know how it is :P",
        link: "/orgs",
        linkText: "View Organizations",
    },
];

const showcaseProjects = [
    {
        name: "Tasked Development",
        description:
            "Project chronicling ",
        taskCount: 47,
        memberCount: 1,
        link: "/projects/tasked-development",
    },
    {
        name: "Collaborative Development",
        description:
            "A sample collaborative project demonstrating tasks, assignments, project roles, and organization membership.",
        taskCount: 32,
        memberCount: 8,
        link: "/projects/teamwork-demo",
    },
    {
        name: "Explore Tasked",
        description:
            "A guided project designed to help new users discover the features available in Tasked.",
        taskCount: 10,
        memberCount: 1,
        link: "/projects/explore-tasked",
    },
];

export default function HomePage() {
    const { isAuthenticated } = useAuth();

    return (
        <main className="home-page">
            <section className="home-hero">
                <div className="home-hero-content">
                    <p className="home-eyebrow">TASK MANAGEMENT</p>

                    <h1>Projects without the clutter.</h1>

                    <p className="home-hero-description">
                        Tasked brings projects, tasks, and collaboration
                        together in one place.
                    </p>

                    <div className="home-hero-actions">
                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/create"
                                    className="home-primary-button"
                                >
                                    Create a Project
                                </Link>

                                <Link
                                    to="/myaccount"
                                    className="home-secondary-button"
                                >
                                    My Account
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/register"
                                    className="home-primary-button"
                                >
                                    Get Started
                                </Link>

                                <Link
                                    to="/login"
                                    className="home-secondary-button"
                                >
                                    Log In
                                </Link>
                            </>
                        )}  
                    </div>
                </div>
            </section>

            <section className="home-feature-section">
                <div className="home-section-heading">
                    <span>WHAT YOU CAN DO</span>
                    <h2>Discover Tasked.</h2>
                </div>

                <div className="home-feature-gallery">
                    <button
                        type="button"
                        className="home-gallery-arrow"
                        aria-label="Previous feature"
                    >
                        ←
                    </button>

                    <article className="home-feature-panel">
                        <span className="home-feature-number">
                            01 / 04
                        </span>

                        <div className="home-feature-content">
                            <h3>{features[0].title}</h3>

                            <p>{features[0].description}</p>

                            <Link to={features[0].link}>
                                {features[0].linkText} →
                            </Link>
                        </div>
                    </article>

                    <button
                        type="button"
                        className="home-gallery-arrow"
                        aria-label="Next feature"
                    >
                        →
                    </button>
                </div>

                <div
                    className="home-gallery-dots"
                    aria-label="Feature slides"
                >
                    {features.map((feature, index) => (
                        <button
                            key={feature.title}
                            type="button"
                            className={
                                index === 0
                                    ? "home-gallery-dot active"
                                    : "home-gallery-dot"
                            }
                            aria-label={`Show ${feature.title}`}
                        />
                    ))}
                </div>
            </section>

            <section className="home-showcase">
                <div className="home-section-heading">
                    <span>DEMO PROJECTS</span>
                    <h2>See Tasked in action.</h2>
                    <p>
                        Explore a few projects built to demonstrate
                        what Tasked can do.
                    </p>
                </div>

                <div className="home-project-grid">
                    {showcaseProjects.map((showcase) => (
                        <article
                            key={showcase.name}
                            className="home-project-card"
                        >
                            <div className="home-project-card-content">
                                <h3>{showcase.name}</h3>

                                <p>{showcase.description}</p>
                            </div>

                            <div className="home-project-card-footer">
                                <div className="home-project-stats">
                                    <span>
                                        {showcase.taskCount} tasks
                                    </span>

                                    <span>
                                        {showcase.memberCount}{" "}
                                        {showcase.memberCount === 1
                                            ? "member"
                                            : "members"}
                                    </span>
                                </div>

                                <Link to={showcase.link}>
                                    View Project →
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>

                <Link
                    to="/projects"
                    className="home-showcase-link"
                >
                    Browse Public Projects →
                </Link>
            </section>
        </main>
    );
}
