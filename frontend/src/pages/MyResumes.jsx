import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MyResumes.css";

function MyResumes() {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const loadResumes = async () => {
      try {
        const res = await fetch("/api/resumes", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load resumes.");
        }

        setResumes(data.data || []);
      } catch (err) {
        setError(err.message || "Something went wrong while loading your resumes.");
      } finally {
        setLoading(false);
      }
    };

    loadResumes();
  }, [token, navigate]);

  const handleEdit = async (resume) => {
    try {
      const res = await fetch(`/api/resumes/${resume.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load resume.");
      }

      // ResumeReview reads its data from localStorage, so persist it there.
      localStorage.setItem("resumeData", JSON.stringify(data.data.resume_data));

      navigate("/review-resume");
    } catch (err) {
      alert(err.message || "Something went wrong while opening this resume.");
    }
  };

  const handleDownload = async (resume) => {
    setDownloadingId(resume.id);

    try {
      const res = await fetch(`/api/resumes/${resume.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to download resume.");
      }

      const blob = await res.blob();

      let filename = `resume-${resume.template}.${resume.format}`;
      const disposition = res.headers.get("Content-Disposition");
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || "Something went wrong while downloading the resume.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (resume) => {
    if (!window.confirm(`Delete "${resume.title}" from My Resumes?`)) {
      return;
    }

    setDeletingId(resume.id);

    try {
      const res = await fetch(`/api/resumes/${resume.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete resume.");
      }

      setResumes((prev) => prev.filter((r) => r.id !== resume.id));
    } catch (err) {
      alert(err.message || "Something went wrong while deleting the resume.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
    localStorage.removeItem("authToken");
    navigate("/");
  };

  return (
    <div className="my-resumes-page">
      {/* NAVBAR */}
      <nav className="dashboard-nav">
        <Link to="/" className="logo">
          Resume<span>Gen</span>
        </Link>

        <div className="dashboard-nav-right">
          <Link to="/dashboard" className="back-link">
            ← Dashboard
          </Link>

          <button type="button" className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="my-resumes-container">
        <div className="page-heading">
          <span className="step-label">MY RESUMES</span>

          <h1>Previously generated resumes</h1>

          <p>View, download, edit, or delete the resumes you have saved.</p>
        </div>

        {loading && <p className="my-resumes-status">Loading your resumes...</p>}

        {!loading && error && <p className="my-resumes-error">{error}</p>}

        {!loading && !error && resumes.length === 0 && (
          <div className="my-resumes-empty">
            <div className="empty-icon">📁</div>

            <h2>No saved resumes yet</h2>

            <p>
              Generate a resume and click "Save to My Resumes" on the output
              page to see it here.
            </p>

            <Link to="/create-resume" className="primary-btn">
              + Create Resume
            </Link>
          </div>
        )}

        {!loading && !error && resumes.length > 0 && (
          <div className="my-resumes-grid">
            {resumes.map((resume) => (
              <div key={resume.id} className="resume-history-card">
                <div className="resume-card-top">
                  <h3>{resume.title}</h3>

                  <span className="resume-card-date">
                    {new Date(resume.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="resume-card-meta">
                  <span className="resume-badge">{resume.template}</span>

                  <span className="resume-badge resume-badge-format">
                    {resume.format.toUpperCase()}
                  </span>
                </div>

                <div className="resume-card-actions">
                  <button
                    type="button"
                    className="resume-card-btn resume-card-btn-primary"
                    onClick={() => handleDownload(resume)}
                    disabled={downloadingId === resume.id}
                  >
                    {downloadingId === resume.id
                      ? "Preparing..."
                      : "↓ Download"}
                  </button>

                  <button
                    type="button"
                    className="resume-card-btn"
                    onClick={() => handleEdit(resume)}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="resume-card-btn resume-card-btn-danger"
                    onClick={() => handleDelete(resume)}
                    disabled={deletingId === resume.id}
                  >
                    {deletingId === resume.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyResumes;