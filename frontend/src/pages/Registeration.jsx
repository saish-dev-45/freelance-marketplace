import { useState } from "react";
import axios from "axios";
import "../style/Registeration.css";
import { useNavigate, Link } from "react-router-dom";

const Registeration = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [country, setCountry] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    const userData = {
      name,
      username,
      password,
      email,
      role,
      country,
    };

    try {
      const response = await axios.post(
        "http://localhost:9090/auth/register",
        userData,
        {
          withCredentials: true,
        },
      );

      console.log("Registration successful:", response.data);

      alert("Registration Successful");

      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);

      alert("Registration Failed");
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1>Create Account</h1>

        <p>Join our freelance marketplace platform</p>

        <form className="register-form" onSubmit={handleRegister}>
          <div className="input-group">
            <label>Full Name</label>

            <input
              type="text"
              placeholder="Enter your full name"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Username</label>

            <input
              type="text"
              placeholder="Choose a username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Create password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Select Role</label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="role-dropdown"
            >
              <option value="">Choose Role</option>

              <option value="FREELANCER">Freelancer</option>

              <option value="CLIENT">Client</option>
            </select>
          </div>

          <div className="input-group">
            <label>Country</label>

            <input
              type="text"
              placeholder="Enter country"
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          <button type="submit" className="register-btn">
            Register
          </button>
        </form>

        <div className="bottom-text">
          Already have an account?
          <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Registeration;
