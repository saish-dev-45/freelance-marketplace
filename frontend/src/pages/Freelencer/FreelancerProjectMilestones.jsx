import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import NotificationBell from "../../components/NotificationBell";
import "../../style/ClientDashboard.css";

function FreelancerProjectMilestones() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [application, setApplication] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [applicationId]);

  const stats = useMemo(() => {
    return {
      total: milestones.length,
      completed: milestones.filter((milestone) => milestone.completed).length,
      pending: milestones.filter((milestone) => !milestone.completed).length,
    };
  }, [milestones]);

  const fetchData = async () => {
    setLoading(true);

    try {
      const authResponse = await axios.get("http://localhost:9092/auth/me", {
        withCredentials: true,
      });

      if (!authResponse.data) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      if (authResponse.data.role !== "FREELANCER") {
        alert("Access Denied: Only freelancers can view milestones");
        navigate("/");
        return;
      }

      setUser(authResponse.data);

      const applicationsResponse = await axios.get(
        "http://localhost:9092/applications/my-applications",
        { withCredentials: true },
      );

      if (!Array.isArray(applicationsResponse.data)) {
        alert(applicationsResponse.data || "Failed to load application details");
        navigate("/freelancer/applied-jobs");
        return;
      }

      const matchedApplication = applicationsResponse.data.find(
        (item) => String(item.id) === String(applicationId),
      );

      if (!matchedApplication) {
        alert("Application not found");
        navigate("/freelancer/applied-jobs");
        return;
      }

      if (matchedApplication.status !== "ACCEPTED") {
        alert("Milestones are available only for accepted applications");
        navigate("/freelancer/applied-jobs");
        return;
      }

      setApplication(matchedApplication);
      await fetchMilestones(matchedApplication);
    } catch (error) {
      console.error("Failed to load milestone page:", error);
      alert("Failed to load milestones. Please try again.");
      navigate("/freelancer");
    } finally {
      setLoading(false);
    }
  };

  const fetchMilestones = async (currentApplication = application) => {
    try {
      const response = await axios.get(
        `http://localhost:9092/milestones/application/${applicationId}`,
        { withCredentials: true },
      );

      if (Array.isArray(response.data)) {
        setMilestones(response.data);

        if (
          currentApplication &&
          response.data.length > 0 &&
          response.data.every((milestone) => milestone.completed)
        ) {
          setApplication((prev) =>
            prev ? { ...prev, projectStatus: "COMPLETED" } : prev,
          );
        }
      } else {
        alert(response.data || "Failed to load milestones");
      }
    } catch (error) {
      console.error("Failed to load milestones:", error);
      alert("Failed to load milestones. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:9092/auth/logout", {}, {
        withCredentials: true,
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const handleCompleteMilestone = async (milestoneId) => {
    setCompletingId(milestoneId);

    try {
      const response = await axios.put(
        `http://localhost:9092/milestones/${milestoneId}/complete`,
        {},
        { withCredentials: true },
      );

      if (typeof response.data === "string") {
        alert(response.data);
        if (response.data.toLowerCase().includes("login")) {
          navigate("/login");
        }
        return;
      }

      setMilestones((currentMilestones) =>
        currentMilestones.map((milestone) =>
          milestone.id === milestoneId ? response.data : milestone,
        ),
      );

      const updatedMilestones = milestones.map((milestone) =>
        milestone.id === milestoneId ? response.data : milestone,
      );

      if (
        updatedMilestones.length > 0 &&
        updatedMilestones.every((milestone) => milestone.completed)
      ) {
        setApplication((prev) =>
          prev ? { ...prev, projectStatus: "COMPLETED" } : prev,
        );
        alert("All milestones completed! The project has been marked as completed.");
      } else {
        alert("Milestone marked as completed!");
      }
    } catch (error) {
      console.error("Failed to complete milestone:", error);
      alert(error.response?.data || "Failed to complete milestone. Please try again.");
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-wrapper" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h2 style={{ color: "#16a34a", fontFamily: "Inter, sans-serif" }}>Loading Milestones...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <nav className="db-navbar">
        <div className="db-logo" onClick={() => navigate("/")}>
          <span className="db-logo-dot"></span>
          Freelance Marketplace
        </div>

        <div className="db-nav-right">
          <NotificationBell />
          {user && (
            <div className="db-user-info">
              <span>{user.name}</span>
              <span style={{ color: "#6b7280", fontSize: "0.8rem" }}>({user.username})</span>
            </div>
          )}
          <button className="btn-db-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="db-container">
        <section className="db-header">
          <div className="db-header-left">
            <button
              className="btn-modal-cancel job-back-btn"
              onClick={() => navigate("/freelancer/applied-jobs")}
            >
              Back to Applied Jobs
            </button>
            <h1>{application?.projectTitle}</h1>
            <p>
              Complete each milestone assigned by the client. Once every milestone is done,
              the project will automatically move to completed status.
            </p>
          </div>
          <button className="btn-create-proj" onClick={() => fetchMilestones()}>
            Refresh Milestones
          </button>
        </section>

        <section className="db-stats-grid">
          <div className="stat-card primary">
            <div className="stat-title">Total Milestones</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-title">Pending</div>
            <div className="stat-value">{stats.pending}</div>
          </div>
          <div className="stat-card success">
            <div className="stat-title">Completed</div>
            <div className="stat-value">{stats.completed}</div>
          </div>
          <div className="stat-card info">
            <div className="stat-title">Project Status</div>
            <div className="stat-value" style={{ fontSize: "1.1rem" }}>
              {application?.projectStatus || "IN_PROGRESS"}
            </div>
          </div>
        </section>

        <h2 className="db-section-title">Your Milestones</h2>

        {milestones.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-fallback">
              <span className="empty-icon-inner"></span>
            </div>
            <h3>No Milestones Assigned Yet</h3>
            <p>The client has not created any milestones for this project yet. Check back after they define the deliverables.</p>
            <button className="btn-create-proj" onClick={() => navigate("/freelancer/applied-jobs")}>
              Back to Applied Jobs
            </button>
          </div>
        ) : (
          <div className="milestone-list">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="milestone-item">
                <div className="milestone-item-left">
                  <span className="milestone-index">{index + 1}</span>
                  <div>
                    <h3>{milestone.title}</h3>
                    <p>Client: {application?.clientName || application?.clientUsername || "Client"}</p>
                  </div>
                </div>

                <div className="milestone-item-actions">
                  <span className={`status-badge ${milestone.completed ? "completed" : "pending"}`}>
                    {milestone.completed ? "Completed" : "Pending"}
                  </span>
                  {!milestone.completed && (
                    <button
                      className="btn-action-edit"
                      onClick={() => handleCompleteMilestone(milestone.id)}
                      disabled={completingId === milestone.id}
                    >
                      {completingId === milestone.id ? "Saving..." : "Mark Complete"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default FreelancerProjectMilestones;
