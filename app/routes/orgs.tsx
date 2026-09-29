import type { Route } from "./+types/orgs";
import { Link, useSearchParams } from "react-router";

import { getOrgsEndpoint } from "../api/orgs";
import type { OrgsRequest } from "../types/org-types";

import "./orgs.css";
import { useEffect, useState } from "react";

export async function clientLoader({
    request: loaderRequest,
}: Route.ClientLoaderArgs) {
    const url = new URL(loaderRequest.url);

    const orgRequest: OrgsRequest = {
        search: url.searchParams.get("search")?.trim() || undefined,
        descending: url.searchParams.get("descending") !== "false",
        page: 1,
        pageSize: Math.min(100,Math.max(1,Number(url.searchParams.get("pageSize") ?? 20))),
    };

    const orgs = await getOrgsEndpoint(orgRequest);

    return {
        orgs,
        orgRequest,
    };
}

export default function OrgsPage({
    loaderData,
}: Route.ComponentProps) {
    const { 
        orgs: initialOrgs,
        orgRequest: initialOrgRequest, 
    } = loaderData;

    const [orgs, setOrgs] = useState(initialOrgs);
    const [orgRequest, setOrgRequest] = useState(initialOrgRequest);
    const [hasMore, setHasMore] = useState(initialOrgs.length === initialOrgRequest.pageSize);
    const [loadingMore, setLoadingMore] = useState(false);

    const [_, setSearchParams] = useSearchParams();
    const [searchInput, setSearchInput] = useState(orgRequest.search ?? "");

    useEffect(() => {
        setOrgs(initialOrgs);
        setOrgRequest(initialOrgRequest);
        setHasMore(initialOrgs.length === initialOrgRequest.pageSize);
    }, [initialOrgs, initialOrgRequest]);

    useEffect(() => {
        if(searchInput === "") submitSearch();
    }, [searchInput])

    function updateQueryParameter(
    name: string,
    value: string | undefined,
    ) {
        setSearchParams((current) => {
            const next = new URLSearchParams(current);

            if (value === undefined || value === "") {
                next.delete(name);
            } else {
                next.set(name, value);
            }

            return next;
        });
    }

    function submitSearch() {
        updateQueryParameter(
            "search",
            searchInput.trim() || undefined,
        );
    }

    function changeDescending(
        descending: boolean,
    ) {
        updateQueryParameter(
            "descending",
            String(descending),
        );
    }

    async function loadMore() {
        if (loadingMore || !hasMore) {
            return;
        }

        setLoadingMore(true);

        try {
            const nextPage = orgRequest.page + 1;

            const response = await getOrgsEndpoint({
                ...orgRequest,
                page: nextPage,
            });

            setOrgs((current) => [
                ...current,
                ...response,
            ]);

            setOrgRequest((current) => ({
                ...current,
                page: nextPage,
            }));

            setHasMore(
                response.length === orgRequest.pageSize,
            );
        } finally {
            setLoadingMore(false);
        }
    }
    
    return (
        <main className="simple-layout">
            <div className="orgs-page">
                <h1>View Organizations</h1>

                <form 
                    className="orgs-controls"
                    onSubmit={(event) => {
                        event.preventDefault();
                        submitSearch();
                    }}
                >
                    <input
                        type="search"
                        name="search"
                        onChange={(event) =>
                            setSearchInput(event.target.value)
                        }
                        placeholder="Search organizations..."
                        defaultValue={orgRequest.search ?? ""}
                    />

                    <button
                        type="button"
                        name="descending"
                        onClick={() =>
                                changeDescending(!orgRequest.descending)
                            }
                        value={orgRequest.descending ? "false" : "true"}
                        aria-label={
                            orgRequest.descending
                                ? "Sort ascending"
                                : "Sort descending"
                        }
                        title={
                            orgRequest.descending
                                ? "Sort ascending"
                                : "Sort descending"
                        }
                    >
                        {orgRequest.descending ? "↓" : "↑"}
                    </button>
                </form>

                <section className="orgs-list">
                    {orgs.length === 0 ? (
                        <p className="orgs-empty">
                            No organizations found.
                        </p>
                    ) : (
                        orgs.map((org) => (
                            <div className="org-row" key={org.name}>
                                <Link
                                    to={`/orgs/${org.name}`}
                                    className="org-name"
                                >
                                    {org.name}
                                </Link>
                            </div>
                        ))
                    )}
                    {orgs.length > 0 && 
                            <button
                                type="button"
                                className="list-load-more"
                                disabled={loadingMore || !hasMore}
                                onClick={loadMore}
                            >
                                {loadingMore
                                    ? "Loading..."
                                    : hasMore
                                    ? "Load More"
                                    : "No more orgs"}
                            </button>
                    }
                </section>
            </div>
        </main>
    );
}