import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ResumePreview from "./ResumePreview";
import "./ResumeOutput.css";

function ResumeOutput() {
  const navigate = useNavigate();
  const location = useLocation();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const {
    resumeData,
    template,
    format,
    fileUrl,
  } = location.state || {};

  const isLoggedIn = Boolean(localStorage.getItem("authToken"));

  const handleDownload = () => {
    if (!fileUrl) {
      alert("Resume file is not available yet.");
      return;
    }

    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = `resume-${template || "modern"}.${format || "pdf"}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleSave = async () => {
    const token = localStorage.getItem("authToken");

    setSaving(true);

    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: resumeData?.personal?.name || "Untitled Resume",
          template,
          format,
          resume_data: resumeData,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save resume.");
      }

      setSaved(true);
      alert("Resume saved to My Resumes.");
    } catch (err) {
      alert(err.message || "Something went wrong while saving your resume.");
    } finally {
      setSaving(false);
    }
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
            Your resume has been generated using the{" "}
            <strong>{template || "Modern"}</strong> template.
          </p>
        </div>

        {/* RESUME PREVIEW */}
        <div className="output-preview-wrapper">
          <ResumePreview resumeData={resumeData} template={template} />
        </div>

        {/* ACTION BUTTONS */}
        <div className="output-actions">
          <button
            type="button"
            className="download-btn"
            onClick={handleDownload}
          >
            ↓ Download {format ? format.toUpperCase() : "PDF"}
          </button>

          {isLoggedIn ? (
            <button
              type="button"
              className="secondary-btn"
              onClick={handleSave}
              disabled={saving || saved}
            >
              {saved
                ? "✓ Saved to My Resumes"
                : saving
                ? "Saving..."
                : "☆ Save to My Resumes"}
            </button>
          ) : (
            <button
              type="button"
              className="secondary-btn"
              onClick={() => navigate("/login")}
            >
              Log in to save
            </button>
          )}

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