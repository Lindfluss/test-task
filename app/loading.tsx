export default function Loading() {
    return (
        <div className="main-block">
            <section className="grid gap-2">
                <div className="h-6 w-48 rounded-md bg-secondary animate-pulse" />
                <div className="h-4 w-80 rounded-md bg-secondary animate-pulse" />
            </section>

            <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-lg border p-6 space-y-3">
                        <div className="h-5 w-3/4 rounded-md bg-secondary animate-pulse" />
                        <div className="h-4 w-full rounded-md bg-secondary animate-pulse" />
                        <div className="h-4 w-11/12 rounded-md bg-secondary animate-pulse" />
                        <div className="h-4 w-2/3 rounded-md bg-secondary animate-pulse" />
                    </div>
                ))}
            </section>

            <section className="grid gap-2">
                <div className="h-6 w-40 rounded-md bg-secondary animate-pulse" />
                <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <li key={i} className="rounded-lg border p-4 space-y-2">
                            <div className="h-4 w-2/3 rounded-md bg-secondary animate-pulse" />
                            <div className="h-4 w-1/2 rounded-md bg-secondary animate-pulse" />
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
