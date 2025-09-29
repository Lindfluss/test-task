"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { useWebSocket } from "@/lib/hooks/use-websocket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {OpenModalButton} from "@/components/OpenModalButton";

type Msg = { me: boolean; text: string; ts: number };

export default function WSPage() {
    // стабильный публичный echo-сервер
    const [url, setUrl] = useState("wss://ws.ifelse.io");
    const [autoReconnect, setAutoReconnect] = useState(true);
    const { status, lastMessage, send, connect, disconnect } = useWebSocket(url, { reconnect: autoReconnect });

    const [input, setInput] = useState("");
    const [log, setLog] = useState<Msg[]>([]);

    // лог входящих сообщений
    useEffect(() => {
        if (lastMessage != null) {
            setLog((prev) => [...prev, { me: false, text: lastMessage, ts: Date.now() }]);
        }
    }, [lastMessage]);

    const canSend = status === "open" && input.trim().length > 0;

    const onSend = () => {
        const text = input.trim();
        if (!text) return;
        if (send(text)) {
            setLog((prev) => [...prev, { me: true, text, ts: Date.now() }]);
            setInput("");
        }
    };

    const badge = useMemo(() => {
        switch (status) {
            case "open":
                return <span className="rounded px-2 py-0.5 text-xs bg-green-100 text-green-700">open</span>;
            case "connecting":
                return <span className="rounded px-2 py-0.5 text-xs bg-amber-100 text-amber-700">connecting</span>;
            default:
                return <span className="rounded px-2 py-0.5 text-xs bg-rose-100 text-rose-700">closed</span>;
        }
    }, [status]);

    return (
        <div className="main-block">
            <PageHeader
                title="WebSocket demo"
                subtitle="Подключение к публичному echo-серверу: двунаправленные сообщения в реальном времени (CSR)."
                actions={<OpenModalButton />}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-2">
                    <Label htmlFor="ws-url">WebSocket URL</Label>
                    <Input
                        id="ws-url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="wss://..."
                    />
                </div>

                <div className="flex items-center gap-2 pb-3">
                    <Checkbox id="auto-reconnect" checked={autoReconnect} onCheckedChange={(v) => setAutoReconnect(!!v)} />
                    <Label htmlFor="auto-reconnect">Auto-reconnect</Label>
                </div>

                <div className="flex gap-2">
                    <Button onClick={connect} variant="outline">Connect</Button>
                    <Button onClick={disconnect} variant="outline">Disconnect</Button>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Статус соединения</CardTitle>
                    {badge}
                </CardHeader>
                <CardContent className="grid gap-3">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Введите сообщение и нажмите Enter…"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && onSend()}
                        />
                        <Button onClick={onSend} disabled={!canSend}>Отправить</Button>
                    </div>

                    <div className="rounded-lg border p-3 max-h-[60vh] overflow-auto space-y-2">
                        {log.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Нет сообщений. Отправьте что-нибудь…</p>
                        ) : (
                            log.map((m, i) => (
                                <div key={i} className={`text-sm ${m.me ? "text-right" : "text-left"}`}>
                                  <span
                                      className={`inline-block rounded-md px-2 py-1 ${
                                          m.me ? "bg-primary text-primary-foreground" : "bg-secondary"
                                      }`}
                                  >
                                    {m.text}
                                  </span>
                                                    <span className="ml-2 text-[10px] text-muted-foreground">
                                    {new Date(m.ts).toLocaleTimeString()}
                                  </span>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <p className="text-xs text-muted-foreground">
                На Vercel собственные WS-серверы не поднимаются в Serverless/Edge. Это клиентское подключение к внешнему echo-WS.
            </p>
        </div>
    );
}
