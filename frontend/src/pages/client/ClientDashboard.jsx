import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../style/ClientDashboard.css";

function ClientDashboard() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Edit form states
  const [editingProject, setEditingProject] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editBudget, setEditBudget] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editSkills, setEditSkills] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfileAndProjects();
  }, []);

  const fetchProfileAndProjects = async () => {
    try {
      // 1. Fetch user session
      const authResponse = await axios.get("http://localhost:9092/auth/me", {
        withCredentials: true,
      });

      if (!authResponse.data) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      const currentUser = authResponse.data;
      
      // Check if user is a client
      if (currentUser.role !== "CLIENT") {
        alert("Access Denied: Only clients can access this dashboard");
        navigate("/");
        return;
      }

      setUser(currentUser);

      // 2. Fetch projects
      const projectsResponse = await axios.get("http://localhost:9092/projects/my-projects", {
        withCredentials: true,
      });

      if (Array.isArray(projectsResponse.data)) {
        setProjects(projectsResponse.data);
      } else {
        console.error("Expected projects array, received:", projectsResponse.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      alert("Failed to load dashboard data. Please login again.");
      navigate("/login");
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

  const openEditModal = (project) => {
    setEditingProject(project);
    setEditTitle(project.title);
    setEditDescription(project.description);
    setEditBudget(project.budget);
    setEditDeadline(project.deadline || "");
    setEditSkills(project.skills || "");
    setEditStatus(project.status || "OPEN");
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTitle || !editDescription || !editBudget || !editDeadline || !editSkills) {
      alert("Please fill in all required fields.");
      return;
    }
    if (parseFloat(editBudget) <= 0) {
      alert("Budget must be a positive number.");
      return;
    }

    setSaving(true);
    try {
      const response = await axios.put(
        `http://localhost:9092/projects/${editingProject.id}`,
        {
          title: editTitle,
          description: editDescription,
          budget: parseFloat(editBudget),
          deadline: editDeadline,
          skills: editSkills,
          status: editStatus,
        },
        {
          withCredentials: true,
        }
      );

      if (typeof response.data === "string" && response.data.includes("login")) {
        alert(response.data);
        navigate("/login");
      } else {
        alert("Project updated successfully!");
        setEditingProject(null);
        fetchProfileAndProjects();
      }
    } catch (error) {
      console.error("Project update failed:", error);
      alert("Failed to update project. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:9092/projects/${projectId}`, {
        withCredentials: true,
      });

      if (typeof response.data === "string" && response.data.includes("login")) {
        alert(response.data);
        navigate("/login");
      } else {
        alert("Project deleted successfully!");
        fetchProfileAndProjects();
      }
    } catch (error) {
      console.error("Project deletion failed:", error);
      alert("Failed to delete project. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="dashboard-wrapper" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h2 style={{ color: "#16a34a", fontFamily: "Inter, sans-serif" }}>Loading Dashboard...</h2>
      </div>
    );
  }

  // Calculate statistics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === "OPEN" || p.status === "IN_PROGRESS").length;
  const completedProjects = projects.filter(p => p.status === "COMPLETED").length;
  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);

  return (
    <div className="dashboard-wrapper">
      {/* NAVBAR */}
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
          <button className="btn-db-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* DASHBOARD CONTAINER */}
      <main className="db-container">
        
        {/* HEADER */}
        <section className="db-header">
          <div className="db-header-left">
            <h1>Client Dashboard</h1>
            <p>Manage your projects, budgets, and hire top freelancers.</p>
          </div>
          <div className="dashboard-header-actions">
            <button className="btn-modal-cancel" onClick={() => navigate("/top-freelancers")}>
              Top performing freelancers
            </button>
            <button className="btn-create-proj" onClick={() => navigate("/client/create-project")}>
              <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>+</span> Post a New Project
            </button>
          </div>
        </section>

        {/* METRICS */}
        <section className="db-stats-grid">
          <div className="stat-card primary">
            <div className="stat-title">Total Projects</div>
            <div className="stat-value">{totalProjects}</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-title">Active Projects</div>
            <div className="stat-value">{activeProjects}</div>
          </div>
          <div className="stat-card success">
            <div className="stat-title">Completed Projects</div>
            <div className="stat-value">{completedProjects}</div>
          </div>
          <div className="stat-card info">
            <div className="stat-title">Total Budget Allocated</div>
            <div className="stat-value">₹{totalBudget.toLocaleString("en-IN")}</div>
          </div>
        </section>

        {/* PROJECTS SECTION */}
        <h2 className="db-section-title">Your Posted Projects</h2>

        {projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-fallback">
              <span className="empty-icon-inner"></span>
            </div>
            <h3>No Projects Posted Yet</h3>
            <p>Ready to hire? Create your first project posting so that verified freelancers can see it and send proposals.</p>
            <button className="btn-create-proj" onClick={() => navigate("/client/create-project")}>
              Post Your First Project
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => {
              // Parse skills into array
              const skillArray = project.skills 
                ? project.skills.split(",").map(s => s.trim()).filter(s => s.length > 0)
                : [];

              return (
                <div key={project.id} className="project-card">
                  <div>
                    <div className="project-header">
                      <h3 className="project-title">{project.title}</h3>
                      <span className={`status-badge ${project.status.toLowerCase()}`}>
                        {project.status}
                      </span>
                    </div>

                    <p className="project-desc">{project.description}</p>

                    {skillArray.length > 0 && (
                      <div className="skills-tags">
                        {skillArray.map((skill, idx) => (
                          <span key={idx} className="skill-tag">{skill}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="project-meta">
                      <div className="meta-item">
                        <span className="meta-label">Budget</span>
                        <span className="meta-value budget-value">₹{project.budget.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="meta-item" style={{ alignItems: "flex-end" }}>
                        <span className="meta-label">Deadline</span>
                        <span className="meta-value">{project.deadline || "N/A"}</span>
                      </div>
                    </div>

                    {/* EDIT / DELETE ACTIONS */}
                    <div className="project-actions client-project-actions">
                      <button className="btn-action-edit" onClick={() => navigate(`/client/projects/${project.id}/applications`)}>
                        Applications
                      </button>
                      <button className="btn-action-edit" onClick={() => openEditModal(project)}>
                        Edit
                      </button>
                      <button className="btn-action-delete" onClick={() => handleDelete(project.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* EDIT GLASSY MODAL OVERLAY */}
      {editingProject && (
        <div className="modal-overlay" onClick={() => setEditingProject(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Project Details</h2>
              <button className="btn-modal-close" onClick={() => setEditingProject(null)}>&times;</button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="modal-form">
              {/* Title */}
              <div className="modal-form-group">
                <label htmlFor="edit-title">Project Title</label>
                <input
                  id="edit-title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="modal-form-group">
                <label htmlFor="edit-desc">Description</label>
                <textarea
                  id="edit-desc"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="modal-form-row">
                {/* Budget */}
                <div className="modal-form-group">
                  <label htmlFor="edit-budget">Budget (INR)</label>
                  <input
                    id="edit-budget"
                    type="number"
                    min="1"
                    value={editBudget}
                    onChange={(e) => setEditBudget(e.target.value)}
                    required
                  />
                </div>

                {/* Deadline */}
                <div className="modal-form-group">
                  <label htmlFor="edit-deadline">Deadline</label>
                  <input
                    id="edit-deadline"
                    type="date"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-form-row">
                {/* Skills */}
                <div className="modal-form-group">
                  <label htmlFor="edit-skills">Skills (Comma separated)</label>
                  <input
                    id="edit-skills"
                    type="text"
                    value={editSkills}
                    onChange={(e) => setEditSkills(e.target.value)}
                    required
                  />
                </div>

                {/* Status Dropdown */}
                <div className="modal-form-group">
                  <label htmlFor="edit-status">Project Status</label>
                  <select
                    id="edit-status"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="status-select"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn-modal-cancel" onClick={() => setEditingProject(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-save" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientDashboard;
