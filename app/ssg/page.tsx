import PageHeader from "@/components/PageHeader";
import { OpenModalButton } from "@/components/OpenModalButton";

export const revalidate = 120;

type User = { id: number; name: string; email: string; company?: { name?: string } };

async function getUsers(): Promise<User[]> {
    // SSG: кэшируем и пересобираем не чаще, чем раз в `revalidate` секунд
    const res = await fetch("https://jsonplaceholder.typicode.com/users", {
        next: { revalidate },
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
}

export default async function SSGPage() {
    const users = await getUsers();

    return (
        <div className="main-block">
            <PageHeader
                title="SSG страница"
                subtitle={`Данные статически сгенерированы и будут обновляться не чаще, чем раз в ${revalidate} секунд.`}
                actions={<OpenModalButton />}
            />

            <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {users.map((u) => (
                    <li key={u.id} className="rounded-lg border p-4">
                        <div className="font-medium">{u.name}</div>
                        <div className="text-sm text-muted-foreground">
                            {u.email} {u.company?.name ? `• ${u.company.name}` : ""}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
