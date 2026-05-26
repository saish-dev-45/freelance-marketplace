
import {
    createBrowserRouter,
    RouterProvider
} from "react-router-dom";

import Registeration from "./pages/Registeration";
import Login from "./pages/Login";
import Index from "./pages/Index";

const router = createBrowserRouter([

    {
        path: "/register",
        element: <Registeration />
    },

    {
        path: "/login",
        element: <Login />
    },
    {
        path:"/",
        element:<Index/>
    }
]);

function Router() {

    return (
        <RouterProvider router={router} />
    );
}

export default Router;
