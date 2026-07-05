import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../../style/ClientDashboard.css";

function ClientProjectMilestones() {
  const { projectId, applicationId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [application, setApplication] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [projectId, applicationId]);

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

      if (authResponse.data.role !== "CLIENT") {
        alert("Access Denied: Only clients can manage milestones");
        navigate("/");
        return;
      }

      setUser(authResponse.data);

      const applicationsResponse = await axios.get(
        `http://localhost:9092/applications/project/${projectId}`,
        { withCredentials: true },
      );

      if (!Array.isArray(applicationsResponse.data)) {
        alert(applicationsResponse.data || "Failed to load application details");
        navigate(`/client/projects/${projectId}/applications`);
        return;
      }

      const matchedApplication = applicationsResponse.data.find(
        (item) => String(item.id) === String(applicationId),
      );

      if (!matchedApplication) {
        alert("Application not found");
        navigate(`/client/projects/${projectId}/applications`);
        return;
      }

      if (matchedApplication.status !== "ACCEPTED") {
        alert("Milestones can only be managed for accepted applications");
        navigate(`/client/projects/${projectId}/applications`);
        return;
      }

      setApplication(matchedApplication);
      await fetchMilestones();
    } catch (error) {
      console.error("Failed to load milestone page:", error);
      alert("Failed to load milestones. Please try again.");
      navigate("/client");
    } finally {
      setLoading(false);
    }
  };

  const fetchMilestones = async () => {
    try {
      const response = await axios.get(
        `http://localhost:9092/milestones/application/${applicationId}`,
        { withCredentials: true },
      );

      if (Array.isArray(response.data)) {
        setMilestones(response.data);
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

  const handleCreateMilestone = async (event) => {
    event.preventDefault();

    if (!newTitle.trim()) {
      alert("Please enter a milestone title");
      return;
    }

    setCreating(true);

    try {
      const response = await axios.post(
        `http://localhost:9092/milestones/application/${applicationId}`,
        { title: newTitle.trim() },
        { withCredentials: true },
      );

      if (typeof response.data === "string") {
        alert(response.data);
        if (response.data.toLowerCase().includes("login")) {
          navigate("/login");
        }
        return;
      }

      setMilestones((currentMilestones) => [...currentMilestones, response.data]);
      setNewTitle("");
      alert("Milestone created successfully!");
    } catch (error) {
      console.error("Failed to create milestone:", error);
      alert(error.response?.data || "Failed to create milestone. Please try again.");
    } finally {
      setCreating(false);
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
              onClick={() => navigate(`/client/projects/${projectId}/applications`)}
            >
              Back to Applications
            </button>
            <h1>Project Milestones</h1>
            <p>
              Define milestones for {application?.freelancerName} on {application?.projectTitle}.
              When all milestones are completed, the project will be marked as completed automatically.
            </p>
          </div>
          <button className="btn-create-proj" onClick={fetchMilestones}>
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

        <div className="milestone-layout">
          <section className="milestone-create-panel">
            <h2 className="db-section-title">Create Milestone</h2>
            <form onSubmit={handleCreateMilestone} className="milestone-create-form">
              <div className="modal-form-group">
                <label htmlFor="milestone-title">Milestone Title</label>
                <input
                  id="milestone-title"
                  type="text"
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  placeholder="e.g. User Login Module"
                  required
                />
              </div>
              <button type="submit" className="btn-modal-save" disabled={creating}>
                {creating ? "Creating..." : "Add Milestone"}
              </button>
            </form>
          </section>

          <section className="milestone-list-panel">
            <h2 className="db-section-title">Milestone Progress</h2>

            {milestones.length === 0 ? (
              <div className="empty-state milestone-empty-state">
                <div className="empty-icon-fallback">
                  <span className="empty-icon-inner"></span>
                </div>
                <h3>No Milestones Yet</h3>
                <p>Create milestones like login, checkout, or admin panel so the freelancer knows what to deliver step by step.</p>
              </div>
            ) : (
              <div className="milestone-list">
                {milestones.map((milestone, index) => (
                  <div key={milestone.id} className="milestone-item">
                    <div className="milestone-item-left">
                      <span className="milestone-index">{index + 1}</span>
                      <div>
                        <h3>{milestone.title}</h3>
                        <p>Assigned to {application?.freelancerName}</p>
                      </div>
                    </div>
                    <span className={`status-badge ${milestone.completed ? "completed" : "pending"}`}>
                      {milestone.completed ? "Completed" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default ClientProjectMilestones;
