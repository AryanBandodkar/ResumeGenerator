import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ResumeReview() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    personal: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+91 98765 43210",
      location: "Goa, India",
      linkedin: "linkedin.com/in/johndoe",
      github: "github.com/johndoe",
      portfolio: "johndoe.dev",
    },

    summary:
      "Frontend Developer passionate about building modern, responsive, and user-friendly web applications. Experienced in React, JavaScript, HTML, CSS, and REST APIs. Interested in creating accessible, scalable, and high-performance user interfaces.",

    skills: [
      "React",
      "JavaScript",
      "TypeScript",
      "HTML",
      "CSS",
      "Tailwind CSS",
      "Node.js",
      "Git",
      "GitHub",
      "REST APIs",
      "MongoDB",
      "Figma",
    ],

    education: [
      {
        institution: "Padre Conceicao College of Engineering",
        degree: "Bachelor of Engineering",
        field: "Information Technology",
        location: "Goa, India",
        startDate: "2023",
        endDate: "2027",
        cgpa: "8.2",
      },
      {
        institution: "PM Shri Kendriya Vidyalaya",
        degree: "Higher Secondary Education",
        field: "Science",
        location: "Goa, India",
        startDate: "2021",
        endDate: "2023",
        cgpa: "",
      },
    ],

    experience: [
      {
        company: "TechNova Solutions",
        role: "Frontend Developer Intern",
        location: "Remote",
        startDate: "May 2026",
        endDate: "July 2026",
        description: [
          "Developed responsive web interfaces using React and JavaScript.",
          "Built reusable UI components to improve development efficiency.",
          "Integrated REST APIs to display dynamic application data.",
          "Improved website responsiveness across desktop and mobile devices.",
          "Worked with Git and GitHub for version control.",
        ],
        technologies: [
          "React",
          "JavaScript",
          "HTML",
          "CSS",
          "REST API",
          "Git",
        ],
      },
    ],

    projects: [
      {
        name: "ResumeGen",
        description: [
          "Developed an AI-powered resume generator that helps users create professional and ATS-friendly resumes.",
          "Implemented resume data collection, job-role selection, and job-description matching.",
          "Designed an interactive resume review interface allowing users to edit extracted information.",
        ],
        technologies: [
          "React",
          "JavaScript",
          "Node.js",
          "MongoDB",
          "LaTeX",
        ],
        github: "https://github.com/johndoe/resumegen",
        link: "https://resumegen-demo.vercel.app",
      },

      {
        name: "CampusConnect",
        description: [
          "Built a student platform for sharing campus events, announcements, and resources.",
          "Created responsive dashboards and reusable React components.",
          "Implemented authentication and API-based data management.",
        ],
        technologies: [
          "React",
          "Node.js",
          "Express",
          "MongoDB",
        ],
        github: "https://github.com/johndoe/campusconnect",
        link: "https://campusconnect-demo.vercel.app",
      },

      {
        name: "Expense Tracker",
        description: [
          "Created a web application for tracking personal income and expenses.",
          "Added category-based expense tracking and monthly summaries.",
          "Designed a responsive interface for desktop and mobile users.",
        ],
        technologies: [
          "React",
          "JavaScript",
          "CSS",
          "Chart.js",
        ],
        github: "https://github.com/johndoe/expense-tracker",
        link: "https://expense-tracker-demo.vercel.app",
      },
    ],

    certifications: [
      {
        name: "Meta Front-End Developer",
        issuer: "Coursera",
        date: "June 2026",
        link: "https://coursera.org",
      },
      {
        name: "JavaScript Algorithms and Data Structures",
        issuer: "freeCodeCamp",
        date: "March 2026",
        link: "https://freecodecamp.org",
      },
      {
        name: "React Development",
        issuer: "Udemy",
        date: "January 2026",
        link: "https://udemy.com",
      },
    ],

    analysis: {
      overallMatch: 78,

      matchedSkills: [
        "React",
        "JavaScript",
        "HTML",
        "CSS",
      ],

      missingSkills: [
        "TypeScript",
        "Accessibility",
      ],

      recommendedSkills: [
        "TypeScript",
        "WCAG",
        "Next.js",
      ],
    },
  });

  /* ---------------- PERSONAL ---------------- */

  const updatePersonal = (field, value) => {
    setData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value,
      },
    }));
  };

  /* ---------------- SUMMARY ---------------- */

  const updateSummary = (value) => {
    setData((prev) => ({
      ...prev,
      summary: value,
    }));
  };

  /* ---------------- EDUCATION ---------------- */

  const updateEducation = (index, field, value) => {
    setData((prev) => {
      const education = [...prev.education];

      education[index] = {
        ...education[index],
        [field]: value,
      };

      return {
        ...prev,
        education,
      };
    });
  };

  /* ---------------- EXPERIENCE ---------------- */

  const updateExperience = (index, field, value) => {
    setData((prev) => {
      const experience = [...prev.experience];

      experience[index] = {
        ...experience[index],
        [field]: value,
      };

      return {
        ...prev,
        experience,
      };
    });
  };

  /* ---------------- PROJECTS ---------------- */

  const updateProject = (index, field, value) => {
    setData((prev) => {
      const projects = [...prev.projects];

      projects[index] = {
        ...projects[index],
        [field]: value,
      };

      return {
        ...prev,
        projects,
      };
    });
  };

  /* ---------------- CERTIFICATIONS ---------------- */

  const updateCertification = (index, field, value) => {
    setData((prev) => {
      const certifications = [...prev.certifications];

      certifications[index] = {
        ...certifications[index],
        [field]: value,
      };

      return {
        ...prev,
        certifications,
      };
    });
  };

  /* ---------------- GENERATE ---------------- */

  const handleGenerate = () => {
    console.log("Final Resume Data:", data);

    alert(
      "Frontend is ready! Your partner can now connect the Generate Resume API."
    );
  };

  return (
    <div className="review-page">

      {/* NAVBAR */}

      <nav className="dashboard-nav">
        <div className="logo">
          Resume<span>Gen</span>
        </div>

        <button
          className="back-link"
          onClick={() => navigate("/create-resume")}
        >
          ← Back
        </button>
      </nav>

      <main className="review-container">

        {/* PAGE HEADER */}

        <div className="page-heading">
          <span className="step-label">
            STEP 2 OF 2
          </span>

          <h1>Review your information</h1>

          <p>
            We've extracted your information. Make any
            changes before generating your resume.
          </p>
        </div>

        <div className="review-layout">

          <div className="review-main">

            {/* ================= PERSONAL ================= */}

            <section className="review-card">

              <h2>Personal Information</h2>

              <div className="form-grid">

                <div>
                  <label>Name</label>
                  <input
                    value={data.personal.name}
                    onChange={(e) =>
                      updatePersonal("name", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label>Email</label>
                  <input
                    value={data.personal.email}
                    onChange={(e) =>
                      updatePersonal("email", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label>Phone</label>
                  <input
                    value={data.personal.phone}
                    onChange={(e) =>
                      updatePersonal("phone", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label>Location</label>
                  <input
                    value={data.personal.location}
                    onChange={(e) =>
                      updatePersonal("location", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label>LinkedIn</label>
                  <input
                    value={data.personal.linkedin}
                    onChange={(e) =>
                      updatePersonal("linkedin", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label>GitHub</label>
                  <input
                    value={data.personal.github}
                    onChange={(e) =>
                      updatePersonal("github", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label>Portfolio</label>
                  <input
                    value={data.personal.portfolio}
                    onChange={(e) =>
                      updatePersonal("portfolio", e.target.value)
                    }
                  />
                </div>

              </div>

            </section>


            {/* ================= SUMMARY ================= */}

            <section className="review-card">

              <h2>Professional Summary</h2>

              <textarea
                value={data.summary}
                onChange={(e) =>
                  updateSummary(e.target.value)
                }
              />

              <button className="small-ai-btn">
                ✦ Improve with AI
              </button>

            </section>


            {/* ================= SKILLS ================= */}

            <section className="review-card">

              <h2>Skills</h2>

              <div className="skill-editor">

                {data.skills.map((skill) => (
                  <span
                    className="skill-tag"
                    key={skill}
                  >
                    {skill}
                  </span>
                ))}

              </div>

            </section>


            {/* ================= EDUCATION ================= */}

            <section className="review-card">

              <h2>Education</h2>

              {data.education.map((education, index) => (

                <div
                  className="dynamic-item"
                  key={index}
                >

                  <h3>
                    Education {index + 1}
                  </h3>

                  <div className="form-grid">

                    <div>
                      <label>Institution</label>

                      <input
                        value={education.institution}
                        onChange={(e) =>
                          updateEducation(
                            index,
                            "institution",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <label>Degree</label>

                      <input
                        value={education.degree}
                        onChange={(e) =>
                          updateEducation(
                            index,
                            "degree",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <label>Field of Study</label>

                      <input
                        value={education.field}
                        onChange={(e) =>
                          updateEducation(
                            index,
                            "field",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <label>Location</label>

                      <input
                        value={education.location}
                        onChange={(e) =>
                          updateEducation(
                            index,
                            "location",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <label>Start Date</label>

                      <input
                        value={education.startDate}
                        onChange={(e) =>
                          updateEducation(
                            index,
                            "startDate",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <label>End Date</label>

                      <input
                        value={education.endDate}
                        onChange={(e) =>
                          updateEducation(
                            index,
                            "endDate",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <label>CGPA</label>

                      <input
                        value={education.cgpa}
                        onChange={(e) =>
                          updateEducation(
                            index,
                            "cgpa",
                            e.target.value
                          )
                        }
                      />
                    </div>

                  </div>

                </div>

              ))}

            </section>


            {/* ================= EXPERIENCE ================= */}

            <section className="review-card">

              <h2>Experience / Internship</h2>

              {data.experience.map((experience, index) => (

                <div
                  className="dynamic-item"
                  key={index}
                >

                  <h3>
                    {experience.role}
                  </h3>

                  <div className="form-grid">

                    <div>
                      <label>Company</label>

                      <input
                        value={experience.company}
                        onChange={(e) =>
                          updateExperience(
                            index,
                            "company",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <label>Role</label>

                      <input
                        value={experience.role}
                        onChange={(e) =>
                          updateExperience(
                            index,
                            "role",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <label>Location</label>

                      <input
                        value={experience.location}
                        onChange={(e) =>
                          updateExperience(
                            index,
                            "location",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <label>Start Date</label>

                      <input
                        value={experience.startDate}
                        onChange={(e) =>
                          updateExperience(
                            index,
                            "startDate",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <label>End Date</label>

                      <input
                        value={experience.endDate}
                        onChange={(e) =>
                          updateExperience(
                            index,
                            "endDate",
                            e.target.value
                          )
                        }
                      />
                    </div>

                  </div>

                  <label>Description</label>

                  <textarea
                    value={experience.description.join("\n")}
                    onChange={(e) =>
                      updateExperience(
                        index,
                        "description",
                        e.target.value.split("\n")
                      )
                    }
                  />

                  <label>Technologies</label>

                  <input
                    value={experience.technologies.join(", ")}
                    onChange={(e) =>
                      updateExperience(
                        index,
                        "technologies",
                        e.target.value
                          .split(",")
                          .map((item) => item.trim())
                      )
                    }
                  />

                </div>

              ))}

            </section>


            {/* ================= PROJECTS ================= */}

            <section className="review-card">

              <h2>Projects</h2>

              {data.projects.map((project, index) => (

                <div
                  className="dynamic-item"
                  key={index}
                >

                  <h3>
                    {project.name}
                  </h3>

                  <div>

                    <label>Project Name</label>

                    <input
                      value={project.name}
                      onChange={(e) =>
                        updateProject(
                          index,
                          "name",
                          e.target.value
                        )
                      }
                    />

                  </div>

                  <label>Description</label>

                  <textarea
                    value={project.description.join("\n")}
                    onChange={(e) =>
                      updateProject(
                        index,
                        "description",
                        e.target.value.split("\n")
                      )
                    }
                  />

                  <label>Technologies</label>

                  <input
                    value={project.technologies.join(", ")}
                    onChange={(e) =>
                      updateProject(
                        index,
                        "technologies",
                        e.target.value
                          .split(",")
                          .map((item) => item.trim())
                      )
                    }
                  />

                  <div className="form-grid">

                    <div>
                      <label>GitHub</label>

                      <input
                        value={project.github}
                        onChange={(e) =>
                          updateProject(
                            index,
                            "github",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <label>Live Demo</label>

                      <input
                        value={project.link}
                        onChange={(e) =>
                          updateProject(
                            index,
                            "link",
                            e.target.value
                          )
                        }
                      />
                    </div>

                  </div>

                </div>

              ))}

            </section>


            {/* ================= CERTIFICATIONS ================= */}

            <section className="review-card">

              <h2>Certifications</h2>

              {data.certifications.map(
                (certification, index) => (

                  <div
                    className="dynamic-item"
                    key={index}
                  >

                    <h3>
                      Certification {index + 1}
                    </h3>

                    <div className="form-grid">

                      <div>
                        <label>Certification Name</label>

                        <input
                          value={certification.name}
                          onChange={(e) =>
                            updateCertification(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div>
                        <label>Issuer</label>

                        <input
                          value={certification.issuer}
                          onChange={(e) =>
                            updateCertification(
                              index,
                              "issuer",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div>
                        <label>Date</label>

                        <input
                          value={certification.date}
                          onChange={(e) =>
                            updateCertification(
                              index,
                              "date",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div>
                        <label>Certificate Link</label>

                        <input
                          value={certification.link}
                          onChange={(e) =>
                            updateCertification(
                              index,
                              "link",
                              e.target.value
                            )
                          }
                        />
                      </div>

                    </div>

                  </div>

                )
              )}

            </section>

          </div>


          {/* ================================================= */}
          {/*                    SKILL MATCHER                   */}
          {/* ================================================= */}

          <aside className="skill-matcher">

            <div className="match-circle">

              <strong>
                {data.analysis.overallMatch}%
              </strong>

              <span>
                Match
              </span>

            </div>

            <h2>Job Match</h2>

            <p>
              Your skills compared to the selected
              job description.
            </p>


            {/* MATCHED */}

            <div className="match-group">

              <h3>
                ✓ Matched Skills
              </h3>

              {data.analysis.matchedSkills.map(
                (skill) => (

                  <div
                    className="match-skill matched"
                    key={skill}
                  >
                    ✓ {skill}
                  </div>

                )
              )}

            </div>


            {/* MISSING */}

            <div className="match-group">

              <h3>
                Missing Skills
              </h3>

              {data.analysis.missingSkills.map(
                (skill) => (

                  <div
                    className="match-skill missing"
                    key={skill}
                  >
                    + {skill}
                  </div>

                )
              )}

            </div>


            {/* RECOMMENDED */}

            <div className="match-group">

              <h3>
                Recommended
              </h3>

              {data.analysis.recommendedSkills.map(
                (skill) => (

                  <div
                    className="match-skill recommended"
                    key={skill}
                  >
                    ✦ {skill}
                  </div>

                )
              )}

            </div>

          </aside>

        </div>


        {/* ================= ACTIONS ================= */}

        <div className="review-actions">

          <button
            className="secondary-btn"
            onClick={() =>
              navigate("/create-resume")
            }
          >
            ← Edit Input
          </button>

          <button
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

export default ResumeReview;