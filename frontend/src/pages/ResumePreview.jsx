import "./ResumePreview.css";

// Accent colors defined in each LaTeX template's \definecolor (if any).
// modern defines RGB(0,80,160); classic/minimal/professional use plain black.
const ACCENT = {
    modern: "#0050A0",
    classic: "#000000",
    minimal: "#000000",
    professional: "#000000",
};

// Section titles exactly as written in each template's \section{...}.
const TITLES = {
    summary: {
        modern: "Professional Summary",
        classic: "Summary",
        minimal: "Summary",
        professional: "Professional Summary",
    },
    skills: {
        modern: "Technical Skills",
        classic: "Skills",
        minimal: "Skills",
        professional: "Core Competencies",
    },
    education: {
        modern: "Education",
        classic: "Education",
        minimal: "Education",
        professional: "Education",
    },
    experience: {
        modern: "Work Experience",
        classic: "Experience",
        minimal: "Experience",
        professional: "Professional Experience",
    },
    projects: {
        modern: "Projects",
        classic: "Projects",
        minimal: "Projects",
        professional: "Key Projects",
    },
    certifications: {
        modern: "Certifications",
        classic: "Certifications",
        minimal: "Certifications",
        professional: "Certifications & Licenses",
    },
};

function flatten(arr) {
    return Array.isArray(arr) ? arr.filter(Boolean) : [];
}

// LaTeX "start -- end" renders as an en dash.
function enDash(a, b) {
    return [a, b].filter(Boolean).join(" – ");
}

function SectionHeading({ title, template }) {
    return <h2 className={`rp-section-title rp-st-${template}`}>{title}</h2>;
}

// A single LaTeX line. "left \hfill right" maps to justify-content: space-between;
// multiple \hfill (name \hfill A \hfill B) distributes gaps equally, which flex
// space-between also does.
function EntryLine({ className = "", children }) {
    return <div className={`rp-line ${className}`}>{children}</div>;
}

function Right({ children }) {
    return <span className="rp-right">{children}</span>;
}

function Bullets({ items }) {
    if (!items.length) return null;
    return (
        <ul className="rp-bullets">
            {items.map((d, j) => (
                <li key={j}>{d}</li>
            ))}
        </ul>
    );
}

function Tech({ prefix, items }) {
    if (!items.length) return null;
    return (
        <div className="rp-tech">
            <em>{prefix}</em> {items.join(", ")}
        </div>
    );
}

function ResumePreview({ resumeData, template }) {
    if (!resumeData) return null;

    const t = template;
    const accent = ACCENT[t] || ACCENT.modern;
    const p = resumeData.personal || {};
    const skills = flatten(resumeData.skills);
    const education = flatten(resumeData.education);
    const experience = flatten(resumeData.experience);
    const projects = flatten(resumeData.projects);
    const certs = flatten(resumeData.certifications);

    const contacts = [p.email, p.phone, p.location].filter(Boolean);

    // ── Header links (presented differently per template) ──
    const headerLinks = (() => {
        if (t === "minimal") {
            // Raw URLs separated by a thin space (\,).
            return [p.linkedin, p.github, p.portfolio].filter(Boolean).join("  ");
        }
        if (t === "professional") {
            // Raw URLs separated by " • " ($\cdot$).
            return [p.linkedin, p.github, p.portfolio].filter(Boolean).join("  •  ");
        }
        // modern/classic: labeled anchors separated by " | ".
        const labels = [];
        if (p.linkedin) labels.push("LinkedIn");
        if (p.github) labels.push("GitHub");
        if (p.portfolio) labels.push("Portfolio");
        return labels.join(" | ");
    })();

    const contactSep = t === "professional" ? "  •  " : " | ";

    // ── Skills ──
    function renderSkills() {
        if (!skills.length) return null;
        const title = TITLES.skills[t];

        if (t === "minimal") {
            // {{skills_joined}} — comma separated plain text.
            return (
                <section className="rp-section">
                    <SectionHeading title={title} template={t} />
                    <p className="rp-skills-inline">{skills.join(", ")}</p>
                </section>
            );
        }

        if (t === "professional") {
            // \begin{multicols}{2} itemize.
            const half = Math.ceil(skills.length / 2);
            return (
                <section className="rp-section">
                    <SectionHeading title={title} template={t} />
                    <div className="rp-skills-columns">
                        <Bullets items={skills.slice(0, half)} />
                        <Bullets items={skills.slice(half)} />
                    </div>
                </section>
            );
        }

        // modern/classic: single \begin{itemize}.
        return (
            <section className="rp-section">
                <SectionHeading title={title} template={t} />
                <div>
                    <Bullets items={skills} />
                </div>
            </section>
        );
    }

    // ── Education ──
    function renderEducation() {
        if (!education.length) return null;
        return (
            <section className="rp-section">
                <SectionHeading title={TITLES.education[t]} template={t} />
                {t === "modern" ? (
                    // Each entry is its own \begin{itemize}\item -- {{degree}} in {{field}} -- {{institution}}
                    <ul className="rp-bullets rp-edu-modern">
                        {education.map((edu, i) => (
                            <li key={i}>
                                <div>
                                    <strong>{[edu.degree, edu.field].filter(Boolean).join(" in ")}</strong>{" "}
                                    – {edu.institution}
                                </div>
                                <div>
                                    {enDash(edu.startDate, edu.endDate)}
                                    <span className="rp-quad" />
                                    {edu.location}
                                    {edu.cgpa && (
                                        <>
                                            <span className="rp-quad" />
                                            CGPA: {edu.cgpa}
                                        </>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : t === "classic" ? (
                    // \textbf{ {{institution}} } \hfill {{startDate}} -- {{endDate}}
                    // {{degree}} in {{field}} \hfill {{location}}
                    // {{#cgpa}}CGPA: {{cgpa}}{{/cgpa}}
                    education.map((edu, i) => (
                        <div key={i} className="rp-entry">
                            <EntryLine>
                                <strong>{edu.institution}</strong>
                                <Right>{enDash(edu.startDate, edu.endDate)}</Right>
                            </EntryLine>
                            <EntryLine>
                                <span>{[edu.degree, edu.field].filter(Boolean).join(" in ")}</span>
                                <Right>{edu.location}</Right>
                            </EntryLine>
                            {edu.cgpa && <div className="rp-cgpa">CGPA: {edu.cgpa}</div>}
                        </div>
                    ))
                ) : t === "minimal" ? (
                    // \textsc{ {{institution}} } \hfill {{startDate}} -- {{endDate}}
                    // {{degree}} in {{field}} \hfill {{location}} \hfill CGPA: {{cgpa}}
                    education.map((edu, i) => (
                        <div key={i} className="rp-entry">
                            <EntryLine>
                                <span className="rp-sc">{edu.institution}</span>
                                <Right>{enDash(edu.startDate, edu.endDate)}</Right>
                            </EntryLine>
                            <EntryLine>
                                <span>{[edu.degree, edu.field].filter(Boolean).join(" in ")}</span>
                                <Right>{edu.location}</Right>
                                {edu.cgpa && <Right>CGPA: {edu.cgpa}</Right>}
                            </EntryLine>
                        </div>
                    ))
                ) : (
                    // professional:
                    // \hfill {{startDate}} -- {{endDate}}
                    // \textbf{ {{degree}} in {{field}} } --- {{institution}} \hfill {{location}}
                    education.map((edu, i) => (
                        <div key={i} className="rp-entry">
                            <EntryLine className="rp-line-right">
                                <Right>{enDash(edu.startDate, edu.endDate)}</Right>
                            </EntryLine>
                            <EntryLine>
                                <span>
                                    <strong>{[edu.degree, edu.field].filter(Boolean).join(" in ")}</strong>{" "}
                                    — {edu.institution}
                                </span>
                                <Right>{edu.location}</Right>
                            </EntryLine>
                            {edu.cgpa && <div className="rp-cgpa">CGPA: {edu.cgpa}</div>}
                        </div>
                    ))
                )}
            </section>
        );
    }

    // ── Experience ──
    function renderExperience() {
        if (!experience.length) return null;
        return (
            <section className="rp-section">
                <SectionHeading title={TITLES.experience[t]} template={t} />
                {experience.map((exp, i) => {
                    const techPrefix = t === "minimal" ? "Tech:" : "Technologies:";
                    const tech = flatten(exp.technologies);
                    const bullets = flatten(exp.description);
                    const dates = enDash(exp.startDate, exp.endDate);
                    return (
                        <div key={i} className="rp-entry">
                            {t === "professional" ? (
                                // \hfill dates  /  \textbf{ {{role}} } --- {{company}} \hfill {{location}}
                                <>
                                    <EntryLine className="rp-line-right">
                                        <Right>{dates}</Right>
                                    </EntryLine>
                                    <EntryLine>
                                        <span>
                                            <strong>{exp.role}</strong> — {exp.company}
                                        </span>
                                        <Right>{exp.location}</Right>
                                    </EntryLine>
                                </>
                            ) : t === "minimal" ? (
                                // \textbf{ {{role}} } --- {{company}} \hfill dates
                                <>
                                    <EntryLine>
                                        <span>
                                            <strong>{exp.role}</strong> — <strong>{exp.company}</strong>
                                        </span>
                                        <Right>{dates}</Right>
                                    </EntryLine>
                                    {exp.location && <div>{exp.location}</div>}
                                </>
                            ) : t === "modern" ? (
                                // \textbf{ {{role}} } | \textbf{ {{company}} } \hfill dates
                                <>
                                    <EntryLine>
                                        <span>
                                            <strong>{exp.role}</strong> | <strong>{exp.company}</strong>
                                        </span>
                                        <Right>{dates}</Right>
                                    </EntryLine>
                                    {exp.location && <div>{exp.location}</div>}
                                </>
                            ) : (
                                // classic: \textbf{ {{role}} } at \textbf{ {{company}} } \hfill dates
                                <>
                                    <EntryLine>
                                        <span>
                                            <strong>{exp.role}</strong> at <strong>{exp.company}</strong>
                                        </span>
                                        <Right>{dates}</Right>
                                    </EntryLine>
                                    {exp.location && <div>{exp.location}</div>}
                                </>
                            )}
                            <Bullets items={bullets} />
                            <Tech prefix={techPrefix} items={tech} />
                        </div>
                    );
                })}
            </section>
        );
    }

    // ── Projects ──
    function renderProjects() {
        if (!projects.length) return null;
        return (
            <section className="rp-section">
                <SectionHeading title={TITLES.projects[t]} template={t} />
                {projects.map((proj, i) => {
                    const techPrefix = t === "minimal" ? "Tech:" : "Technologies:";
                    const tech = flatten(proj.technologies);
                    const bullets = flatten(proj.description);
                    return (
                        <div key={i} className="rp-entry">
                            {t === "professional" ? (
                                // \hfill GitHub \, | \, Live   (right-aligned) /  \textbf{ {{name}} }
                                <>
                                    <EntryLine className="rp-line-right">
                                        <Right>
                                            {[proj.github && "GitHub", proj.link && "Live"]
                                                .filter(Boolean)
                                                .join("  |  ")}
                                        </Right>
                                    </EntryLine>
                                    <div>
                                        <strong>{proj.name}</strong>
                                    </div>
                                </>
                            ) : t === "minimal" ? (
                                // \textbf{ {{name}} } --- GitHub --- Demo
                                <div>
                                    <strong>{proj.name}</strong>
                                    {proj.github && <> — GitHub</>}
                                    {proj.link && <> — Demo</>}
                                </div>
                            ) : t === "modern" ? (
                                // \textbf{ {{name}} } \quad | \quad GitHub \quad | \quad Live Demo
                                <div>
                                    <strong>{proj.name}</strong>
                                    {proj.github && (
                                        <>
                                            <span className="rp-quad" />
                                            |<span className="rp-quad" />
                                            GitHub
                                        </>
                                    )}
                                    {proj.link && (
                                        <>
                                            <span className="rp-quad" />
                                            |<span className="rp-quad" />
                                            Live Demo
                                        </>
                                    )}
                                </div>
                            ) : (
                                // classic: \textbf{ {{name}} } \hfill GitHub \hfill Live Demo
                                <EntryLine>
                                    <span>
                                        <strong>{proj.name}</strong>
                                    </span>
                                    {proj.github && <span>GitHub</span>}
                                    {proj.link && <span>Live Demo</span>}
                                </EntryLine>
                            )}
                            <Bullets items={bullets} />
                            <Tech prefix={techPrefix} items={tech} />
                        </div>
                    );
                })}
            </section>
        );
    }

    // ── Certifications ──
    function renderCertifications() {
        if (!certs.length) return null;
        const title = TITLES.certifications[t];
        return (
            <section className="rp-section">
                <SectionHeading title={title} template={t} />
                {t === "modern" ? (
                    // \begin{itemize} \item \textbf{ {{name}} } -- {{issuer}} ({{date}}) \hfill Link
                    <ul className="rp-bullets rp-cert-modern">
                        {certs.map((c, i) => (
                            <li key={i}>
                                <span>
                                    <strong>{c.name}</strong> – {c.issuer}
                                    {c.date && <> ({c.date})</>}
                                </span>
                                {c.link && <Right>Link</Right>}
                            </li>
                        ))}
                    </ul>
                ) : t === "minimal" ? (
                    // \textbf{ {{name}} } \hfill {{date}}  /  {{issuer}} --- Link
                    certs.map((c, i) => (
                        <div key={i} className="rp-entry">
                            <EntryLine>
                                <strong>{c.name}</strong>
                                <Right>{c.date}</Right>
                            </EntryLine>
                            <div>
                                {c.issuer}
                                {c.link && <> — Link</>}
                            </div>
                        </div>
                    ))
                ) : t === "classic" ? (
                    // \textbf{ {{name}} } -- {{issuer}} \hfill {{date}} \hfill Link
                    certs.map((c, i) => (
                        <div key={i} className="rp-entry">
                            <EntryLine>
                                <span>
                                    <strong>{c.name}</strong> – {c.issuer}
                                </span>
                                {c.date && <span>{c.date}</span>}
                                {c.link && <span>Link</span>}
                            </EntryLine>
                        </div>
                    ))
                ) : (
                    // professional: \textbf{ {{name}} } --- {{issuer}} \hfill {{date}} \hfill Verify
                    certs.map((c, i) => (
                        <div key={i} className="rp-entry">
                            <EntryLine>
                                <span>
                                    <strong>{c.name}</strong> — {c.issuer}
                                </span>
                                {c.date && <span>{c.date}</span>}
                                {c.link && <span>Verify</span>}
                            </EntryLine>
                        </div>
                    ))
                )}
            </section>
        );
    }

    return (
        <div className={`resume-preview rp-${t}`}>
            {/* Header */}
            <div className={`rp-header ${t === "minimal" ? "rp-header-left" : "rp-header-center"}`}>
                {p.name && (
                    <h1 className="rp-name" style={t === "modern" ? { color: accent } : undefined}>
                        {p.name}
                    </h1>
                )}
                {contacts.length > 0 && <div className="rp-contact">{contacts.join(contactSep)}</div>}
                {headerLinks && <div className="rp-links">{headerLinks}</div>}
            </div>

            {/* Summary */}
            {resumeData.summary && (
                <section className="rp-section">
                    <SectionHeading title={TITLES.summary[t]} template={t} />
                    <p className="rp-text">{resumeData.summary}</p>
                </section>
            )}

            {/* Skills */}
            {renderSkills()}

            {/* Education */}
            {renderEducation()}

            {/* Experience */}
            {renderExperience()}

            {/* Projects */}
            {renderProjects()}

            {/* Certifications */}
            {renderCertifications()}
        </div>
    );
}

export default ResumePreview;