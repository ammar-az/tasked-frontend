# Tasked — Frontend

The frontend for **Tasked**, a full-stack project management application for organizing projects, managing tasks, and collaborating with other users.

Built with React and TypeScript using React Router Framework Mode, the application provides a responsive interface that communicates with the Tasked backend API for authentication, project management, and task operations.

## Tech Stack

- **Language:** TypeScript
- **UI Library:** React
- **Routing:** React Router Framework Mode
- **Build Tool:** Vite
- **HTTP Client:** Axios
- **Styling:** CSS
- **Deployment:** Cloudflare Workers
- **Development Tools:** ESLint, Wrangler

## Features

- **Project Management:** Browse and manage projects, including project settings and membership.
- **Task Management:** Create, update, organize, assign, and track tasks.
- **Authentication:** Integrate with the backend's custom authentication system.
- **Session Management:** Restore authenticated sessions using refresh tokens.
- **Collaboration:** Support project membership, roles, and shared project workflows.
- **Search and Filtering:** Find and organize projects and tasks using available filtering and sorting options.
- **API Integration:** Communicate with the backend through typed API requests using Axios.

## Architecture

The frontend is a client-side application built with React and React Router Framework Mode. It communicates with the Tasked backend through HTTP requests and relies on the API for application data, authentication, and authorization.

Server-side rendering is disabled; the application is deployed as a client-side experience on Cloudflare Workers.

```text
Browser
   |
   | React + TypeScript
   v
Tasked Frontend
   |
   | HTTPS / REST API
   | JWT + Refresh Cookie
   v
ASP.NET Core Backend API
```

The frontend and backend are deployed independently. The frontend is hosted on Cloudflare Workers, while the backend API and SQL Server database are hosted on Azure.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) and npm
- Access to a running Tasked backend API

### 1. Clone the Repository

```bash
git clone <https://github.com/ammar-az/tasked-frontend>
cd <frontend-repository-directory>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure the Environment

The repository includes a .env.production file configured for the deployed API. For local development, create a .env.development file in the project root:

VITE_API_URL=http://localhost:8080/api

Replace the example URL with the address of your local backend API.

Ensure the backend is running and configured to allow requests from the frontend's development origin.

The frontend and backend are maintained in separate repositories and can be developed, built, and deployed independently.

### 4. Start the Development Server

```bash
npm run dev
```

Vite starts the development server and displays the local URL in the terminal.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Build the production application using React Router. |
| `npm run preview` | Build the application and preview the production build locally. |
| `npm run typecheck` | Generate React Router types and run TypeScript checks. |
| `npm run lint` | Run ESLint across the project. |
| `npm run check` | Run type checks, build the application, and validate the Cloudflare deployment with a Wrangler dry run. |
| `npm run cf-typegen` | Generate Cloudflare Worker types using Wrangler. |
| `npm run deploy` | Deploy the application using Wrangler. |

## Authentication

The frontend integrates with Tasked's custom authentication system implemented in the backend API.

- **Access tokens:** Held in memory and attached to protected API requests using Axios.
- **Refresh tokens:** Managed through an HTTP-only cookie issued by the backend.
- **Session restoration:** Uses the refresh endpoint to restore authenticated sessions when the application initializes.
- **Credentialed requests:** Axios is configured to include cookies when communicating with the API.

The backend remains responsible for issuing and validating tokens, managing refresh-token rotation, and enforcing authorization.

## Deployment

The production frontend is deployed to **Cloudflare Workers** using Wrangler.

To create a production build:

```bash
npm run build
```

To validate the deployment configuration without deploying:

```bash
npx wrangler deploy --dry-run
```

To deploy the application:

```bash
npm run deploy
```

The deployment requires the appropriate Cloudflare account access and Wrangler configuration. The frontend's production API URL is configured through `.env.production` and is incorporated into the production build.

## Related Project

Tasked's backend is built with C#, ASP.NET Core, Entity Framework Core, and SQL Server.

- **Backend Repository:** [Backend API](https://github.com/ammar-az/Tasked)
- **Live Application:** [Tasked](https://tasked.ammarz.com)

---

This project demonstrates frontend development with React and TypeScript, client-side routing, API integration, authentication flows, and cloud deployment.