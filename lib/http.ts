// Единый HTTP-клиент: таймаут, ретраи с экспоненциальной паузой, AbortController.
type FetchJSONInit = RequestInit & {
    timeoutMs?: number;
    retries?: number;
    retryDelayMs?: number; // базовая задержка, далее * 2^attempt
};

export class HttpError extends Error {
    status: number;
    url: string;
    body?: unknown;
    constructor(message: string, status: number, url: string, body?: unknown) {
        super(message);
        this.status = status;
        this.url = url;
        this.body = body;
    }
}

export async function fetchJSON<T>(url: string, init: FetchJSONInit = {}): Promise<T> {
    const {
        timeoutMs = 10_000,
        retries = 0,
        retryDelayMs = 300,
        signal,
        ...rest
    } = init;

    let attempt = 0;
    // контроллер для таймаута
    const ac = new AbortController();
    const signals: AbortSignal[] = [];
    if (signal) signals.push(signal);
    signals.push(ac.signal);

    const timeout = setTimeout(() => ac.abort(new Error(`Timeout ${timeoutMs}ms`)), timeoutMs);

    try {
        // простой цикл ретраев (ретраим только сеть/5xx)
        // 0 попыток = 1 запрос без ретраев; 2 = до 3 запросов.
        // делаем попытки последовательно
        // eslint-disable-next-line no-constant-condition
        while (true) {
            try {
                const res = await fetch(url, {
                    cache: "no-store",
                    ...rest,
                    signal: anySignal(signals),
                    headers: {
                        Accept: "application/json",
                        ...(rest.headers ?? {}),
                    },
                });

                if (!res.ok) {
                    // читаем текст для диагностики
                    const text = await safeText(res);
                    // ретраим только 5xx
                    if (res.status >= 500 && attempt < retries) {
                        await delay(retryDelayMs * Math.pow(2, attempt));
                        attempt++;
                        continue;
                    }
                    throw new HttpError(`HTTP ${res.status} for ${url}`, res.status, url, text);
                }

                // ok
                return (await res.json()) as T;
            } catch (err: any) {
                const isAbort = err?.name === "AbortError";
                const isNetwork = !isAbort && (err?.cause?.code || err?.code || err?.message);
                // Ретраим сетевые ошибки/аборт по таймауту (но не явный Abort из внешнего сигнала)
                const externallyAborted = signalAborted(signal);
                if ((isAbort || isNetwork) && !externallyAborted && attempt < retries) {
                    await delay(retryDelayMs * Math.pow(2, attempt));
                    attempt++;
                    continue;
                }
                throw err;
            }
        }
    } finally {
        clearTimeout(timeout);
    }
}

// Утилиты

function delay(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
}

async function safeText(res: Response) {
    try {
        return await res.text();
    } catch {
        return undefined;
    }
}

function signalAborted(signal?: AbortSignal) {
    try {
        return !!signal && signal.aborted;
    } catch {
        return false;
    }
}

function anySignal(signals: AbortSignal[]) {
    // если один из сигналов абортится — абортим общий
    if (signals.length === 1) return signals[0];
    const controller = new AbortController();
    const onAbort = () => controller.abort();
    for (const s of signals) {
        if (s.aborted) return s;
        s.addEventListener("abort", onAbort, { once: true });
    }
    return controller.signal;
}
