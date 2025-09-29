"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("App error boundary:", error);
    }, [error]);

    return (
        <div className="container py-12 grid gap-4">
            <h1 className="text-2xl font-bold">Произошла ошибка</h1>
            <p className="text-sm text-muted-foreground">
                {error.message || "Неизвестная ошибка. Попробуйте обновить страницу."}
            </p>
            <div className="flex gap-2">
                <Button onClick={() => reset()}>Повторить попытку</Button>
                <Button variant="outline" onClick={() => (window.location.href = "/")}>
                    На главную
                </Button>
            </div>
            {error.digest ? (
                <p className="text-xs text-muted-foreground">Код: {error.digest}</p>
            ) : null}
        </div>
    );
}
