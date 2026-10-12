
import { useState } from "react";
import "./ArchitecturePanel.css";

type Technology = {
    name: string;
    logo?: string;
};

type ArchitectureColumnProps = {
    title: string;
    technologies: Technology[];
    description: string;
    hosting: Technology[];
    container?: Technology;
    build?: Technology;
    className: string;
};

function TechnologyBadge({ name, logo }: Technology) {
    const [logoFailed, setLogoFailed] = useState(false);

    const initials = name
        .split(/[\s.]+/)
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 3)
        .toUpperCase();

    return (
        <div className="architecture-technology">
            {logo && !logoFailed ? (
                <img
                    className="architecture-technology-logo"
                    src={logo}
                    alt=""
                    aria-hidden="true"
                    onError={() => setLogoFailed(true)}
                />
            ) : (
                <span className="architecture-technology-fallback" aria-hidden="true">
                    {initials}
                </span>
            )}

            <span className="architecture-technology-name">{name}</span>
        </div>
    );
}

function ArchitectureColumn({
    title,
    technologies,
    description,
    hosting,
    container,
    build,
    className,
}: ArchitectureColumnProps) {
    return (
        <section className={`architecture-column ${className}`}>
            <h3 className="architecture-column-title">{title}</h3>

            <div className="architecture-technology-list">
                {technologies.map((technology) => (
                    <TechnologyBadge key={technology.name} {...technology} />
                ))}
            </div>

            <p className="architecture-description">{description}</p>

            {container && (
                <div className="architecture-extra">
                    <span className="architecture-extra-label">
                        Containerized with
                    </span>
                    <TechnologyBadge {...container} />
                </div>
            )}

            {build && (
                <div className="architecture-extra">
                    <span className="architecture-extra-label">
                        Built with
                    </span>
                    <TechnologyBadge {...build} />
                </div>
            )}



            <div className="architecture-hosting">
                <span className="architecture-section-label">HOSTING</span>

                <div className="architecture-hosting-list">
                    {hosting.map((technology) => (
                        <TechnologyBadge key={technology.name} {...technology} />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function ArchitecturePanel() {
    return (
        <section
            className="architecture-panel"
            aria-label="Application architecture"
        >
            <ArchitectureColumn
                className="architecture-frontend"
                title="Frontend"
                technologies={[
                    { name: "TypeScript", logo: "/logos/typescript.svg" },
                    { name: "React", logo: "/logos/react.svg" },
                    { name: "React Router", logo: "/logos/react-router.svg" },
                    { name: "Axios", logo: "/logos/axios.svg" },
                    { name: "CSS", logo: "/logos/css3.svg" },
                ]}
                description="A responsive, component-based interface with client-side routing and type-safe API integration."
                build={{ name: "Vite", logo: "/logos/vite.svg" }}
                hosting={[
                    { name: "Cloudflare Workers", logo: "/logos/cloudflare.svg" },
                ]}
            />

            <ArchitectureColumn
                className="architecture-backend"
                title="Backend API"
                technologies={[
                    { name: "C#", logo: "/logos/csharp.svg" },
                    { name: "ASP.NET Core", logo: "/logos/dotnetcore.svg" },
                    { name: "Entity Framework Core", logo: "/logos/efcore.svg" },
                    { name: "JWT", logo: "/logos/jwt.svg"},
                ]}
                description="A RESTful API supporting CRUD operations, custom authentication, authorization, and application logic."
                container={{ name: "Docker", logo: "/logos/docker.svg" }}
                hosting={[
                    { name: "Azure App Service", logo: "/logos/azure.svg" },
                ]}
            />

            <ArchitectureColumn
                className="architecture-database"
                title="Database"
                technologies={[
                    { name: "SQL Server", logo: "/logos/microsoftsqlserver.svg" },
                ]}
                description="Stores relational application data, with EF Core managing data access and database schema migrations."
                hosting={[
                    { name: "Azure SQL Database", logo: "/logos/azuresql.svg" },
                ]}
            />

            <div className="architecture-connection architecture-connection-http">
                <span>
                    HTTP<br />requests →
                </span>
            </div>

            <div className="architecture-connection architecture-connection-sql">
                <span>SQL<br />queries →</span>
            </div>
        </section>
    );
}
