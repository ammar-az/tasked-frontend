import "./PageSkeleton.css";

export default function PageSkeleton() {
    return (
        <div className="page-skeleton" role="status" aria-label="Loading page" aria-busy="true">
            <div className="page-skeleton-content" aria-hidden="true">
                <div className="page-skeleton-heading">
                    <div className="skeleton-bar skeleton-title" />
                    <div className="skeleton-bar skeleton-description" />
                </div>
                <div className="page-skeleton-toolbar">
                    <div className="skeleton-bar" />
                    <div className="skeleton-bar" />
                </div>
                <div className="page-skeleton-panel">
                    {[0, 1, 2, 3, 4].map((row) => (
                        <div className="page-skeleton-row" key={row}>
                            <div className="skeleton-bar" />
                            <div className="skeleton-bar" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
