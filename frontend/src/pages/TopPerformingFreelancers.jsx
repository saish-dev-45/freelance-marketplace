import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../components/NotificationBell";
import "../style/ClientDashboard.css";

const API_BASE_URL = "http://localhost:9092";

function renderStars(rating) {
  const roundedRating = Math.round(Number(rating || 0));

  return (
    <div className="leaderboard-stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= roundedRating ? "star-filled" : "star-empty"}>
          ★
        </span>
      ))}
    </div>
  );
}

function TopPerformingFreelancers() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
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

      if (
        authResponse.data.role !== "CLIENT" &&
        authResponse.data.role !== "FREELANCER"
      ) {
        alert("Access Denied");
        navigate("/");
        return;
      }

      setUser(authResponse.data);

      const response = await axios.get(`${API_BASE_URL}/reviews/leaderboard`, {
        withCredentials: true,
      });

      if (Array.isArray(response.data)) {
        setLeaderboard(response.data);
      } else {
        alert(response.data || "Failed to load leaderboard");
      }
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
      alert("Failed to load leaderboard. Please try again.");
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

  const handleBack = () => {
    if (user?.role === "CLIENT") {
      navigate("/client");
      return;
    }

    navigate("/freelancer");
  };

  if (loading) {
    return (
      <div className="dashboard-wrapper" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h2 style={{ color: "#16a34a", fontFamily: "Inter, sans-serif" }}>Loading Leaderboard...</h2>
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
          {user?.role === "FREELANCER" && <NotificationBell />}
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
            <button className="btn-modal-cancel job-back-btn" onClick={handleBack}>
              Back to Dashboard
            </button>
            <h1>Top performing freelancers</h1>
            <p>
              Rankings are based on the average client review rating, from highest to lowest.
            </p>
          </div>
          <button className="btn-create-proj" onClick={fetchLeaderboard}>
            Refresh Leaderboard
          </button>
        </section>

        <section className="db-stats-grid">
          <div className="stat-card primary">
            <div className="stat-title">Ranked Freelancers</div>
            <div className="stat-value">{leaderboard.length}</div>
          </div>
          <div className="stat-card success">
            <div className="stat-title">Top Rating</div>
            <div className="stat-value">
              {leaderboard[0]?.averageRating?.toFixed(1) || "0.0"}
            </div>
          </div>
          <div className="stat-card warning">
            <div className="stat-title">Total Reviews Counted</div>
            <div className="stat-value">
              {leaderboard.reduce((total, entry) => total + Number(entry.totalReviews || 0), 0)}
            </div>
          </div>
          <div className="stat-card info">
            <div className="stat-title">Your Role</div>
            <div className="stat-value" style={{ fontSize: "1.1rem" }}>
              {user?.role || "Guest"}
            </div>
          </div>
        </section>

        <h2 className="db-section-title">Freelancer Rankings</h2>

        {leaderboard.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-fallback">
              <span className="empty-icon-inner"></span>
            </div>
            <h3>No Reviews Yet</h3>
            <p>
              The leaderboard will appear once clients submit reviews for completed projects.
            </p>
          </div>
        ) : (
          <div className="leaderboard-panel">
            {leaderboard.map((entry) => (
              <div key={entry.freelancerId} className="leaderboard-row">
                <div className="leaderboard-rank">
                  <span className="leaderboard-rank-number">#{entry.rank}</span>
                </div>

                <div className="leaderboard-details">
                  <h3>{entry.freelancerName}</h3>
                  <p>@{entry.freelancerUsername}</p>
                </div>

                <div className="leaderboard-score">
                  <span className="leaderboard-average">
                    {Number(entry.averageRating || 0).toFixed(1)} / 5
                  </span>
                  {renderStars(entry.averageRating)}
                  <span className="leaderboard-review-count">
                    {entry.totalReviews} review{entry.totalReviews === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default TopPerformingFreelancers;
