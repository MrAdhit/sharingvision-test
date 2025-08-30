/* @refresh reload */
import { render } from "solid-js/web";
import { Route, Router } from "@solidjs/router";

import AllPosts from "./routes/AllPosts";
import NewPost from "./routes/NewPost";
import EditPost from "./routes/EditPost";
import Preview from "./routes/Preview";

render(() => (
    <Router>
        {/* In a perfect world, I would refine these routes to make more sense, but at least for now it works */}
        <Route path="/" component={AllPosts} />
        <Route path="/new" component={NewPost} />
        <Route path="/edit/:id" component={EditPost} />
        <Route path="/preview" component={Preview} />
    </Router>
), document.getElementById("root")!);
