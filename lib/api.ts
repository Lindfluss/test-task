import type { Post, User } from "./types";
import { fetchJSON } from "./http";

// Централизуем политику: no-store, таймаут 10s, ретраи 2
const defaults = { timeoutMs: 10_000, retries: 2, retryDelayMs: 300 } as const;

export async function getPosts(limit = 6) {
    return fetchJSON<Post[]>(`https://jsonplaceholder.typicode.com/posts?_limit=${limit}`, defaults);
}

export async function getUsers() {
    return fetchJSON<User[]>(`https://jsonplaceholder.typicode.com/users`, defaults);
}
