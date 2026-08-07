import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import {AuthProvider} from "./auth/AuthContext"
import { isRouteErrorResponse } from "react-router";

import type { Route } from "./+types/root";

import Navbar from "./components/Navbar";
import "./app.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>

      <body>
        <AuthProvider>
          <Navbar />

          <main>
            {children}
          </main>
        </AuthProvider>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function ErrorPage({
    title,
    message,
}: {
    title: string;
    message: string;
}) {
    return (
        <main className="error-page">
            <h1>{title}</h1>
            <p>{message}</p>

            <a href="/">Return Home</a>
        </main>
    );
}

export function ErrorBoundary({
    error,
}: Route.ErrorBoundaryProps) {
    if (isRouteErrorResponse(error)) {
        switch (error.status) {
            case 401:
                return (
                    <ErrorPage
                        title="Unauthorized"
                        message="You need to log in to view this page."
                    />
                );

            case 403:
                return (
                    <ErrorPage
                        title="Forbidden"
                        message="You don't have permission to view this page."
                    />
                );

            case 404:
                return (
                    <ErrorPage
                        title="Not Found"
                        message="The page or resource could not be found."
                    />
                );

            default:
                return (
                    <ErrorPage
                        title={`Error ${error.status}`}
                        message="Something went wrong."
                    />
                );
        }
    }

    return (
        <ErrorPage
            title="Something went wrong"
            message="An unexpected error occurred."
        />
    );
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function App() {
  return (
      <Outlet />
  );
}
