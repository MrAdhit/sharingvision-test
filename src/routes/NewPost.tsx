import { Box, Button, Stack, TextField, Typography } from "@suid/material";
import Navbar from "../components/Navbar";
import { createSignal } from "solid-js";
import { createArticle } from "../module/api";
import { useNavigate } from "@solidjs/router";

export default function NewPost() {
    const navigate = useNavigate();

    const [title, setTitle] = createSignal("");
    const [content, setContent] = createSignal("");
    const [category, setCategory] = createSignal("");

    const [isSubmitting, setIsSubmitting] = createSignal(false);
    const [fieldErrors, setFieldErrors] = createSignal<Record<string, string>>({});

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
            await createArticle({
                title: title(),
                content: content(),
                category: category(),
                status: status,
            });
            
            setTitle("");
            setContent("");
            setCategory("");

            navigate("/");
        } catch (error) {
            console.error("Failed to create article:", error);
            
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
            
            setFieldErrors({ general: "Failed to create article. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Navbar />
            <Box m={3}>
                <Typography variant="h5" fontWeight={500} mb={3}>Create a new article</Typography>

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
                        {isSubmitting() ? "Publishing..." : "Publish"}
                    </Button>
                    <Button 
                        color="warning" 
                        onClick={() => handleSubmit("draft")}
                        disabled={isSubmitting()}
                    >
                        {isSubmitting() ? "Saving..." : "Draft"}
                    </Button>
                </Stack>
            </Box>
        </>
    )
}
