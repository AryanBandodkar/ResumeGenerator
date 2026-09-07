import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="logo">
          Resume<span>Gen</span>
        </div>

        <div className="nav-links">
          <Link to="/login" className="login-link">
            Log in
          </Link>

          <Link to="/signup" className="signup-btn">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <div className="badge">
            AI-Powered Resume Builder
          </div>

          <h1>
            Build a resume that
            <span> gets noticed.</span>
          </h1>

          <p>
            Create a professional, job-tailored resume using AI.
            Upload your existing resume or simply tell us about yourself.
          </p>

          <div className="hero-buttons">
            <Link to="/signup" className="primary-btn">
              Create My Resume →
            </Link>

            <Link to="/login" className="secondary-btn">
              I already have an account
            </Link>
          </div>
        </div>

        <div className="hero-card">
          <div className="resume-preview">
            <div className="preview-header">
              <div className="avatar"></div>

              <div>
                <div className="preview-name">
                  Your Name
                </div>
                <div className="preview-role">
                  Frontend Developer
                </div>
              </div>
            </div>

            <div className="preview-line"></div>

            <div className="preview-section">
              <div className="preview-title">SUMMARY</div>
              <div className="fake-line"></div>
              <div className="fake-line short"></div>
            </div>

            <div className="preview-section">
              <div className="preview-title">SKILLS</div>

              <div className="skill-row">
                <span>React</span>
                <span>JavaScript</span>
                <span>CSS</span>
              </div>
            </div>

            <div className="preview-section">
              <div className="preview-title">EXPERIENCE</div>
              <div className="fake-line"></div>
              <div className="fake-line"></div>
              <div className="fake-line short"></div>
            </div>
          </div>
        </div>
      </main>

      <section className="features">
        <div>
          <div className="feature-icon">✦</div>
          <h3>AI Powered</h3>
          <p>Generate professional content tailored to your target role.</p>
        </div>

        <div>
          <div className="feature-icon">◈</div>
          <h3>Job Matching</h3>
          <p>See how well your skills match the job description.</p>
        </div>

        <div>
          <div className="feature-icon">✓</div>
          <h3>Professional Templates</h3>
          <p>Create clean, ATS-friendly resumes.</p>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;