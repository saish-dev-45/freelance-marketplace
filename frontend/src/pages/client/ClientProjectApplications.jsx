import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../../style/ClientDashboard.css";

const API_BASE_URL = "http://localhost:9092";

function renderStars(rating) {
  const roundedRating = Math.round(Number(rating || 0));

  return (
    <div className="leaderboard-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= roundedRating ? "star-filled" : "star-empty"}>
          ★
        </span>
      ))}
    </div>
  );
}

function ClientProjectApplications() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [reviewApplication, setReviewApplication] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [projectId]);

  const projectTitle = applications[0]?.projectTitle || "Project Applications";

  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter((application) => application.status === "PENDING").length,
      accepted: applications.filter((application) => application.status === "ACCEPTED").length,
      rejected: applications.filter((application) => application.status === "REJECTED").length,
    };
  }, [applications]);

  const fetchApplications = async () => {
    setLoading(true);

    try {
      const authResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
        withCredentials: true,
      });

      if (!authResponse.data) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      if (authResponse.data.role !== "CLIENT") {
        alert("Access Denied: Only clients can view applications");
        navigate("/");
        return;
      }

      setUser(authResponse.data);

      const response = await axios.get(`${API_BASE_URL}/applications/project/${projectId}`, {
        withCredentials: true,
      });

      if (Array.isArray(response.data)) {
        setApplications(response.data);
      } else if (typeof response.data === "string") {
        alert(response.data);
        if (response.data.toLowerCase().includes("login")) {
          navigate("/login");
        } else {
          navigate("/client");
        }
      }
    } catch (error) {
      console.error("Failed to load applications:", error);
      alert("Failed to load applications. Please try again.");
      navigate("/client");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
        withCredentials: true,
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  };

  const handleStatusChange = async (applicationId, status) => {
    setUpdatingId(applicationId);

    try {
      const response = await axios.put(
        `${API_BASE_URL}/applications/${applicationId}/status`,
        { status },
        {
          withCredentials: true,
        },
      );

      if (typeof response.data === "string") {
        alert(response.data);
        if (response.data.toLowerCase().includes("login")) {
          navigate("/login");
        }
        return;
      }

      setApplications((currentApplications) =>
        currentApplications.map((application) =>
          application.id === applicationId ? response.data : application,
        ),
      );
      alert("Application status updated successfully!");
    } catch (error) {
      console.error("Failed to update application status:", error);
      alert(error.response?.data || "Failed to update application status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const canReviewApplication = (application) =>
    application.status === "ACCEPTED" &&
    application.projectStatus === "COMPLETED";

  const openReviewModal = async (application) => {
    setReviewApplication(application);
    setReviewRating(5);
    setReviewFeedback("");
    setExistingReview(null);
    setReviewLoading(true);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/reviews/application/${application.id}`,
        { withCredentials: true },
      );

      if (response.data && typeof response.data === "object") {
        setExistingReview(response.data);
        setReviewRating(response.data.rating || 5);
        setReviewFeedback(response.data.feedback || "");
      } else if (typeof response.data === "string" && response.data !== "") {
        alert(response.data);
      }
    } catch (error) {
      console.error("Failed to load review:", error);
    } finally {
      setReviewLoading(false);
    }
  };

  const closeReviewModal = () => {
    setReviewApplication(null);
    setExistingReview(null);
    setReviewFeedback("");
    setReviewRating(5);
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!reviewApplication || existingReview) {
      return;
    }

    setReviewSubmitting(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/reviews/application/${reviewApplication.id}`,
        {
          rating: Number(reviewRating),
          feedback: reviewFeedback.trim(),
        },
        { withCredentials: true },
      );

      if (typeof response.data === "string") {
        alert(response.data);
        if (response.data.toLowerCase().includes("login")) {
          navigate("/login");
        }
        return;
      }

      setExistingReview(response.data);
      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert(error.response?.data || "Failed to submit review. Please try again.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-wrapper" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h2 style={{ color: "#16a34a", fontFamily: "Inter, sans-serif" }}>Loading Applications...</h2>
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
            <button className="btn-modal-cancel job-back-btn" onClick={() => navigate("/client")}>
              Back to Dashboard
            </button>
            <h1>{projectTitle}</h1>
            <p>Review freelancer applications and update each applicant's status.</p>
          </div>
          <div className="dashboard-header-actions">
            <button className="btn-modal-cancel" onClick={() => navigate("/top-freelancers")}>
              Top performing freelancers
            </button>
            <button className="btn-create-proj" onClick={fetchApplications}>
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

        <h2 className="db-section-title">Freelancer Applications</h2>

        {applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-fallback">
              <span className="empty-icon-inner"></span>
            </div>
            <h3>No Applications Yet</h3>
            <p>No freelancers have applied to this project yet. Check back after freelancers discover your posting.</p>
            <button className="btn-create-proj" onClick={() => navigate("/client")}>
              Back to Projects
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {applications.map((application) => (
              <div key={application.id} className="project-card">
                <div>
                  <div className="project-header">
                    <h3 className="project-title">{application.freelancerName}</h3>
                    <span className={`status-badge ${(application.status || "pending").toLowerCase()}`}>
                      {application.status}
                    </span>
                  </div>
                  <p className="project-desc">
                    @{application.freelancerUsername} applied for {application.projectTitle}.
                  </p>
                  {application.projectStatus === "COMPLETED" && (
                    <p className="project-desc" style={{ marginBottom: 0 }}>
                      Project status: {application.projectStatus}
                    </p>
                  )}
                </div>

                <div>
                  <div className="project-meta">
                    <div className="meta-item">
                      <span className="meta-label">Applied At</span>
                      <span className="meta-value">
                        {application.appliedAt ? new Date(application.appliedAt).toLocaleString() : "N/A"}
                      </span>
                    </div>
                    <div className="meta-item" style={{ alignItems: "flex-end" }}>
                      <span className="meta-label">Resume</span>
                      <a
                        className="meta-value budget-value"
                        href={`${API_BASE_URL}/applications/${application.id}/resume`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    </div>
                  </div>

                  <div className="project-actions application-status-actions">
                    <select
                      className="status-select"
                      value={application.status}
                      onChange={(event) => handleStatusChange(application.id, event.target.value)}
                      disabled={updatingId === application.id}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                    {application.status === "ACCEPTED" && (
                      <button
                        className="btn-action-edit"
                        onClick={() =>
                          navigate(
                            `/client/projects/${projectId}/applications/${application.id}/milestones`,
                          )
                        }
                      >
                        Manage Milestones
                      </button>
                    )}
                    {canReviewApplication(application) && (
                      <button
                        className="btn-action-edit"
                        onClick={() => openReviewModal(application)}
                      >
                        Give Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {reviewApplication && (
        <div className="modal-overlay" onClick={closeReviewModal}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Review {reviewApplication.freelancerName}</h2>
              <button className="btn-modal-close" onClick={closeReviewModal}>
                &times;
              </button>
            </div>

            {reviewLoading ? (
              <p className="profile-loading">Loading review...</p>
            ) : existingReview ? (
              <div className="review-view">
                <p className="project-desc">
                  Your review for {reviewApplication.projectTitle}
                </p>
                {renderStars(existingReview.rating)}
                <div className="profile-detail-item">
                  <span className="meta-label">Rating</span>
                  <span className="meta-value">{existingReview.rating} / 5</span>
                </div>
                <div className="profile-text-block">
                  <span className="meta-label">Feedback</span>
                  <p>{existingReview.feedback || "No feedback provided."}</p>
                </div>
                <div className="modal-footer-actions">
                  <button type="button" className="btn-modal-save" onClick={closeReviewModal}>
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="modal-form">
                <p className="project-desc">
                  Share your experience working with {reviewApplication.freelancerName} on{" "}
                  {reviewApplication.projectTitle}.
                </p>

                <div className="modal-form-group">
                  <label htmlFor="review-rating">Rating</label>
                  <select
                    id="review-rating"
                    className="status-select"
                    value={reviewRating}
                    onChange={(event) => setReviewRating(event.target.value)}
                    required
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Good</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>

                <div className="modal-form-group">
                  <label htmlFor="review-feedback">Feedback</label>
                  <textarea
                    id="review-feedback"
                    value={reviewFeedback}
                    onChange={(event) => setReviewFeedback(event.target.value)}
                    placeholder="Describe the quality of work, communication, and delivery."
                  ></textarea>
                </div>

                <div className="modal-footer-actions">
                  <button type="button" className="btn-modal-cancel" onClick={closeReviewModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-modal-save" disabled={reviewSubmitting}>
                    {reviewSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientProjectApplications;
