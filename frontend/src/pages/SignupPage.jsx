import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function SignupPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || "Signup failed.");
        return;
      }

      // If email confirmation is enabled, no session is returned yet.
      if (!data.data?.token) {
        alert("Account created! Check your email to confirm your account, then log in.");
        navigate("/login");
        return;
      }

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userName", data.data.user.name || name);
      localStorage.setItem("authToken", data.data.token);

      navigate("/dashboard");
    } catch {
      setError("Unable to connect to the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        <Link to="/" className="auth-logo">
          Resume<span>Gen</span>
        </Link>

        <div className="auth-card">

          <h1>Create your account</h1>

          <p className="auth-subtitle">
            Start building your professional resume.
          </p>

          <form onSubmit={handleSignup}>

            <label>Full Name</label>

            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label>Email</label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label>Password</label>

            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <label>Confirm Password</label>

            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {error && (
              <p className="auth-error">{error}</p>
            )}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">
              Log in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default SignupPage;