import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../../components/NotificationBell";
import "../../style/ClientDashboard.css";

function FreelancerAppliedJobs() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppliedJobs();
  }, []);

  const formatBudget = (budget) => {
    const amount = Number(budget || 0);
    return `Rs. ${amount.toLocaleString("en-IN")}`;
  };

  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter((application) => application.status === "PENDING").length,
      accepted: applications.filter((application) => application.status === "ACCEPTED").length,
      rejected: applications.filter((application) => application.status === "REJECTED").length,
    };
  }, [applications]);

  const fetchAppliedJobs = async () => {
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
        alert("Access Denied: Only freelancers can view applied jobs");
        navigate("/");
        return;
      }

      setUser(authResponse.data);

      const response = await axios.get("http://localhost:9092/applications/my-applications", {
        withCredentials: true,
      });

      if (Array.isArray(response.data)) {
        setApplications(response.data);
      } else if (typeof response.data === "string") {
        alert(response.data);
        if (response.data.toLowerCase().includes("login")) {
          navigate("/login");
        }
      }
    } catch (error) {
      console.error("Failed to load applied jobs:", error);
      alert("Failed to load applied jobs. Please try again.");
      navigate("/freelancer");
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="dashboard-wrapper" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h2 style={{ color: "#16a34a", fontFamily: "Inter, sans-serif" }}>Loading Applied Jobs...</h2>
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
            <button className="btn-modal-cancel job-back-btn" onClick={() => navigate("/freelancer")}>
              Back to Dashboard
            </button>
            <h1>Applied Jobs</h1>
            <p>Track every project you have applied for and review your application status.</p>
          </div>
          <div className="dashboard-header-actions">
            <button className="btn-modal-cancel" onClick={() => navigate("/top-freelancers")}>
              Top performing freelancers
            </button>
            <button className="btn-create-proj" onClick={fetchAppliedJobs}>
              Refresh Applications
            </button>
          </div>
        </section>

        <section className="db-stats-grid">
          <div className="stat-card primary">
            <div className="stat-title">Applications</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-title">Pending</div>
            <div className="stat-value">{stats.pending}</div>
          </div>
          <div className="stat-card success">
            <div className="stat-title">Accepted</div>
            <div className="stat-value">{stats.accepted}</div>
          </div>
          <div className="stat-card info">
            <div className="stat-title">Rejected</div>
            <div className="stat-value">{stats.rejected}</div>
          </div>
        </section>

        <h2 className="db-section-title">Your Applications</h2>

        {applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-fallback">
              <span className="empty-icon-inner"></span>
            </div>
            <h3>No Applications Yet</h3>
            <p>Apply to open jobs from your freelancer dashboard and they will appear here.</p>
            <button className="btn-create-proj" onClick={() => navigate("/freelancer")}>
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {applications.map((application) => (
              <div key={application.id} className="project-card">
                <div>
                  <div className="project-header">
                    <h3 className="project-title">{application.projectTitle}</h3>
                    <span className={`status-badge ${(application.status || "pending").toLowerCase()}`}>
                      {application.status}
                    </span>
                  </div>
                  <p className="project-desc">{application.projectDescription}</p>
                </div>

                <div>
                  <div className="project-meta">
                    <div className="meta-item">
                      <span className="meta-label">Budget</span>
                      <span className="meta-value budget-value">{formatBudget(application.projectBudget)}</span>
                    </div>
                    <div className="meta-item" style={{ alignItems: "flex-end" }}>
                      <span className="meta-label">Deadline</span>
                      <span className="meta-value">{application.projectDeadline || "N/A"}</span>
                    </div>
                  </div>

                  <div className="project-actions freelancer-job-actions">
                    <div className="client-chip">
                      <span className="meta-label">Client</span>
                      <span className="meta-value">{application.clientName || application.clientUsername || "Client"}</span>
                    </div>
                    {application.status === "ACCEPTED" ? (
                      <button
                        className="btn-action-edit"
                        onClick={() => navigate(`/freelancer/applications/${application.id}/milestones`)}
                      >
                        View Milestones
                      </button>
                    ) : (
                      <button className="btn-action-edit" onClick={() => navigate(`/freelancer/jobs/${application.projectId}`)}>
                        View Job
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default FreelancerAppliedJobs;
