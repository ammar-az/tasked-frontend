import { Link } from "react-router";
import type { Route } from "./+types/home";
import "./home.css";
import { useEffect, useState } from "react";

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
            "pretty important stuff should let em know. Let's see how longer descriptions look. pretty important stuff should let em know. Let's see how longer descriptions look pretty important stuff should let em know. Let's see how longer descriptions look pretty important stuff should let em know. Let's see how longer descriptions look",
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
        title: "Accounts",
        description:
            "Nah no way this page makes the cut lmao",
        link: "/myaccount",
        linkText: "View your account",
    },
    {
        title: "Organizations",
        description:
            "Well it's a proof of concept but you know how it is :P",
        link: "/orgs",
        linkText: "Explore Organizations",
    },
];

const slides = [
    {
        type: "intro" as const,
        title: "Tasked",
    },
    ...features.map((feature) => ({
        type: "feature" as const,
        ...feature,
    })),
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

    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    function goToSlide(index: number) {
        const nextIndex = (index + slides.length) % slides.length;

        if (nextIndex === currentSlide || isAnimating) {
            return;
        }

        setIsAnimating(true);
        setCurrentSlide(nextIndex);

        window.setTimeout(() => {
            setIsAnimating(false);
        }, 300);
    }

    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    function previousSlide() {
        goToSlide(currentSlide - 1);
    }

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "ArrowLeft") {
                previousSlide();
            } else if (event.key === "ArrowRight") {
                nextSlide();
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [currentSlide, isAnimating]);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setCurrentSlide((current) => (current + 1) % slides.length);
        }, 30000);

        return () => window.clearInterval(timer);
    }, []);

    return (
        <main className="home-page">
            

            <section className="home-feature-section">
                <div className="home-feature-gallery">
                    <button
                        type="button"
                        className="home-gallery-arrow"
                        aria-label="Previous feature"
                        onClick={previousSlide}
                    >
                        ←
                    </button>

                    <article
                        key={currentSlide}
                        className={`home-feature-panel home-feature-panel-animated ${slides[currentSlide].type === "intro" ? "home-intro-panel" : ""}`}
                    >
                        {slides[currentSlide].type === "intro" ? (
                            <>
                                <div className="home-intro-content">
                                    <p className="home-eyebrow">TASK MANAGEMENT</p>

                                    <h1>Projects but better.</h1>

                                    <p className="home-hero-description">
                                        Tasked brings projects, tasks, and collaboration
                                        together in one place. 
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="home-intro-link"
                                    onClick={() =>
                                        document
                                            .getElementById("home-showcase")
                                            ?.scrollIntoView({ behavior: "smooth" })
                                    }
                                >
                                    See more of Tasked
                                    <span aria-hidden="true">↓</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="home-feature-title">
                                    <h3>{slides[currentSlide].title}</h3>
                                </div>

                                <div className="home-feature-description">
                                    <p>{slides[currentSlide].description}</p>

                                    <Link to={slides[currentSlide].link}>
                                        {slides[currentSlide].linkText} →
                                    </Link>
                                </div>
                            </>
                        )}
                    </article>

                    <button
                        type="button"
                        className="home-gallery-arrow"
                        aria-label="Next feature"
                        onClick={nextSlide}
                    >
                        →
                    </button>
                </div>

                <div className="home-gallery-dots" aria-label="Feature slides">
                    {slides.map((slide, index) => (
                        <button
                            key={slide.title}
                            type="button"
                            className={
                                index === currentSlide
                                    ? "home-gallery-dot active"
                                    : "home-gallery-dot"
                            }
                            aria-label={`Show ${slide.title}`}
                            aria-current={index === currentSlide ? "true" : undefined}
                            onClick={() => goToSlide(index)}
                        />
                    ))}
                </div>
            </section>

            <section id="home-showcase" className="home-showcase">
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
