import { createBrowserRouter } from "react-router-dom";

// Pages
import Editor from "./pages/Editor";
import List from "./pages/List";
import Login from "./pages/Login";
import Wizard from "./pages/Wizard";

// Wizard pages
import HoursWizard from "./pages/wizard/Hours";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Editor />
    },
    {
        path: "/list",
        element: <List />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/wizard",
        element: <Wizard />,
        children: [
            {
                path: "hours",
                element: <HoursWizard />
            }
        ]
    }
]);
