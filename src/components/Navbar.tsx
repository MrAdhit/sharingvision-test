import { AppBar, Button, Stack, Toolbar, Typography } from "@suid/material";

export default function Navbar(kwargs: { name?: string; }) {
    return <>
        <AppBar position="static" style={{ "box-shadow": "none" }}>
            <Toolbar>
                <Typography variant="h6" component="div" mr="2rem">{kwargs.name ?? "Dashboard"}</Typography>
                <Stack direction="row" gap={1}>
                    <Button variant="text" color="inherit" href="/">All Posts</Button>
                    <Button variant="text" color="inherit" href="/new">Add New</Button>
                    <Button variant="text" color="inherit" href="/preview">Preview</Button>
                </Stack>
            </Toolbar>
        </AppBar>
    </>
}
