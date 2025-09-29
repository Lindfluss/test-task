// app/isr/page.tsx
import {OpenModalButton} from "@/components/OpenModalButton";

export const revalidate = 60;

type Photo = { id: number; title: string };

async function getPhotos(): Promise<Photo[]> {
    const res = await fetch("https://jsonplaceholder.typicode.com/photos?_limit=12", {
        next: { revalidate },
    });
    if (!res.ok) throw new Error("Failed to fetch photos");
    const data: any[] = await res.json();
    return data.map((p) => ({ id: p.id, title: p.title })) as Photo[];
}

import PageHeader from "@/components/PageHeader";

export default async function ISRPage() {
    const photos = await getPhotos();
    const generatedAt = new Date().toLocaleString("ru-RU");

    return (
        <div className="main-block">
            <PageHeader
                title="ISR страница"
                subtitle={`Инкрементальная статическая регенерация: кэш обновляется не чаще, чем раз в ${revalidate} секунд. Сгенерировано: ${generatedAt}`}
                actions={<OpenModalButton/>}
            />

            <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {photos.map((p) => {
                    const thumb = `https://fpoimg.com/150x100?text=${encodeURIComponent(p.id.toString())}`;
                    const full = `https://fpoimg.com/600x400?text=${encodeURIComponent(p.title)}`;
                    return (
                        <a
                            key={p.id}
                            href={full}
                            target="_blank"
                            rel="noreferrer"
                            className="group rounded-lg border p-3 hover:shadow-md transition-shadow"
                        >
                            <img
                                src={thumb}
                                alt={p.title}
                                className="h-28 w-full rounded-md object-cover"
                                loading="lazy"
                            />
                            <div
                                className="mt-2 line-clamp-2 text-sm text-muted-foreground group-hover:text-foreground">
                                {p.title}
                            </div>
                        </a>
                    );
                })}
            </section>

            <p className="text-xs text-muted-foreground">
                Метаданные: <code>jsonplaceholder.typicode.com/photos</code>. Изображения: <code>fpoimg.com</code>.
            </p>
        </div>
    );
}