import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./MyResumes.css";

// Statuses a user can move a job application through. Stored per group.
const APPLICATION_STATUSES = [
  { value: "not_applied", label: "Not Applied" },
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "accepted", label: "Offer / Accepted" },
  { value: "rejected", label: "Rejected" },
];

function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Saved resumes only carry a template and a date, so use those to tell them apart.
function formatResumeLabel(resume) {
  return `${resume.template} ${resume.format.toUpperCase()} · ${formatDate(resume.created_at)}`;
}

function MyResumes() {
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupResumes, setGroupResumes] = useState({});
  const [openGroups, setOpenGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState([]);
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

    const loadGroupResumes = async (groupId) => {
      setLoadingGroups((prev) => [...new Set([...prev, groupId])]);

      try {
        const res = await fetch(`/api/job-applications/${groupId}/resumes`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load resumes.");
        }

        setGroupResumes((prev) => ({ ...prev, [groupId]: data.data || [] }));
      } catch (err) {
        setError(err.message || "Something went wrong while loading your resumes.");
      } finally {
        setLoadingGroups((prev) => prev.filter((id) => id !== groupId));
      }
    };

    const loadGroups = async () => {
      try {
        const res = await fetch("/api/job-applications", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load job applications.");
        }

        const loaded = data.data || [];
        setGroups(loaded);

        // The resumes in a group also fill the "Resume Used" options.
        await Promise.all(loaded.map((group) => loadGroupResumes(group.id)));
      } catch (err) {
        setError(err.message || "Something went wrong while loading your job applications.");
      }
    };

    loadResumes();
    loadGroups();
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

      if (!resume.job_application_id) {
        return;
      }

      const groupId = resume.job_application_id;
      const remaining = (groupResumes[groupId] || []).filter((r) => r.id !== resume.id);

      setGroupResumes((prev) => ({ ...prev, [groupId]: remaining }));

      setGroups((prev) =>
        prev
          // A group only exists to hold resumes, so it goes once it is empty.
          .filter((group) => group.id !== groupId || remaining.length > 0)
          .map((group) =>
            group.id === groupId && group.selected_resume_id === resume.id
              ? { ...group, selected_resume_id: null }
              : group
          )
      );
    } catch (err) {
      alert(err.message || "Something went wrong while deleting the resume.");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleGroup = (groupId) => {
    setOpenGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const handleSelectedResumeChange = async (group, resumeId) => {
    const previous = group.selected_resume_id;

    setGroups((prev) =>
      prev.map((item) =>
        item.id === group.id ? { ...item, selected_resume_id: resumeId } : item
      )
    );

    try {
      const res = await fetch(`/api/job-applications/${group.id}/selected-resume`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ resume_id: resumeId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update the resume used.");
      }
    } catch (err) {
      setGroups((prev) =>
        prev.map((item) =>
          item.id === group.id ? { ...item, selected_resume_id: previous } : item
        )
      );

      alert(err.message || "Something went wrong while updating the resume used.");
    }
  };

  const handleStatusChange = async (group, applicationStatus) => {
    const previous = group.application_status;

    setGroups((prev) =>
      prev.map((item) =>
        item.id === group.id ? { ...item, application_status: applicationStatus } : item
      )
    );

    try {
      const res = await fetch(`/api/job-applications/${group.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ application_status: applicationStatus }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update the application status.");
      }
    } catch (err) {
      setGroups((prev) =>
        prev.map((item) =>
          item.id === group.id ? { ...item, application_status: previous } : item
        )
      );

      alert(err.message || "Something went wrong while updating the application status.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userName");
    localStorage.removeItem("authToken");
    navigate("/");
  };

  const renderResumeCard = (resume) => (
    <div key={resume.id} className="resume-history-card">
      <div className="resume-card-top">
        <h3>{resume.title}</h3>

        <span className="resume-card-date">{formatDate(resume.created_at)}</span>
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
          {downloadingId === resume.id ? "Preparing..." : "↓ Download"}
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
  );

  const ungroupedResumes = resumes.filter((resume) => !resume.job_application_id);

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

        {!loading && !error && resumes.length === 0 && groups.length === 0 && (
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

        {!loading && !error && (groups.length > 0 || resumes.length > 0) && (
          <>
            {/* JOB APPLICATION GROUPS */}
            {groups.map((group) => {
              const savedInGroup = groupResumes[group.id] || [];
              const isLoading = loadingGroups.includes(group.id);
              const isOpen = openGroups.includes(group.id);
              const count = savedInGroup.length || group.resume_count;

              return (
                <div key={group.id} className="application-card">
                  <div className="application-top">
                    <div>
                      <h3>{group.job_title || "Untitled Job"}</h3>

                      {group.company_name && (
                        <p className="application-company">{group.company_name}</p>
                      )}
                    </div>

                    <span className="resume-badge">
                      {count} {count === 1 ? "resume" : "resumes"}
                    </span>
                  </div>

                  <div className="application-controls">
                    <div className="application-control">
                      <label htmlFor={`resume-used-${group.id}`}>Resume Used</label>

                      <select
                        id={`resume-used-${group.id}`}
                        className="application-select"
                        value={group.selected_resume_id || ""}
                        onChange={(event) =>
                          handleSelectedResumeChange(group, event.target.value || null)
                        }
                        disabled={isLoading}
                      >
                        <option value="">Not Selected</option>

                        {savedInGroup.map((resume) => (
                          <option key={resume.id} value={resume.id}>
                            {formatResumeLabel(resume)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="application-control">
                      <label htmlFor={`application-status-${group.id}`}>Status</label>

                      <select
                        id={`application-status-${group.id}`}
                        className="application-select"
                        value={group.application_status}
                        onChange={(event) =>
                          handleStatusChange(group, event.target.value)
                        }
                      >
                        {APPLICATION_STATUSES.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="application-actions">
                    <button
                      type="button"
                      className="resume-card-btn"
                      onClick={() => toggleGroup(group.id)}
                      disabled={isLoading}
                    >
                      {isLoading
                        ? "Loading..."
                        : isOpen
                        ? "Hide Resumes"
                        : "View Resumes"}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="my-resumes-grid application-resumes">
                      {savedInGroup.map((resume) => renderResumeCard(resume))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* RESUMES SAVED BEFORE GROUPING EXISTED */}
            {ungroupedResumes.length > 0 && (
              <div className="ungrouped-section">
                <h2 className="ungrouped-heading">Ungrouped</h2>

                <div className="my-resumes-grid">
                  {ungroupedResumes.map((resume) => renderResumeCard(resume))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default MyResumes;
