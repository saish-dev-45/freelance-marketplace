import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../style/CreateProject.css";

function CreateProject() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [skills, setSkills] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get("http://localhost:9092/auth/me", {
        withCredentials: true,
      });

      if (!response.data) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      if (response.data.role !== "CLIENT") {
        alert("Access Denied: Only clients can create projects");
        navigate("/");
        return;
      }

      setUser(response.data);
    } catch (error) {
      console.error("Auth check failed:", error);
      alert("Please login first");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !budget || !deadline || !skills) {
      alert("Please fill in all the fields.");
      return;
    }

    if (parseFloat(budget) <= 0) {
      alert("Budget must be a positive number.");
      return;
    }

    setSubmitting(true);

    const projectData = {
      title,
      description,
      budget: parseFloat(budget),
      deadline, // backend expects LocalDate (YYYY-MM-DD), which input type="date" provides
      skills,
    };

    try {
      const response = await axios.post(
        "http://localhost:9092/projects/create",
        projectData,
        {
          withCredentials: true,
        }
      );

      // Backend returns either "Please login first", "Only clients can post projects", or ProjectResponseDto.
      // Let's check response value
      if (typeof response.data === "string") {
        alert(response.data);
        if (response.data.includes("login")) {
          navigate("/login");
        }
      } else {
        alert("Project posted successfully!");
        navigate("/client");
      }
    } catch (error) {
      console.error("Project creation failed:", error);
      alert("Failed to create project. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="cp-wrapper" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <h2 style={{ color: "#16a34a", fontFamily: "Inter, sans-serif" }}>Checking Access...</h2>
      </div>
    );
  }

  return (
    <div className="cp-wrapper">
      {/* NAVBAR */}
      <nav className="cp-navbar">
        <div className="cp-logo" onClick={() => navigate("/")}>
          <span className="cp-logo-dot"></span>
          Freelance Marketplace
        </div>
        <div className="cp-nav-right">
          <button className="btn-back-dashboard" onClick={() => navigate("/client")}>
            Back to Dashboard
          </button>
        </div>
      </nav>

      {/* CONTAINER */}
      <main className="cp-container">
        <div className="cp-card">
          <header className="cp-header">
            <h1>Post a New Project</h1>
            <p>Describe your project requirements, timeline, and budget to find top freelancers.</p>
          </header>

          <form className="cp-form" onSubmit={handleSubmit}>
            {/* TITLE */}
            <div className="form-group">
              <label htmlFor="title">Project Title</label>
              <input
                id="title"
                type="text"
                placeholder="e.g., Build a Responsive E-Commerce Site"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <span className="form-helper">Keep it clear and descriptive.</span>
            </div>

            {/* DESCRIPTION */}
            <div className="form-group">
              <label htmlFor="description">Detailed Description</label>
              <textarea
                id="description"
                placeholder="Provide a thorough explanation of project requirements, tech stack details, deliverables, and expectations..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
              <span className="form-helper">Describe the project scope in detail.</span>
            </div>

            {/* BUDGET & DEADLINE */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="budget">Estimated Budget (INR)</label>
                <input
                  id="budget"
                  type="number"
                  placeholder="e.g., 25000"
                  min="1"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="deadline">Target Deadline</label>
                <input
                  id="deadline"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* SKILLS */}
            <div className="form-group">
              <label htmlFor="skills">Required Skills (Comma separated)</label>
              <input
                id="skills"
                type="text"
                placeholder="e.g., React, Java, Spring Boot, MySQL"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                required
              />
              <span className="form-helper">List key skills required for matching with freelancers.</span>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              className="btn-submit-proj"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Posting Project..." : "Post Project"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateProject;
