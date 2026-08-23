import type { Route } from "./+types/orgs";
import { Link } from "react-router";

import { getOrgsEndpoint } from "../api/orgs";
import type { OrgsRequest } from "../types/org-types";

import "./orgs.css";

export async function clientLoader({
    request: loaderRequest,
}: Route.ClientLoaderArgs) {
    const url = new URL(loaderRequest.url);

    const orgRequest: OrgsRequest = {
        search: url.searchParams.get("search")?.trim() || undefined,
        descending: url.searchParams.get("descending") !== "false",
        page: Math.max(
            1,
            Number(url.searchParams.get("page") ?? 1)
        ),
        pageSize: Math.min(
            100,
            Math.max(
                1,
                Number(url.searchParams.get("pageSize") ?? 20)
            )
        ),
    };

    const organizations = await getOrgsEndpoint(orgRequest);

    return {
        organizations,
        orgRequest,
    };
}

export default function OrgsPage({
    loaderData,
}: Route.ComponentProps) {
    const { organizations, orgRequest } = loaderData;

    return (
        <main className="orgs-page">
            <h1>View Organizations</h1>

            <form className="orgs-controls">
                <input
                    type="search"
                    name="search"
                    placeholder="Search organizations..."
                    defaultValue={orgRequest.search ?? ""}
                />

                <button
                    type="submit"
                    name="descending"
                    value={orgRequest.descending ? "false" : "true"}
                >
                    {orgRequest.descending
                        ? "Descending"
                        : "Ascending"}
                </button>
            </form>

            <section className="orgs-list">
                {organizations.length === 0 ? (
                    <p className="orgs-empty">
                        No organizations found.
                    </p>
                ) : (
                    organizations.map((org) => (
                        <div
                            className="org-row"
                            key={org.name}
                        >
                            <Link
                                to={`/orgs/${org.name}`}
                                className="org-name"
                            >
                                {org.name}
                            </Link>

                            <button type="button">
                                Join
                            </button>
                        </div>
                    ))
                )}
            </section>
        </main>
    );
}