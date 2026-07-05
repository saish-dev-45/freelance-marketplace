import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../../components/NotificationBell";
import "../../style/ClientDashboard.css";

const emptyProfileForm = {
  professionalTitle: "",
  currentCollege: "",
  currentCompany: "",
  shortBio: "",
  experienceLevel: "",
  expertise: "",
  notableProjects: "",
};

function FreelancerDashboard() {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [freelancerProfile, setFreelancerProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileAndJobs();
  }, []);

  const getSkillArray = (skills) =>
    skills
      ? skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : [];

  const formatBudget = (budget) => {
    const amount = Number(budget || 0);
    return `Rs. ${amount.toLocaleString("en-IN")}`;
  };

  const getProfilePayload = (profile) => ({
    professionalTitle: profile?.professionalTitle || "",
    currentCollege: profile?.currentCollege || "",
    currentCompany: profile?.currentCompany || "",
    shortBio: profile?.shortBio || "",
    experienceLevel: profile?.experienceLevel || "",
    expertise: profile?.expertise || "",
    notableProjects: profile?.notableProjects || "",
  });

  const handleProfileInputChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const fetchProfileAndJobs = async () => {
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
        alert("Access Denied: Only freelancers can access this dashboard");
        navigate("/");
        return;
      }

      setUser(currentUser);

      const jobsResponse = await axios.get("http://localhost:9092/projects/open", {
        withCredentials: true,
      });

      if (Array.isArray(jobsResponse.data)) {
        setJobs(jobsResponse.data);
      } else if (typeof jobsResponse.data === "string") {
        alert(jobsResponse.data);
        if (jobsResponse.data.toLowerCase().includes("login")) {
          navigate("/login");
        }
      } else {
        console.error("Expected jobs array, received:", jobsResponse.data);
      }
    } catch (error) {
      console.error("Error fetching freelancer dashboard data:", error);
      alert("Failed to load dashboard data. Please login again.");
      navigate("/login");
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

  const openProfileModal = async () => {
    setProfileModalOpen(true);
    setProfileLoading(true);

    try {
      const response = await axios.get("http://localhost:9092/freelancer/profile", {
        withCredentials: true,
      });

      if (typeof response.data === "string") {
        if (response.data.toLowerCase().includes("login")) {
          alert(response.data);
          navigate("/login");
          return;
        }

        setFreelancerProfile(null);
        setProfileForm(emptyProfileForm);
        setEditingProfile(true);
        return;
      }

      setFreelancerProfile(response.data);
      setProfileForm(getProfilePayload(response.data));
      setEditingProfile(false);
    } catch (error) {
      const message = error.response?.data;

      if (typeof message === "string" && message.toLowerCase().includes("login")) {
        alert(message);
        navigate("/login");
        return;
      }

      setFreelancerProfile(null);
      setProfileForm(emptyProfileForm);
      setEditingProfile(true);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    if (
      !profileForm.professionalTitle ||
      !profileForm.shortBio ||
      !profileForm.experienceLevel ||
      !profileForm.expertise
    ) {
      alert("Please fill in professional title, short bio, experience level, and expertise.");
      return;
    }

    setProfileSaving(true);

    try {
      const response = freelancerProfile
        ? await axios.put("http://localhost:9092/freelancer/profile", profileForm, {
            withCredentials: true,
          })
        : await axios.post("http://localhost:9092/freelancer/profile", profileForm, {
            withCredentials: true,
          });

      if (typeof response.data === "string") {
        alert(response.data);
        if (response.data.toLowerCase().includes("login")) {
          navigate("/login");
        }
        return;
      }

      setFreelancerProfile(response.data);
      setProfileForm(getProfilePayload(response.data));
      setEditingProfile(false);
      alert(freelancerProfile ? "Profile updated successfully!" : "Profile created successfully!");
    } catch (error) {
      console.error("Profile save failed:", error);
      alert(error.response?.data || "Failed to save profile. Please try again.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm("Are you sure you want to delete your freelancer profile?")) {
      return;
    }

    try {
      const response = await axios.delete("http://localhost:9092/freelancer/profile", {
        withCredentials: true,
      });

      if (typeof response.data === "string" && response.data.toLowerCase().includes("login")) {
        alert(response.data);
        navigate("/login");
        return;
      }

      alert(typeof response.data === "string" ? response.data : "Profile deleted successfully!");
      setFreelancerProfile(null);
      setProfileForm(emptyProfileForm);
      setEditingProfile(true);
    } catch (error) {
      console.error("Profile deletion failed:", error);
      alert(error.response?.data || "Failed to delete profile. Please try again.");
    }
  };

  const totalOpenBudget = jobs.reduce((acc, job) => acc + Number(job.budget || 0), 0);

  const urgentJobs = jobs.filter((job) => {
    if (!job.deadline) {
      return false;
    }

    const today = new Date();
    const deadline = new Date(job.deadline);
    const dayDifference = (deadline - today) / (1000 * 60 * 60 * 24);

    return dayDifference >= 0 && dayDifference <= 7;
  }).length;

  const allSkills = useMemo(() => {
    const uniqueSkills = new Set();

    jobs.forEach((job) => {
      getSkillArray(job.skills).forEach((skill) => uniqueSkills.add(skill.toLowerCase()));
    });

    return uniqueSkills.size;
  }, [jobs]);

  if (loading) {
    return (
      <div className="dashboard-wrapper" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h2 style={{ color: "#16a34a", fontFamily: "Inter, sans-serif" }}>Loading Dashboard...</h2>
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
            <button className="db-user-info db-user-profile-trigger" onClick={openProfileModal}>
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
        <section className="db-header">
          <div className="db-header-left">
            <h1>Freelancer Dashboard</h1>
            <p>Browse open jobs, compare budgets, and find your next project.</p>
          </div>
          <div className="dashboard-header-actions">
            <button className="btn-modal-cancel" onClick={() => navigate("/top-freelancers")}>
              Top performing freelancers
            </button>
            <button className="btn-modal-cancel" onClick={() => navigate("/freelancer/applied-jobs")}>
              Applied Jobs
            </button>
            <button className="btn-create-proj" onClick={fetchProfileAndJobs}>
              Refresh Jobs
            </button>
          </div>
        </section>

        <section className="db-stats-grid">
          <div className="stat-card primary">
            <div className="stat-title">Open Jobs</div>
            <div className="stat-value">{jobs.length}</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-title">Closing This Week</div>
            <div className="stat-value">{urgentJobs}</div>
          </div>
          <div className="stat-card success">
            <div className="stat-title">Skills In Demand</div>
            <div className="stat-value">{allSkills}</div>
          </div>
          <div className="stat-card info">
            <div className="stat-title">Open Budget</div>
            <div className="stat-value">{formatBudget(totalOpenBudget)}</div>
          </div>
        </section>

        <h2 className="db-section-title">Available Jobs</h2>

        {jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-fallback">
              <span className="empty-icon-inner"></span>
            </div>
            <h3>No Open Jobs Right Now</h3>
            <p>There are no client projects open at the moment. Check back soon for fresh opportunities.</p>
            <button className="btn-create-proj" onClick={fetchProfileAndJobs}>
              Check Again
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {jobs.map((job) => {
              const skillArray = getSkillArray(job.skills);

              return (
                <div key={job.id} className="project-card">
                  <div>
                    <div className="project-header">
                      <h3 className="project-title">{job.title}</h3>
                      <span className={`status-badge ${(job.status || "open").toLowerCase()}`}>
                        {job.status || "OPEN"}
                      </span>
                    </div>

                    <p className="project-desc">{job.description}</p>

                    {skillArray.length > 0 && (
                      <div className="skills-tags">
                        {skillArray.map((skill) => (
                          <span key={`${job.id}-${skill}`} className="skill-tag">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="project-meta">
                      <div className="meta-item">
                        <span className="meta-label">Budget</span>
                        <span className="meta-value budget-value">{formatBudget(job.budget)}</span>
                      </div>
                      <div className="meta-item" style={{ alignItems: "flex-end" }}>
                        <span className="meta-label">Deadline</span>
                        <span className="meta-value">{job.deadline || "N/A"}</span>
                      </div>
                    </div>

                    <div className="project-actions freelancer-job-actions">
                      <div className="client-chip">
                        <span className="meta-label">Client</span>
                        <span className="meta-value">{job.clientName || job.clientUsername || "Client"}</span>
                      </div>
                      <button className="btn-action-edit" onClick={() => navigate(`/freelancer/jobs/${job.id}`)}>
                        View Job
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {profileModalOpen && (
        <div className="modal-overlay" onClick={() => setProfileModalOpen(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Freelancer Profile</h2>
              <button className="btn-modal-close" onClick={() => setProfileModalOpen(false)}>
                &times;
              </button>
            </div>

            {profileLoading ? (
              <div className="profile-loading">Loading profile...</div>
            ) : editingProfile ? (
              <form onSubmit={handleSaveProfile} className="modal-form">
                <div className="modal-form-group">
                  <label htmlFor="professionalTitle">Professional Title</label>
                  <input
                    id="professionalTitle"
                    name="professionalTitle"
                    type="text"
                    value={profileForm.professionalTitle}
                    onChange={handleProfileInputChange}
                    placeholder="Frontend Developer"
                    required
                  />
                </div>

                <div className="modal-form-row">
                  <div className="modal-form-group">
                    <label htmlFor="currentCollege">Current College</label>
                    <input
                      id="currentCollege"
                      name="currentCollege"
                      type="text"
                      value={profileForm.currentCollege}
                      onChange={handleProfileInputChange}
                      placeholder="College name"
                    />
                  </div>

                  <div className="modal-form-group">
                    <label htmlFor="currentCompany">Current Company</label>
                    <input
                      id="currentCompany"
                      name="currentCompany"
                      type="text"
                      value={profileForm.currentCompany}
                      onChange={handleProfileInputChange}
                      placeholder="Company name"
                    />
                  </div>
                </div>

                <div className="modal-form-group">
                  <label htmlFor="shortBio">Short Bio</label>
                  <textarea
                    id="shortBio"
                    name="shortBio"
                    value={profileForm.shortBio}
                    onChange={handleProfileInputChange}
                    placeholder="Tell clients about your work, strengths, and focus areas."
                    required
                  ></textarea>
                </div>

                <div className="modal-form-row">
                  <div className="modal-form-group">
                    <label htmlFor="experienceLevel">Experience Level</label>
                    <select
                      id="experienceLevel"
                      name="experienceLevel"
                      value={profileForm.experienceLevel}
                      onChange={handleProfileInputChange}
                      className="status-select"
                      required
                    >
                      <option value="">Select level</option>
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="EXPERT">Expert</option>
                    </select>
                  </div>

                  <div className="modal-form-group">
                    <label htmlFor="expertise">Expertise</label>
                    <input
                      id="expertise"
                      name="expertise"
                      type="text"
                      value={profileForm.expertise}
                      onChange={handleProfileInputChange}
                      placeholder="React, Spring Boot, UI Design"
                      required
                    />
                  </div>
                </div>

                <div className="modal-form-group">
                  <label htmlFor="notableProjects">Notable Projects</label>
                  <textarea
                    id="notableProjects"
                    name="notableProjects"
                    value={profileForm.notableProjects}
                    onChange={handleProfileInputChange}
                    placeholder="Mention completed work or portfolio highlights."
                  ></textarea>
                </div>

                <div className="modal-footer-actions">
                  <button
                    type="button"
                    className="btn-modal-cancel"
                    onClick={() => {
                      if (freelancerProfile) {
                        setProfileForm(getProfilePayload(freelancerProfile));
                        setEditingProfile(false);
                      } else {
                        setProfileModalOpen(false);
                      }
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-modal-save" disabled={profileSaving}>
                    {profileSaving ? "Saving..." : freelancerProfile ? "Update Profile" : "Create Profile"}
                  </button>
                </div>
              </form>
            ) : freelancerProfile ? (
              <div className="profile-view">
                <div className="profile-view-header">
                  <div>
                    <h3>{freelancerProfile.name || user?.name}</h3>
                    <p>{freelancerProfile.professionalTitle}</p>
                  </div>
                  <span className="status-badge open">{freelancerProfile.experienceLevel}</span>
                </div>

                <div className="profile-detail-grid">
                  <div className="profile-detail-item">
                    <span className="meta-label">Username</span>
                    <span className="meta-value">{freelancerProfile.username || user?.username}</span>
                  </div>
                  <div className="profile-detail-item">
                    <span className="meta-label">Expertise</span>
                    <span className="meta-value">{freelancerProfile.expertise}</span>
                  </div>
                  <div className="profile-detail-item">
                    <span className="meta-label">College</span>
                    <span className="meta-value">{freelancerProfile.currentCollege || "N/A"}</span>
                  </div>
                  <div className="profile-detail-item">
                    <span className="meta-label">Company</span>
                    <span className="meta-value">{freelancerProfile.currentCompany || "N/A"}</span>
                  </div>
                </div>

                <div className="profile-text-block">
                  <span className="meta-label">Short Bio</span>
                  <p>{freelancerProfile.shortBio}</p>
                </div>

                <div className="profile-text-block">
                  <span className="meta-label">Notable Projects</span>
                  <p>{freelancerProfile.notableProjects || "No notable projects added yet."}</p>
                </div>

                <div className="modal-footer-actions">
                  <button type="button" className="btn-action-delete profile-delete-btn" onClick={handleDeleteProfile}>
                    Delete Profile
                  </button>
                  <button type="button" className="btn-modal-save" onClick={() => setEditingProfile(true)}>
                    Update Profile
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-state profile-empty-state">
                <h3>No Profile Found</h3>
                <p>Create your freelancer profile so clients can understand your skills and experience.</p>
                <button className="btn-create-proj" onClick={() => setEditingProfile(true)}>
                  Create Profile
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FreelancerDashboard;
