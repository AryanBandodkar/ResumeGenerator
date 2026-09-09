import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./TemplateSelection.css";

function TemplateSelection() {
  const navigate = useNavigate();
  const location = useLocation();

  // Resume data coming from ResumeReview
  const resumeData = location.state?.resumeData;

  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [format, setFormat] = useState("pdf");

  // Available templates
  const templates = [
    {
      id: "modern",
      name: "Modern",
      description: "Clean and professional resume layout",
    },
    {
      id: "classic",
      name: "Classic",
      description: "Traditional and ATS-friendly layout",
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "Simple and elegant resume layout",
    },
    {
      id: "professional",
      name: "Professional",
      description: "Professional and polished resume layout",
    },
  ];

  // Generate Resume
  const handleGenerate = () => {
    const finalData = {
      resumeData: resumeData,
      template: selectedTemplate,
      format: format,
    };

    console.log("Final Resume Data:", finalData);

    // Navigate to Resume Output page
    navigate("/resume-output", {
      state: finalData,
    });
  };

  return (
    <div className="template-page">
      {/* NAVBAR */}
      <nav className="dashboard-nav">
        <div className="logo">
          Resume<span>Gen</span>
        </div>

        <button
          type="button"
          className="back-link"
          onClick={() =>
            navigate("/review-resume", {
              state: {
                resumeData: resumeData,
              },
            })
          }
        >
          ← Back
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <main className="template-container">
        {/* HEADER */}
        <div className="page-heading">
          <span className="step-label">STEP 3 OF 3</span>

          <h1>Choose your resume template</h1>

          <p>
            Select a template and choose the format for your generated resume.
          </p>
        </div>

        {/* TEMPLATE SELECTION */}
        <section className="template-section">
          <h2>Resume Templates</h2>

          <div className="template-grid">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`template-card ${
                  selectedTemplate === template.id ? "selected" : ""
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                {/* TEMPLATE PREVIEW */}
                <div className="template-preview">
                  <div className="preview-name">YOUR NAME</div>

                  <div className="preview-contact">
                    email@example.com | +91 98765 43210
                  </div>

                  <div className="preview-line"></div>
                  <div className="preview-line short"></div>

                  <div className="preview-section">
                    PROFESSIONAL SUMMARY
                  </div>

                  <div className="preview-line"></div>
                  <div className="preview-line"></div>
                  <div className="preview-line short"></div>

                  <div className="preview-section">EXPERIENCE</div>

                  <div className="preview-line"></div>
                  <div className="preview-line"></div>
                  <div className="preview-line short"></div>

                  <div className="preview-section">EDUCATION</div>

                  <div className="preview-line"></div>
                  <div className="preview-line short"></div>

                  <div className="preview-section">SKILLS</div>

                  <div className="preview-line"></div>
                </div>

                {/* TEMPLATE INFO */}
                <div className="template-info">
                  <h3>{template.name}</h3>
                  <p>{template.description}</p>
                </div>

                {/* SELECTED BADGE */}
                {selectedTemplate === template.id && (
                  <div className="selected-badge">✓ Selected</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* FORMAT SELECTION */}
        <section className="format-section">
          <h2>Choose Format</h2>

          <div className="format-options">
            {/* PDF */}
            <button
              type="button"
              className={`format-card ${
                format === "pdf" ? "selected" : ""
              }`}
              onClick={() => setFormat("pdf")}
            >
              <div className="format-icon">PDF</div>

              <div className="format-text">
                <strong>PDF</strong>
                <span>Best for job applications</span>
              </div>

              {format === "pdf" && (
                <span className="format-check">✓</span>
              )}
            </button>

            {/* DOCX */}
            <button
              type="button"
              className={`format-card ${
                format === "docx" ? "selected" : ""
              }`}
              onClick={() => setFormat("docx")}
            >
              <div className="format-icon">DOCX</div>

              <div className="format-text">
                <strong>DOCX</strong>
                <span>Easy to edit in Microsoft Word</span>
              </div>

              {format === "docx" && (
                <span className="format-check">✓</span>
              )}
            </button>
          </div>
        </section>

        {/* ACTION BUTTONS */}
        <div className="template-actions">
          {/* BACK TO REVIEW */}
          <button
            type="button"
            className="secondary-btn"
            onClick={() =>
              navigate("/review-resume", {
                state: {
                  resumeData: resumeData,
                },
              })
            }
          >
            ← Review Resume
          </button>

          {/* GENERATE */}
          <button
            type="button"
            className="generate-btn"
            onClick={handleGenerate}
          >
            Generate Resume →
          </button>
        </div>
      </main>
    </div>
  );
}

export default TemplateSelection;