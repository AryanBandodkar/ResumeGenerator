import { useLocation, useNavigate } from "react-router-dom";
import "./ResumeOutput.css";

function ResumeOutput() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    resumeData,
    template,
    format,
    fileUrl,
  } = location.state || {};

  const handleDownload = () => {
    if (!fileUrl) {
      alert("Resume file is not available yet.");
      return;
    }

    const link = document.createElement("a");

    link.href = fileUrl;
    link.download = `resume-${template}.${format}`;

    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleChangeTemplate = () => {
    navigate("/template-selection", {
      state: {
        resumeData,
        template,
        format,
      },
    });
  };

  const handleBack = () => {
    navigate("/template-selection", {
      state: {
        resumeData,
        template,
        format,
      },
    });
  };

  return (
    <div className="resume-output-page">
      {/* NAVBAR */}
      <nav className="dashboard-nav">
        <div className="logo">
          Resume<span>Gen</span>
        </div>

        <button
          type="button"
          className="back-link"
          onClick={handleBack}
        >
          ← Back
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <main className="resume-output-container">
        {/* HEADER */}
        <div className="output-header">
          <span className="step-label">
            RESUME GENERATED
          </span>

          <h1>Your Resume is Ready!</h1>

          <p>
            Your resume has been generated using your
            selected template and format.
          </p>
        </div>

        {/* RESUME INFORMATION */}
        <div className="output-card">
          <div className="output-icon">
            {format === "pdf" ? "PDF" : "DOCX"}
          </div>

          <div className="output-details">
            <h2>Resume</h2>

            <p>
              Template:{" "}
              <strong>
                {template || "Not selected"}
              </strong>
            </p>

            <p>
              Format:{" "}
              <strong>
                {format
                  ? format.toUpperCase()
                  : "Not selected"}
              </strong>
            </p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="output-actions">
          <button
            type="button"
            className="download-btn"
            onClick={handleDownload}
          >
            ↓ Download Resume
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={handleChangeTemplate}
          >
            ← Change Template
          </button>
        </div>
      </main>
    </div>
  );
}

export default ResumeOutput;