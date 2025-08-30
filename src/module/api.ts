import z from "zod";

const BACKEND_URL = import.meta.env["VITE_BACKEND_URL"];

const ArticleSchema = z.object({
    id: z.number(),
    title: z.string(),
    content: z.string(),
    category: z.string(),
    status: z.string(),
    created_date: z.string().nullish(),
    updated_date: z.string().nullish(),
});

const CreateArticleSchema = z.object({
    title: z.string().min(20).max(200),
    content: z.string().min(200),
    category: z.string().min(3),
    status: z.enum(["publish", "draft", "trash"]),
});

const PatchArticleSchema = z.object({
    title: z.string().min(20).max(200).optional(),
    content: z.string().min(200).optional(),
    category: z.string().min(3).optional(),
    status: z.enum(["publish", "draft", "trash"]).optional(),
});

const PagedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
    z.object({
        items: z.array(itemSchema),
        offset: z.number(),
        limit: z.number(),
        total_count: z.number(),
    });

// Type inference from Zod schemas
type Article = z.infer<typeof ArticleSchema>;
type CreateArticle = z.infer<typeof CreateArticleSchema>;
type PatchArticle = z.infer<typeof PatchArticleSchema>;
type PagedResponse<T> = z.infer<ReturnType<typeof PagedResponseSchema<z.ZodType<T>>>>;

export async function listArticles(kwargs: { limit?: number; offset?: number; published_only?: boolean; }): Promise<PagedResponse<Article>> {
    kwargs.limit ??= 10;
    kwargs.offset ??= 0;

    const response = await fetch(`${BACKEND_URL}/article/${kwargs.limit}/${kwargs.offset}?published_only=${kwargs.published_only ? "true" : "false"}`);
    const body = await response.json();
    
    return await PagedResponseSchema(ArticleSchema).parseAsync(body);
}

export async function createArticle(article: CreateArticle): Promise<void> {
    const response = await fetch(`${BACKEND_URL}/article`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(article),
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify({ status: response.status, data: errorData }));
    }
}

export async function deleteArticle(id: number) {
    // Fire and forget, assume the article has been deleted
    await fetch(`${BACKEND_URL}/article/${id}`, { method: "DELETE" });
}

export async function getArticle(id: number): Promise<Article> {
    const response = await fetch(`${BACKEND_URL}/article/${id}`);
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify({ status: response.status, data: errorData }));
    }
    
    const body = await response.json();
    return await ArticleSchema.parseAsync(body);
}

export async function patchArticle(id: number, article: PatchArticle): Promise<void> {
    const response = await fetch(`${BACKEND_URL}/article/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(article),
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify({ status: response.status, data: errorData }));
    }
}
