import { Box, Button, Card, CardActions, CardContent, Chip, Dialog, DialogActions, DialogTitle, Stack, Typography } from "@suid/material";
import { createSignal, Show } from "solid-js";

export default function ArticleCard(kwargs: {
    isDraft?: boolean;
    previewMode?: boolean;
    
    onDelete?: () => Promise<void>;
    editUrl?: string;
    
    title: string;
    content: string;
    category: string;
}) {
    kwargs.previewMode ??= false;
    kwargs.isDraft ??= false;
    
    if (kwargs.previewMode && kwargs.isDraft)
        return <></>;
    
    const [openDeleteDialog, setOpenDeleteDialog] = createSignal(false);

    return (
        <>
            <Box sx={{ position: "relative", overflow: "hidden" }}>
                <Card style={{ "box-shadow": "none" }}>
                    <CardContent>
                        <Typography variant="h5" fontWeight="500" mb={1}>{kwargs.title}</Typography>
                        <Typography 
                            component="p" 
                            variant="body2" 
                            sx={{ wordWrap: "break-word" }}
                        >
                            {kwargs.content}
                        </Typography>
                        <Stack direction="row" spacing={1} mt={1}>
                            <Chip label={kwargs.category} />
                        </Stack>
                    </CardContent>
                    <Show when={!kwargs.previewMode}>
                        <CardActions>
                            <Show when={kwargs.editUrl}>
                                <Button href={kwargs.editUrl}>Edit</Button>
                            </Show>
                            <Button color="error" on:click={_ => setOpenDeleteDialog(true)}>Delete</Button>
                        </CardActions>
                    </Show>
                </Card>
                <Show when={kwargs.isDraft}>
                    <Box
                        sx={{
                            position: "absolute",
                            top: "20px",
                            right: "-38px",
                            transform: "rotate(45deg)",
                            backgroundColor: "#ff9800",
                            color: "white",
                            padding: "6px 50px",
                            zIndex: 1,
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px"
                        }}
                    >
                        <Typography variant="caption">Draft</Typography>
                    </Box>
                </Show>
            </Box>
            
            <Dialog
                open={openDeleteDialog()}
            >
                <DialogTitle>{`Are you sure you want to delete "${kwargs.title}"?`}</DialogTitle>
                <DialogActions>
                    <Button on:click={async _ => {
                        setOpenDeleteDialog(false);
                        await kwargs.onDelete();
                    }} variant="contained" color="error">Delete</Button>
                    <Button on:click={_ => setOpenDeleteDialog(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
