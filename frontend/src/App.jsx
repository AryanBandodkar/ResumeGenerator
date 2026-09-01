import "./App.css";

function App() {
  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <div className="logo-icon">R</div>
          <span>
            Resume<span className="purple">Gen</span>
          </span>
        </div>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#templates">Templates</a>
        </div>

        <div className="nav-actions">
          <button className="login-btn">Log in</button>
          <button className="nav-btn">Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <main>
        <section className="hero">
          <div className="hero-content">
            <div className="badge">
              ✦ Build your career faster
            </div>

            <h1>
              Create a resume
              <span>that gets noticed.</span>
            </h1>

            <p>
              Build a professional, ATS-friendly resume in minutes.
              Choose a template, add your experience, and create a
              resume you're proud of.
            </p>

            <div className="hero-buttons">
              <button className="primary-btn">
                Create My Resume →
              </button>

              <button className="secondary-btn">
                Explore Templates
              </button>
            </div>

            <div className="trusted">
              <div className="avatars">
                <span>R</span>
                <span>A</span>
                <span>S</span>
                <span>+</span>
              </div>

              <p>
                Trusted by <strong>1,000+</strong> students & professionals
              </p>
            </div>
          </div>

          {/* Resume Preview */}
          <div className="resume-area">
            <div className="resume-paper">
              <div className="resume-top">
                <div className="profile-circle"></div>

                <div>
                  <div className="black-line name-line"></div>
                  <div className="gray-line role-line"></div>
                </div>
              </div>

              <div className="gray-line full"></div>
              <div className="gray-line eighty"></div>

              <div className="resume-section">
                <div className="section-heading"></div>

                <div className="experience">
                  <div className="dot"></div>

                  <div className="experience-content">
                    <div className="black-line medium"></div>
                    <div className="gray-line small"></div>
                    <div className="gray-line full"></div>
                    <div className="gray-line eighty"></div>
                  </div>
                </div>

                <div className="experience">
                  <div className="dot"></div>

                  <div className="experience-content">
                    <div className="black-line medium"></div>
                    <div className="gray-line small"></div>
                    <div className="gray-line full"></div>
                  </div>
                </div>
              </div>

              <div className="resume-section">
                <div className="section-heading"></div>

                <div className="skills">
                  <span>React</span>
                  <span>JavaScript</span>
                  <span>Node.js</span>
                  <span>MongoDB</span>
                </div>
              </div>
            </div>

            <div className="floating ats">
              <div className="check">✓</div>
              <div>
                <strong>ATS Friendly</strong>
                <small>Recruiter optimized</small>
              </div>
            </div>

            <div className="floating score">
              <div className="score-number">94</div>
              <div>
                <strong>Resume Score</strong>
                <small>Excellent!</small>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="features" id="features">
          <div className="section-intro">
            <span>WHY RESUMEGEN</span>

            <h2>
              Everything you need to land your next opportunity.
            </h2>

            <p>
              Simple tools designed to help you create a resume that
              stands out and gets past applicant tracking systems.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">✦</div>
              <h3>Easy to Build</h3>
              <p>
                Create your professional resume without complicated
                formatting or design.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">✓</div>
              <h3>ATS Friendly</h3>
              <p>
                Professional layouts optimized for applicant tracking
                systems.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">▣</div>
              <h3>Professional Templates</h3>
              <p>
                Choose clean and modern templates designed for every
                career stage.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">↓</div>
              <h3>Export as PDF</h3>
              <p>
                Download your finished resume as a high-quality PDF.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="how" id="how-it-works">
          <div className="section-intro">
            <span>HOW IT WORKS</span>

            <h2>Your resume. Three simple steps.</h2>
          </div>

          <div className="steps">
            <div className="step">
              <span>01</span>
              <h3>Choose a template</h3>
              <p>
                Pick a professional design that matches your career.
              </p>
            </div>

            <div className="step">
              <span>02</span>
              <h3>Add your details</h3>
              <p>
                Enter your education, experience, skills and achievements.
              </p>
            </div>

            <div className="step">
              <span>03</span>
              <h3>Download & apply</h3>
              <p>
                Export your resume and start applying for opportunities.
              </p>
            </div>
          </div>
        </section>

        {/* Templates */}
        <section className="templates" id="templates">
          <div className="template-content">
            <span>PROFESSIONAL TEMPLATES</span>

            <h2>
              Designed to make a great first impression.
            </h2>

            <p>
              Whether you're applying for your first internship or your
              next big role, choose a template that presents your skills
              and experience in the best possible way.
            </p>

            <button className="primary-btn">
              View Templates →
            </button>
          </div>

          <div className="template-box">
            <div className="mini-resume">
              <div className="mini-header"></div>

              <div className="mini-columns">
                <div>
                  <div className="mini-title"></div>
                  <div className="mini-line"></div>
                  <div className="mini-line"></div>
                  <div className="mini-line short"></div>

                  <div className="mini-title"></div>
                  <div className="mini-line"></div>
                  <div className="mini-line"></div>
                </div>

                <div>
                  <div className="mini-title"></div>
                  <div className="mini-line"></div>
                  <div className="mini-line"></div>
                  <div className="mini-line"></div>

                  <div className="mini-title"></div>
                  <div className="mini-line"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta">
          <span>READY TO GET STARTED?</span>

          <h2>
            Your next opportunity starts with a better resume.
          </h2>

          <p>
            Create your professional resume today. It's quick,
            simple, and free to get started.
          </p>

          <button className="primary-btn">
            Create My Resume →
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="footer-logo">
          <div className="logo-icon">R</div>

          <span>
            Resume<span className="purple">Gen</span>
          </span>
        </div>

        <p>© 2026 ResumeGen. Built for better careers.</p>

        <div className="footer-links">
          <a href="#features">Features</a>
          <a href="#templates">Templates</a>
          <a href="#how-it-works">How It Works</a>
        </div>
      </footer>
    </div>
  );
}

export default App;