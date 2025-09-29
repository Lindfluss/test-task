import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getPosts, getUsers } from "../lib/api";

// Подменяем глобальный fetch
const g = globalThis as any;

beforeEach(() => {
    g.fetch = vi.fn();
});

afterEach(() => {
    vi.restoreAllMocks();
});

it("getPosts возвращает массив постов", async () => {
    g.fetch.mockResolvedValueOnce(
        new Response(JSON.stringify([{ id: 1, title: "t", body: "b" }]), { status: 200 })
    );

    const posts = await getPosts(1);
    expect(posts).toEqual([{ id: 1, title: "t", body: "b" }]);
    expect(g.fetch).toHaveBeenCalledOnce();
    const [url] = g.fetch.mock.calls[0];
    expect(String(url)).toContain("posts?_limit=1");
});

it("getUsers кидает ошибку при 500 и делает ретраи", async () => {
    // 2 неуспеха (500), затем успех
    g.fetch
        .mockResolvedValueOnce(new Response("err", { status: 500 }))
        .mockResolvedValueOnce(new Response("err", { status: 502 }))
        .mockResolvedValueOnce(
            new Response(JSON.stringify([{ id: 1, name: "A", email: "a@a.a" }]), { status: 200 })
        );

    const users = await getUsers();
    expect(Array.isArray(users)).toBe(true);
    expect(g.fetch).toHaveBeenCalledTimes(3);
});
