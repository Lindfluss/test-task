"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type WSStatus = "closed" | "connecting" | "open";

export function useWebSocket(url: string, { reconnect = true, reconnectDelay = 1000 } = {}) {
    const wsRef = useRef<WebSocket | null>(null);
    const [status, setStatus] = useState<WSStatus>("closed");
    const [lastMessage, setLastMessage] = useState<string | null>(null);

    const connect = useCallback(() => {
        if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
            return;
        }
        setStatus("connecting");
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => setStatus("open");
        ws.onmessage = (e) => setLastMessage(typeof e.data === "string" ? e.data : "[binary]");
        ws.onerror = () => setStatus("closed");
        ws.onclose = () => {
            setStatus("closed");
            if (reconnect) setTimeout(connect, reconnectDelay);
        };
    }, [url, reconnect, reconnectDelay]);

    const disconnect = useCallback(() => {
        reconnect = false; // локально блокируем авто-reconnect для текущего экземпляра
        wsRef.current?.close();
        wsRef.current = null;
    }, []);

    const send = useCallback((data: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(data);
            return true;
        }
        return false;
    }, []);

    useEffect(() => {
        connect();
        return () => {
            wsRef.current?.close();
            wsRef.current = null;
        };
    }, [connect]);

    return { status, lastMessage, send, connect, disconnect };
}
