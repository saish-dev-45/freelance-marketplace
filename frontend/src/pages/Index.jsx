import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../style/Index.css";

import people from "../assets/people.png";
import target from "../assets/target.png";
import saveMoney from "../assets/save-money.png";
import briefcase from "../assets/briefcase.png";
import building from "../assets/building.png";

function Index() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get("http://localhost:9092/auth/me", {
        withCredentials: true,
      });
      setUser(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="index-wrapper">
      {/* ── NAVBAR ── */}
      <nav className="navbar">
        <div className="navbar-logo">
          <span className="navbar-logo-dot"></span>
          Freelance Marketplace
        </div>
        <div className="navbar-links">
          <a href="#how-it-works">How It Works</a>
          <a href="#about">About</a>
          <a href="#roles">Join</a>
        </div>

        <div className="navbar-right">
          {user ? (
            <div className="navbar-user-section">
              <span className="navbar-welcome">{user.username}</span>

              <button
                className="btn-logout"
                onClick={async () => {
                  try {
                    await axios.post(
                      "http://localhost:9092/auth/logout",
                      {},
                      {
                        withCredentials: true,
                      },
                    );

                    setUser(null);

                    navigate("/login");
                  } catch (error) {
                    console.log(error);
                  }
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              className="btn-nav-login"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero-section">
        {/* LEFT SIDE */}
        <div className="hero-content">
          <div className="hero-badge">
            Trusted by 10,000+ students across India
          </div>

          <h1 className="hero-heading">
            Showcase your skills with <em>confidence</em>
          </h1>

          <p className="hero-subtext">
            Find projects, connect with clients, manage payments, and grow your
            portfolio — all in one modern freelance platform built for
            developers, designers, and creators.
          </p>

          <div className="hero-actions">
            <button
              className="btn-primary"
              onClick={() => navigate("/freelancer")}
            >
              Start Browsing Projects
            </button>

            <button className="btn-outline" onClick={() => navigate("/client")}>
              Hire Talent
            </button>
          </div>
        </div>

        {/* RIGHT SIDE DASHBOARD */}
        <div className="hero-dashboard">
          <div className="dashboard-top">
            <h3 className="dashboard-title">Workspace Overview</h3>

            <span className="dashboard-status">Live</span>
          </div>

          <div className="dashboard-cards">
            <div className="dashboard-card">
              <h4>Total Earnings</h4>
              <span>₹48,200</span>
            </div>

            <div className="dashboard-card">
              <h4>Active Projects</h4>
              <span>12</span>
            </div>
          </div>

          <div className="dashboard-projects">
            <div className="project-item">
              <div className="project-left">
                <h5>AI Chatbot Dashboard</h5>
                <p>React • Spring Boot</p>
              </div>

              <span className="project-status">In Progress</span>
            </div>

            <div className="project-item">
              <div className="project-left">
                <h5>E-Commerce Backend API</h5>
                <p>Java • PostgreSQL</p>
              </div>

              <span className="project-status">Completed</span>
            </div>

            <div className="project-item">
              <div className="project-left">
                <h5>Portfolio Website Design</h5>
                <p>UI/UX • Figma</p>
              </div>

              <span className="project-status">Review</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-num">50K+</span>
          <span className="stat-label">Active students</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">12K+</span>
          <span className="stat-label">Projects Posted</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">98%</span>
          <span className="stat-label">Satisfaction Rate</span>
        </div>
        <div className="stat-item">
          <span className="stat-num">₹40Cr+</span>
          <span className="stat-label">Paid to students</span>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="section steps-section" id="how-it-works">
        <p className="section-label">Simple Process</p>

        <h2 className="section-title">Get started in 3 easy steps</h2>

        <div className="steps-grid">
          {/* STEP 1 */}
          <div className="step-card">
            <span className="step-num">Step 01</span>

            <img src={target} alt="Create Profile" className="step-image" />

            <h3>Create Your Profile</h3>

            <p>
              Sign up and set up your profile as a student or client in just
              a few minutes.
            </p>
          </div>

          {/* STEP 2 */}
          <div className="step-card">
            <span className="step-num">Step 02</span>

            <img src={people} alt="Browse Projects" className="step-image" />

            <h3>Browse & Match</h3>

            <p>
              Clients post projects. Students browse and submit proposals.
              Smart matching handles the rest.
            </p>
          </div>

          {/* STEP 3 */}
          <div className="step-card">
            <span className="step-num">Step 03</span>

            <img src={saveMoney} alt="Get Paid" className="step-image" />

            <h3>Collaborate & Get Paid</h3>

            <p>
              Work together securely. Payments are protected via escrow with UPI
              & bank transfer support.
            </p>
          </div>
        </div>
      </section>

      {/* ── ROLE CARDS ── */}
      <section className="section roles-section" id="roles">
        <p className="section-label">Choose Your Path</p>
        <h2 className="section-title">Join as a Student or Client</h2>
        <div className="role-grid">
          {/* Freelancer Card */}
          <div className="role-card role-card--featured">
            <img src={briefcase} alt="Freelancer" className="role-image" />

            <span className="role-badge role-badge--featured">
              Most Popular
            </span>

            <h2>Student</h2>

            <p>
              Discover exciting projects, build your portfolio, and work with
              clients across India and worldwide.
            </p>

            <ul className="role-perks">
              <li>
                <span className="perk-dot"></span>
                Browse 1000+ active projects
              </li>

              <li>
                <span className="perk-dot"></span>
                Set your own rates & schedule
              </li>

              <li>
                <span className="perk-dot"></span>
                Get paid on time, every time
              </li>

              <li>
                <span className="perk-dot"></span>
                Build a verified portfolio
              </li>
            </ul>

            <button
              className="role-cta role-cta--primary"
              onClick={() => navigate("/freelancer")}
            >
              Join as Student →
            </button>
          </div>

          {/* Client Card */}
          <div className="role-card">
            <img src={building} alt="Client" className="role-image" />

            <span className="role-badge">For Businesses</span>

            <h2>Client</h2>

            <p>
              Post projects, hire top-rated Students, and scale your business
              faster without the overhead.
            </p>

            <ul className="role-perks">
              <li>
                <span className="perk-dot"></span>
                Access verified talent pool
              </li>

              <li>
                <span className="perk-dot"></span>
                Post projects for free
              </li>

              <li>
                <span className="perk-dot"></span>
                Secure milestone payments
              </li>

              <li>
                <span className="perk-dot"></span>
                24/7 project dashboard
              </li>
            </ul>

            <button
              className="role-cta role-cta--outline"
              onClick={() => navigate("/client")}
            >
              Hire Students →
            </button>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="section about-section" id="about">
        <div className="about-inner">
          <div className="about-left">
            <p className="section-label" style={{ textAlign: "left" }}>
              About Us
            </p>
            <h2 className="about-heading">
              Built for India's Growing Freelance Economy
            </h2>
            <p>
              We're on a mission to bridge the gap between talented independent
              professionals and businesses that need them. Our platform is
              designed with Indian workflows in mind — from GST invoicing to UPI
              payments.
            </p>
            <p>
              Whether you're a student freelancer, an experienced developer, or
              a growing startup — Freelance Marketplace is your launchpad.
            </p>
          </div>
          <div className="about-right">
            <div className="about-feature">
              {/* <div className="feat-icon"></div> */}
              <div>
                <h4>Secure Payments</h4>
                <p>
                  Escrow-protected milestones with UPI, NEFT &amp; bank transfer
                  support.
                </p>
              </div>
            </div>
            <div className="about-feature">
              {/* <div className="feat-icon">⭐</div> */}
              <div>
                <h4>Verified Talent</h4>
                <p>
                  Every freelancer goes through a skill verification process
                  before listing.
                </p>
              </div>
            </div>
            <div className="about-feature">
              {/* <div className="feat-icon">📊</div> */}
              <div>
                <h4>Smart Dashboard</h4>
                <p>
                  Track projects, invoices, and earnings from one powerful
                  dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="footer-logo-dot"></span>
              Freelance Marketplace
            </div>
            <p>
              Connecting India's best freelancers with businesses that need
              them. Fast, secure, and built local.
            </p>
          </div>
          <div className="footer-links">
            <h5>Platform</h5>
            <ul>
              <li>
                <a href="#">Browse Projects</a>
              </li>
              <li>
                <a href="#">Find Freelancers</a>
              </li>
              <li>
                <a href="#how-it-works">How It Works</a>
              </li>
            </ul>
          </div>
          <div className="footer-links">
            <h5>Company</h5>
            <ul>
              <li>
                <a href="#about">About Us</a>
              </li>
              <li>
                <a href="#">Blog</a>
              </li>
              <li>
                <a href="#">Careers</a>
              </li>
            </ul>
          </div>
          <div className="footer-links">
            <h5>Support</h5>
            <ul>
              <li>
                <a href="#">Help Center</a>
              </li>
              <li>
                <a href="#">Contact Us</a>
              </li>
              <li>
                <a href="#">Privacy Policy</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 Freelance Marketplace. All rights reserved.</span>
          <span>Made with 💚 in India</span>
        </div>
      </footer>
    </div>
  );
}

export default Index;
