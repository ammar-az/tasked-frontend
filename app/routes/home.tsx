import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Home page" },
    { name: "description", content: "Welcome to Tasked!" },
  ];
}

export default function HomePage(){
    return (
        <h1>Home page</h1>
    )
}
