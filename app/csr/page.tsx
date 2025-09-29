"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OpenModalButton } from "@/components/OpenModalButton";

type Todo = { id: number; title: string; completed: boolean };

export default function CSRPage() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [q, setQ] = useState("");
    const [onlyCompleted, setOnlyCompleted] = useState(false);

    const abortRef = useRef<AbortController | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;

        try {
            const res = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=24", {
                signal: ac.signal,
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data: Todo[] = await res.json();
            setTodos(data);
        } catch (e: any) {
            if (e?.name !== "AbortError") setError(String(e?.message || e));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        return () => abortRef.current?.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase();
        return todos.filter((t) => {
            const byQuery = !needle || t.title.toLowerCase().includes(needle);
            const byStatus = !onlyCompleted || t.completed;
            return byQuery && byStatus;
        });
    }, [todos, q, onlyCompleted]);

    return (
        <div className="main-block">
            <PageHeader
                title="CSR страница"
                subtitle="Данные загружаются на клиенте (useEffect) и фильтруются без участия сервера."
                actions={<OpenModalButton />}
            />

            <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-2">
                    <Label htmlFor="q">Поиск по заголовку</Label>
                    <Input
                        id="q"
                        placeholder="Например: delectus…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 pb-3">
                    <Checkbox
                        id="onlyCompleted"
                        checked={onlyCompleted}
                        onCheckedChange={(v) => setOnlyCompleted(!!v)}
                    />
                    <Label htmlFor="onlyCompleted">Только выполненные</Label>
                </div>

                <Button onClick={load} disabled={loading}>
                    {loading ? "Обновление…" : "Обновить"}
                </Button>
            </div>

            {error ? (
                <div className="rounded-lg border p-4 bg-secondary/50 text-sm">
                    Ошибка загрузки: {error}
                </div>
            ) : null}

            {loading ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="rounded-lg border p-6 space-y-3">
                            <div className="h-5 w-3/4 rounded-md bg-secondary animate-pulse" />
                            <div className="h-4 w-11/12 rounded-md bg-secondary animate-pulse" />
                            <div className="h-4 w-2/3 rounded-md bg-secondary animate-pulse" />
                        </div>
                    ))}
                </div>
            ) : (
                <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((t) => (
                        <Card key={t.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-base">{t.title}</CardTitle>
                                <span
                                    className={`rounded px-2 py-0.5 text-xs ${
                                        t.completed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                    }`}
                                >
                                  {t.completed ? "done" : "todo"}
                                </span>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                ID: {t.id}
                            </CardContent>
                        </Card>
                    ))}
                </section>
            )}

            <p className="text-xs text-muted-foreground">
                Источник: <code>jsonplaceholder.typicode.com/todos</code>. Запрос выполняется из браузера (CSR).
            </p>
        </div>
    );
}
