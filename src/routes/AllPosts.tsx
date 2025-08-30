import { Divider, Pagination, Stack, Typography } from "@suid/material";
import Navbar from "../components/Navbar";
import ArticleCard from "../components/ArticleCard";
import { createResource, createSignal, For, Show } from "solid-js";
import { deleteArticle, listArticles } from "../module/api";

export default function AllPosts() {
    const [page, setPage] = createSignal(0);
    const limit = 10;

    const [ articles, { mutate: mutateArticle } ] = createResource(() => page(), async (page) => {
        const offset = page * limit;
        return await listArticles({ offset, limit });
    });

    const totalPages = () => {
        if (!articles()) return 0;
        return Math.ceil(articles().total_count / limit);
    };

    return (
        <>
            <Navbar />
            <Stack
                divider={<Divider orientation="horizontal" />}
            >
                <Show when={!articles.loading}>
                    <Show when={articles().items.length > 0} fallback={
                        <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
                            <Typography variant="h6" color="text.secondary">
                                No articles found
                            </Typography>
                        </Stack>
                    }>
                        <For each={articles().items}>
                            {(article) => (
                                <ArticleCard
                                    title={article.title}
                                    content={article.content}
                                    category={article.category}
                                    isDraft={article.status === "draft"}
                                    
                                    editUrl={`/edit/${article.id}`}
                                    
                                    onDelete={async () => {
                                        mutateArticle(prev => ({
                                            ...prev,
                                            items: prev.items.filter(e => e.id !== article.id),
                                        }));

                                        await deleteArticle(article.id);
                                    }}
                                />
                            )}
                        </For>
                    </Show>
                </Show>

                <Show when={articles() && totalPages() > 1}>
                    <Pagination 
                        count={totalPages()} 
                        page={page() + 1} // Convert 0-indexed to 1-indexed for display
                        onChange={(_, newPage) => {
                            setPage(newPage - 1); // Convert 1-indexed to 0-indexed
                        }}
                        shape="rounded" 
                        sx={{ margin: "auto", my: "1rem" }} 
                    />
                </Show>
            </Stack>
        </>
    );
}
