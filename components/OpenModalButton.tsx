"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { CodeBlock } from "@/components/ui/code-block";

// Схема валидации:
// - text обязателен, минимум 3 символа;
// - file необязателен, но если выбран — размер до 5 МБ.
const schema = z.object({
    text: z.string().min(3, "Минимум 3 символа"),
    file: z
        .custom<File | null | undefined>()
        .refine(
            (f) => !f || (f instanceof File && f.size <= 5 * 1024 * 1024),
            "Файл должен быть не больше 5 МБ"
        )
        .optional()
        .nullable(),
});

type FormValues = z.infer<typeof schema>;

export function OpenModalButton() {
    const [open, setOpen] = useState(false);
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<any>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { text: "", file: null },
        mode: "onTouched",
    });

    const onSubmit = async (values: FormValues) => {
        setSending(true);
        setResult(null);
        try {
            const fd = new FormData();
            fd.append("text", values.text);
            if (values.file instanceof File) {
                fd.append("file", values.file);
            }

            const res = await fetch("/api/submit", { method: "POST", body: fd });
            const json = await res.json();
            setResult(json);

            if (json?.ok) {
                form.reset({ text: "", file: null });
                // закрываем модалку после успешной отправки
            }
        } catch (e) {
            setResult({ ok: false, error: String(e) });
        } finally {
            setSending(false);
        }
    };

    // Пользователь выбирает файл — кладём в RHF state
    const handlePickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        form.setValue("file", f ?? null, { shouldValidate: true });
    };

    const pickedFile = form.watch("file");

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">Открыть модальное окно</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Отправка данных</DialogTitle>
                    <DialogDescription>
                        Заполните поля
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form className="grid gap-4 py-2" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="text"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Текст</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ваше сообщение…" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="file"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Файл</FormLabel>
                                    <FormControl>
                                        <Input id="file" type="file" onChange={handlePickFile} />
                                    </FormControl>
                                    {pickedFile ? (
                                        <p className="text-xs text-muted-foreground">
                                            {pickedFile.name} • {pickedFile.type || "unknown"} • {((pickedFile.size || 0) / 1024).toFixed(1)} KB
                                        </p>
                                    ) : null}
                                    <FormDescription>Необязательно. До 5 МБ.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setOpen(false)}
                                disabled={sending}
                            >
                                Закрыть
                            </Button>
                            <Button type="submit" disabled={sending}>
                                {sending ? "Отправка…" : "Отправить"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>

                {result ? (
                    <CodeBlock
                        code={JSON.stringify(result, null, 2)}
                        language="json"
                        filename="report.json"
                    />
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
