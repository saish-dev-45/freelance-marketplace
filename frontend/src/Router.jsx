import {
    createBrowserRouter,
    RouterProvider
} from "react-router-dom";

import Registeration from "./pages/Registeration";
import Login from "./pages/Login";
import Index from "./pages/Index";
import ClientDashboard from "./pages/client/ClientDashboard";
import CreateProject from "./pages/client/CreateProject";
import ClientProjectApplications from "./pages/client/ClientProjectApplications";
import ClientProjectMilestones from "./pages/client/ClientProjectMilestones";
import FreelancerDashboard from "./pages/Freelencer/FreelancerDashboard";
import FreelancerAppliedJobs from "./pages/Freelencer/FreelancerAppliedJobs";
import FreelancerJobDetails from "./pages/Freelencer/FreelancerJobDetails";
import FreelancerProjectMilestones from "./pages/Freelencer/FreelancerProjectMilestones";
import TopPerformingFreelancers from "./pages/TopPerformingFreelancers";

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
    },
    {
        path: "/client",
        element: <ClientDashboard />
    },
    {
        path: "/client/create-project",
        element: <CreateProject />
    },
    {
        path: "/client/projects/:projectId/applications",
        element: <ClientProjectApplications />
    },
    {
        path: "/client/projects/:projectId/applications/:applicationId/milestones",
        element: <ClientProjectMilestones />
    },
    {
        path: "/freelancer",
        element: <FreelancerDashboard />
    },
    {
        path: "/freelancer/applied-jobs",
        element: <FreelancerAppliedJobs />
    },
    {
        path: "/freelancer/applications/:applicationId/milestones",
        element: <FreelancerProjectMilestones />
    },
    {
        path: "/freelancer/jobs/:projectId",
        element: <FreelancerJobDetails />
    },
    {
        path: "/top-freelancers",
        element: <TopPerformingFreelancers />
    }
]);

function Router() {

    return (
        <RouterProvider router={router} />
    );
}

export default Router;
