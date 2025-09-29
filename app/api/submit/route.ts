export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const form = await req.formData();
        const text = String(form.get("text") ?? "");
        const file = form.get("file");

        const meta = {
            textLength: text.length,
            hasFile: !!file && typeof file !== "string",
            fileName: file && typeof file !== "string" ? file.name : null,
            fileType: file && typeof file !== "string" ? file.type : null,
            fileSize: file && typeof file !== "string" ? (file.size || null) : null
        };

        const forwarded = await fetch("https://jsonplaceholder.typicode.com/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "from-modal", body: text, userId: 1 })
        }).then(r => r.json());

        return Response.json({ ok: true, meta, forwarded });
    } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e) }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
