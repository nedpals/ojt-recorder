import { Outlet } from "react-router-dom";

export default function Wizard() {
    return (
        <div>
            This is a wizard page.

            <Outlet />
        </div>
    );
}
