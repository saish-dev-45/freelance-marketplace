import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import NotificationBell from "../../components/NotificationBell";
import "../../style/ClientDashboard.css";

function FreelancerJobDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [job, setJob] = useState(null);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [application, setApplication] = useState(null);

  useEffect(() => {
    fetchJobDetails();
  }, [projectId]);

  const skillArray = useMemo(() => {
    return job?.skills
      ? job.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : [];
  }, [job]);

  const formatBudget = (budget) => {
    const amount = Number(budget || 0);
    return `Rs. ${amount.toLocaleString("en-IN")}`;
  };

  const fetchJobDetails = async () => {
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

      const currentUser = authResponse.data;

      if (currentUser.role !== "FREELANCER") {
        alert("Access Denied: Only freelancers can view job details");
        navigate("/");
        return;
      }

      setUser(currentUser);

      const projectResponse = await axios.get(`http://localhost:9092/projects/open/${projectId}`, {
        withCredentials: true,
      });

      if (typeof projectResponse.data === "string") {
        alert(projectResponse.data);
        if (projectResponse.data.toLowerCase().includes("login")) {
          navigate("/login");
        } else {
          navigate("/freelancer");
        }
        return;
      }

      setJob(projectResponse.data);
    } catch (error) {
      console.error("Error loading job details:", error);
      alert("Failed to load job details. Please try again.");
      navigate("/freelancer");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:9092/auth/logout",
        {},
        {
          withCredentials: true,
        },
      );
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const handleApply = async (event) => {
    event.preventDefault();

    if (!resume) {
      alert("Please upload your resume before applying.");
      return;
    }

    if (!["application/pdf", "image/jpeg", "image/jpg", "image/png"].includes(resume.type)) {
      alert("Only PDF, JPG, and PNG resume files are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);

    setApplying(true);

    try {
      const response = await axios.post(`http://localhost:9092/applications/project/${projectId}`, formData, {
        withCredentials: true,
      });

      if (typeof response.data === "string") {
        alert(response.data);
        if (response.data.toLowerCase().includes("login")) {
          navigate("/login");
        }
        return;
      }

      setApplication(response.data);
      alert("Application submitted successfully!");
    } catch (error) {
      console.error("Application failed:", error);
      alert(error.response?.data || "Failed to apply for this job. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-wrapper" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h2 style={{ color: "#16a34a", fontFamily: "Inter, sans-serif" }}>Loading Job...</h2>
      </div>
    );
  }

  if (!job) {
    return null;
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
            <button className="db-user-info db-user-profile-trigger" onClick={() => navigate("/freelancer")}>
              <span>{user.name}</span>
              <span style={{ color: "#6b7280", fontSize: "0.8rem" }}>({user.username})</span>
            </button>
          )}
          <button className="btn-db-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="db-container">
        <section className="db-header job-detail-header">
          <div className="db-header-left">
            <button className="btn-modal-cancel job-back-btn" onClick={() => navigate("/freelancer")}>
              Back to Jobs
            </button>
            <h1>{job.title}</h1>
            <p>Review the complete project details and apply with your resume.</p>
          </div>
          <span className={`status-badge ${(job.status || "open").toLowerCase()}`}>{job.status || "OPEN"}</span>
        </section>

        <section className="job-detail-layout">
          <article className="job-detail-main">
            <div className="job-detail-section">
              <h2 className="db-section-title">Project Description</h2>
              <p className="job-description-full">{job.description}</p>
            </div>

            {skillArray.length > 0 && (
              <div className="job-detail-section">
                <h2 className="db-section-title">Required Skills</h2>
                <div className="skills-tags job-detail-skills">
                  {skillArray.map((skill) => (
                    <span key={skill} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>

          <aside className="job-apply-panel">
            <div className="project-meta job-detail-meta">
              <div className="meta-item">
                <span className="meta-label">Budget</span>
                <span className="meta-value budget-value">{formatBudget(job.budget)}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Deadline</span>
                <span className="meta-value">{job.deadline || "N/A"}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Client</span>
                <span className="meta-value">{job.clientName || job.clientUsername || "Client"}</span>
              </div>
            </div>

            {application ? (
              <div className="application-success">
                <span className="status-badge open">{application.status}</span>
                <h3>Application Submitted</h3>
                <p>Your application has been saved and sent to the client.</p>
              </div>
            ) : (
              <form className="modal-form job-apply-form" onSubmit={handleApply}>
                <div className="modal-form-group">
                  <label htmlFor="resume">Resume</label>
                  <input
                    id="resume"
                    type="file"
                    accept="application/pdf,image/png,image/jpeg,image/jpg"
                    onChange={(event) => setResume(event.target.files?.[0] || null)}
                    required
                  />
                  <span className="form-helper">Upload a PDF, JPG, or PNG resume file up to 10 MB.</span>
                </div>

                <button type="submit" className="btn-create-proj" disabled={applying}>
                  {applying ? "Applying..." : "Apply for Job"}
                </button>
              </form>
            )}
          </aside>
        </section>
      </main>
    </div>
  );
}

export default FreelancerJobDetails;
