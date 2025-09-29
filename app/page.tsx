import Link from "next/link";

export const dynamic = "force-dynamic";

// Типы ответов JSONPlaceholder
type Post = { id: number; title: string; body: string };
type User = { id: number; name: string; email: string; company?: { name?: string } };

async function getData() {
  const [postsRes, usersRes] = await Promise.all([
    fetch("https://jsonplaceholder.typicode.com/posts?_limit=6", { cache: "no-store" }),
    fetch("https://jsonplaceholder.typicode.com/users", { cache: "no-store" }),
  ]);

  if (!postsRes.ok || !usersRes.ok) {
    throw new Error("Failed to fetch data for SSR page");
  }

  const [posts, users] = (await Promise.all([postsRes.json(), usersRes.json()])) as [Post[], User[]];
  return { posts, users };
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import PageHeader from "@/components/PageHeader";
import { OpenModalButton } from "@/components/OpenModalButton";

export default async function Home() {
  const { posts, users } = await getData();

  return (
      <div className="main-block">
        <PageHeader
            title="Главная (SSR)"
            subtitle="Данные получаются на сервере при каждом запросе (Server-Side Rendering)."
            actions={<OpenModalButton />}
        />

        {/* Секция постов */}
        <section className="grid gap-4">
          <div>
            <h2 className="text-xl font-semibold">Последние посты</h2>
            <p className="text-sm text-muted-foreground">
              Источник: <code>jsonplaceholder.typicode.com/posts</code>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
                <Card key={p.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{p.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-5">{p.body}</p>
                  </CardContent>
                </Card>
            ))}
          </div>
        </section>

        {/* Секция пользователей */}
        <section className="grid gap-4">
          <div>
            <h2 className="text-xl font-semibold">Пользователи</h2>
            <p className="text-sm text-muted-foreground">
              Источник: <code>jsonplaceholder.typicode.com/users</code>
            </p>
          </div>

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
        </section>

        {/* Примечание по Vercel */}
        <p className="text-xs text-muted-foreground">
          Эта страница рендерится на сервере (Vercel Serverless/Node.js runtime). Данные не кэшируются ({'"'}no-store{'"'}).
        </p>
      </div>
  );
}
