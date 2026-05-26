
import { useState } from "react";
import axios from "axios";
import{useNavigate,Link} from "react-router-dom";

import "../style/Login.css";

function Login() {

    const navigate=useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {

    e.preventDefault();

    const userData = {
      email,
      password
    };

    try {

      const response = await axios.post(
        "http://localhost:9090/auth/login",
        userData,
        {
            withCredentials:true
        }
      );

      console.log(response.data);

      alert("Login is successful");

      navigate("/")

    } catch (error) {

      console.log(error);

      alert("Login Failed");
    }
  };

  return (

    <div className="login-page">

      <div className="login-container">

        <h1>Login</h1>

        <p>
          Welcome back to the marketplace
        </p>

        <form
          className="login-form"
          onSubmit={handleLogin}
        >

          <div className="input-group">

            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your valid email"
              onChange={(e) => setEmail(e.target.value)}
            />

          </div>

          <div className="input-group">

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your valid password"
              onChange={(e) => setPassword(e.target.value)}
            />

          </div>

          <Link to="/register">
            New User? Register Here
          </Link>

          <button
            type="submit"
            className="login-btn"
          >
            Login
          </button>

        </form>

      </div>

    </div>
  );
}

export default Login;
