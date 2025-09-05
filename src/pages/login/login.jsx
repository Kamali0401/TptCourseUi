import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { publicAxios } from "../../api/config"; 

import "./Login.css"; 

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const response = await publicAxios.post("/auth/login", {
      username,
      password,
    });

    if (response.status === 200) {
      console.log("Login success:", response.data);


      localStorage.setItem("user", response.data.username);

    
      navigate("/main"); 
    }
  } catch (err) {
    console.error("Login failed:", err);

    if (err.response) {

      if (err.response.status === 401) {
        setError("Invalid username or password");
      } else {
        setError(`Server error: ${err.response.status} - ${err.response.data}`);
      }
    } else if (err.request) {

      setError("Network error or API not reachable. Check API URL and CORS.");
    } else {

      setError("Something went wrong. Please try again.");
    }
  }


  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
         // placeholder="Password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
