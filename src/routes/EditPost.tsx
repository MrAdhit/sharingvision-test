import { Box, Button, Stack, TextField, Typography } from "@suid/material";
import Navbar from "../components/Navbar";
import { createResource, createSignal, Show } from "solid-js";
import { getArticle, patchArticle } from "../module/api";
import { useParams, useNavigate } from "@solidjs/router";

export default function EditPost() {
    const params = useParams();
    const navigate = useNavigate();
    const articleId = () => parseInt(params.id);

    const [title, setTitle] = createSignal("");
    const [content, setContent] = createSignal("");
    const [category, setCategory] = createSignal("");

    const [isSubmitting, setIsSubmitting] = createSignal(false);
    const [fieldErrors, setFieldErrors] = createSignal<Record<string, string>>({});

    const [ article ] = createResource(articleId, getArticle);

    // Update form fields when article data loads
    const updateFormFields = () => {
        const articleData = article();
        if (articleData) {
            setTitle(articleData.title);
            setContent(articleData.content);
            setCategory(articleData.category);
        }
    };

    // Watch for article data changes and update form
    createResource(article, () => {
        updateFormFields();
    });

    const getFieldError = (fieldName: string) => fieldErrors()[fieldName] || "";

    const handleSubmit = async (status: "publish" | "draft") => {
        if (!title() || !content() || !category()) {
            setFieldErrors({
                title: !title() ? "Title is required" : "",
                content: !content() ? "Content is required" : "",
                category: !category() ? "Category is required" : "",
            });
            return;
        }

        setIsSubmitting(true);
        setFieldErrors({});
        
        try {
            await patchArticle(articleId(), {
                title: title(),
                content: content(),
                category: category(),
                status: status,
            });
            
            navigate("/");
        } catch (error) {
            console.error("Failed to update article:", error);
            
            if (error instanceof Error) {
                try {
                    const errorInfo = JSON.parse(error.message);
                    if (errorInfo.status === 422 && errorInfo.data?.detail) {
                        const newFieldErrors: Record<string, string> = {};
                        
                        errorInfo.data.detail.forEach((err: any) => {
                            const field = err.loc?.[err.loc.length - 1] || "unknown";
                            newFieldErrors[field] = err.msg;
                        });
                        
                        setFieldErrors(newFieldErrors);
                        return;
                    }
                } catch (parseError) {
                    console.error("Error parsing validation errors:", parseError);
                }
            }
            
            setFieldErrors({ general: "Failed to update article. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Navbar />
            <Box m={3}>
                <Show when={article.loading}>
                    <Typography variant="h5" fontWeight={500} mb={3}>Loading article...</Typography>
                </Show>
                
                <Show when={article.error}>
                    <Typography variant="h5" fontWeight={500} mb={3} color="error">
                        Error: Article not found
                    </Typography>
                </Show>

                <Show when={article()}>
                    <Typography variant="h5" fontWeight={500} mb={3}>Edit article</Typography>

                    <Stack gap={2} mx={2}>
                        <Stack gap={2} direction="row" sx={{ width: "100%" }}>
                            <TextField 
                                label="Title" 
                                sx={{ flexGrow: 1 }} 
                                value={title()}
                                onChange={(_, value) => setTitle(value)}
                                disabled={isSubmitting()}
                                error={!!getFieldError("title")}
                                helperText={getFieldError("title")}
                            />
                            <TextField 
                                label="Category" 
                                value={category()}
                                onChange={(_, value) => setCategory(value)}
                                disabled={isSubmitting()}
                                error={!!getFieldError("category")}
                                helperText={getFieldError("category")}
                            />
                        </Stack>
                        <TextField 
                            label="Content" 
                            multiline 
                            variant="standard" 
                            value={content()}
                            onChange={(_, value) => setContent(value)}
                            disabled={isSubmitting()}
                            rows={8}
                            error={!!getFieldError("content")}
                            helperText={getFieldError("content")}
                        />
                    </Stack>
                    
                    <Stack direction="row" mt={3} gap={2}>
                        <Button 
                            variant="contained" 
                            onClick={() => handleSubmit("publish")}
                            disabled={isSubmitting()}
                        >
                            {isSubmitting() ? "Updating..." : "Update & Publish"}
                        </Button>
                        <Button 
                            color="warning" 
                            onClick={() => handleSubmit("draft")}
                            disabled={isSubmitting()}
                        >
                            {isSubmitting() ? "Saving..." : "Save as Draft"}
                        </Button>
                        <Button 
                            variant="outlined"
                            onClick={() => navigate("/")}
                            disabled={isSubmitting()}
                        >
                            Cancel
                        </Button>
                    </Stack>
                </Show>
            </Box>
        </>
    )
}
