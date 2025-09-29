"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
};

const links = [
    { href: "/", label: "SSR" },
    { href: "/ssg", label: "SSG" },
    { href: "/csr", label: "CSR" },
    { href: "/isr", label: "ISR" },
    { href: "/ws", label: "WebSocket" },
];

export default function PageHeader({ title, subtitle, actions }: Props) {
    const pathname = usePathname();

    const items = useMemo(
        () =>
            links.map((l) => {
                const active = pathname === l.href;
                return (
                    <Button
                        key={l.href}
                        asChild
                        size="sm"
                        variant={active ? "default" : "outline"}
                        className={cn(active && "pointer-events-none")}
                    >
                        <Link href={l.href}>{l.label}</Link>
                    </Button>
                );
            }),
        [pathname]
    );

    return (
        <div className="grid gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{title}</h1>
                    {subtitle ? (
                        <p className="text-sm text-muted-foreground">{subtitle}</p>
                    ) : null}
                </div>
                {actions}
            </div>

            <nav className="flex flex-wrap gap-2">{items}</nav>
        </div>
    );
}
