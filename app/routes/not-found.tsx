import { ErrorPage } from "../root";

export function meta() {
    return [
        { title: "404 Not Found - Tasked" }
    ];
}

export default function NotFoundPage(){
    return (
    <ErrorPage title="404" message="This page was not found"></ErrorPage>
    )
}
