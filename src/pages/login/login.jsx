import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { publicAxios } from "../../api/config";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup"; // For validation schema
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const initialValues = {
    username: "",
    password: "",
  };

  const validationSchema = Yup.object({
    username: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setError("");
    try {
      const response = await publicAxios.post("/auth/login", {
        username: values.username,
        password: values.password,
      });

      if (response.status === 200) {
        debugger;
        console.log("Login success:", response.data);

        localStorage.setItem("user", response.data.username);
        localStorage.setItem("role", response.data.role); // if token is returned
        localStorage.setItem("id", response.data.id);
        navigate("/main/coursetable");
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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="login-form">
            <div className="input-group">
              <Field
                type="text"
                name="username"
                placeholder="Username"
              />
              <ErrorMessage name="username" component="p" className="error" />
            </div>

            <div className="input-group">
              <div className="password-wrapper">
                <Field
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                />
                <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <ErrorMessage name="password" component="p" className="error" />
            </div>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            {error && <p className="error">{error}</p>}
          </Form>
        )}
      </Formik>
    </div>
  );
}
