import { Link, useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const userName = localStorage.getItem("userName") || "User";

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");

    navigate("/");
  };

  return (
    <div className="dashboard">

      <nav className="dashboard-nav">

        <Link to="/" className="logo">
          Resume<span>Gen</span>
        </Link>

        <div className="dashboard-nav-right">
          <span className="user-name">
            {userName}
          </span>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

      </nav>

      <main className="dashboard-content">

        <div className="dashboard-heading">
          <div>
            <p className="dashboard-greeting">
              Welcome back,
            </p>

            <h1>{userName} 👋</h1>

            <p>
              Create a resume tailored to your dream job.
            </p>
          </div>

          <Link
            to="/create-resume"
            className="primary-btn"
          >
            + Create Resume
          </Link>
        </div>

        <section className="dashboard-cards">

          <div className="dashboard-card">
            <div className="card-icon">📄</div>

            <h2>Create a new resume</h2>

            <p>
              Upload your existing resume or enter your
              information manually.
            </p>

            <Link to="/create-resume">
              Get started →
            </Link>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📊</div>

            <h2>Skill Matcher</h2>

            <p>
              Compare your skills against the job you're
              applying for.
            </p>

            <span className="coming-soon">
              Available after resume analysis
            </span>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📁</div>

            <h2>My Resumes</h2>

            <p>
              Your generated resumes will appear here.
            </p>

            <span className="coming-soon">
              No resumes yet
            </span>
          </div>

        </section>

      </main>
    </div>
  );
}

export default Dashboard;