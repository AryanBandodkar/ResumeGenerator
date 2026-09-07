import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ResumeInput() {
  const navigate = useNavigate();

  const [inputMethod, setInputMethod] = useState("upload");
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState("");

  const roles = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Analyst",
    "UI/UX Designer",
    "Digital Marketing Executive",
    "Project Manager",
    "Business Analyst",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!role) {
      alert("Please select a target role.");
      return;
    }

    if (!jobDescription.trim()) {
      alert("Please enter the job description.");
      return;
    }

    if (inputMethod === "upload" && !resumeFile) {
      alert("Please upload your resume.");
      return;
    }

    if (inputMethod === "text" && !resumeText.trim()) {
      alert("Please enter your resume information.");
      return;
    }

    // Temporary data.
    // Later this will be sent to your partner's backend.

    const resumeRequest = {
      role,
      jobDescription,
      inputMethod,
      fileName: resumeFile?.name || null,
      resumeText,
    };

    localStorage.setItem(
      "resumeRequest",
      JSON.stringify(resumeRequest)
    );

    navigate("/review-resume");
  };

  return (
    <div className="resume-input-page">

      <nav className="dashboard-nav">
        <a href="/dashboard" className="logo">
          Resume<span>Gen</span>
        </a>

        <a href="/dashboard" className="back-link">
          ← Dashboard
        </a>
      </nav>

      <main className="resume-input-container">

        <div className="page-heading">
          <span className="step-label">
            STEP 1 OF 2
          </span>

          <h1>Tell us about yourself</h1>

          <p>
            Provide your information and the job you're
            applying for. We'll take care of the rest.
          </p>
        </div>

        <form onSubmit={handleSubmit}>

          <section className="input-section">

            <h2>Target Job</h2>

            <label>
              What role are you applying for?
            </label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">
                Select a role
              </option>

              {roles.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <label>
              Job Description
            </label>

            <textarea
              className="job-description"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) =>
                setJobDescription(e.target.value)
              }
            />

          </section>

          <section className="input-section">

            <h2>Your Resume Information</h2>

            <div className="method-tabs">

              <button
                type="button"
                className={
                  inputMethod === "upload"
                    ? "method-tab active"
                    : "method-tab"
                }
                onClick={() => setInputMethod("upload")}
              >
                📄 Upload Resume
              </button>

              <button
                type="button"
                className={
                  inputMethod === "text"
                    ? "method-tab active"
                    : "method-tab"
                }
                onClick={() => setInputMethod("text")}
              >
                ✍ Enter Information
              </button>

            </div>

            {inputMethod === "upload" && (
              <div className="upload-box">

                <div className="upload-icon">
                  ↑
                </div>

                <h3>
                  Upload your resume
                </h3>

                <p>
                  PDF or DOCX only
                </p>

                <label className="upload-button">
                  Choose File

                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) =>
                      setResumeFile(e.target.files[0])
                    }
                  />
                </label>

                {resumeFile && (
                  <div className="selected-file">
                    ✓ {resumeFile.name}
                  </div>
                )}

              </div>
            )}

            {inputMethod === "text" && (
              <textarea
                className="resume-textarea"
                placeholder={`Paste all your information here...

For example:

Name:
Email:
Phone:
Education:
Skills:
Experience:
Projects:
Certifications:`}
                value={resumeText}
                onChange={(e) =>
                  setResumeText(e.target.value)
                }
              />
            )}

          </section>

          <button
            type="submit"
            className="generate-btn"
          >
            Analyze My Resume →
          </button>

        </form>

      </main>
    </div>
  );
}

export default ResumeInput;