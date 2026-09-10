import "./ResumePreview.css";

const THEMES = {
    modern: { accent: "#0050A0" },
    classic: { accent: "#111111" },
    minimal: { accent: "#444444" },
    professional: { accent: "#1B4F5C" },
};

function flatten(arr) {
    return Array.isArray(arr) ? arr.filter(Boolean) : [];
}

function SectionHeading({ title, template, accentColor }) {
    const className = `rp-section-title rp-st-${template}`;
    return <h2 className={className} style={accentColor}>{title}</h2>;
}

function ResumePreview({ resumeData, template }) {
    if (!resumeData) return null;

    const theme = THEMES[template] || THEMES.modern;
    const p = resumeData.personal || {};
    const skills = flatten(resumeData.skills);
    const education = flatten(resumeData.education);
    const experience = flatten(resumeData.experience);
    const projects = flatten(resumeData.projects);
    const certs = flatten(resumeData.certifications);

    const isMinimal = template === "minimal";
    const isClassic = template === "classic";
    const isProfessional = template === "professional";

    const accentColor = { color: theme.accent };

    // ── Render skills differently per template ──
    function renderSkills() {
        if (!skills.length) return null;

        const title = isProfessional ? "Core Competencies" : "Technical Skills";

        if (isProfessional) {
            // Two-column grid with square bullets
            const half = Math.ceil(skills.length / 2);
            const col1 = skills.slice(0, half);
            const col2 = skills.slice(half);
            return (
                <section className="rp-section">
                    <SectionHeading title={title} template={template} accentColor={accentColor} />
                    <div className="rp-skills rp-skills-columns">
                        <div className="rp-skills-col">
                            {col1.map((s, i) => <div key={i} className="rp-skill-col-item"><span className="rp-sq-bullet" style={accentColor}>■</span> {s}</div>)}
                        </div>
                        <div className="rp-skills-col">
                            {col2.map((s, i) => <div key={i} className="rp-skill-col-item"><span className="rp-sq-bullet" style={accentColor}>■</span> {s}</div>)}
                        </div>
                    </div>
                </section>
            );
        }

        if (isMinimal) {
            // Comma-separated plain text
            return (
                <section className="rp-section">
                    <SectionHeading title={title} template={template} accentColor={accentColor} />
                    <p className="rp-skills-inline">{skills.join(", ")}</p>
                </section>
            );
        }

        if (isClassic) {
            // Bulleted list
            return (
                <section className="rp-section">
                    <SectionHeading title={title} template={template} accentColor={accentColor} />
                    <ul className="rp-skills-list">
                        {skills.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </section>
            );
        }

        // Modern: dot-separated tags
        return (
            <section className="rp-section">
                <SectionHeading title={title} template={template} accentColor={accentColor} />
                <div className="rp-skills rp-skills-tags">
                    {skills.map((s, i) => (
                        <span key={i} className="rp-skill-tag" style={{ borderColor: theme.accent + "40" }}>
                            {s}
                        </span>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <div className={`resume-preview rp-${template}`}>
            {/* Header */}
            <div className={`rp-header rp-header-${template}`}>
                {p.name && <h1 className="rp-name" style={accentColor}>{p.name}</h1>}

                <div className="rp-contact">
                    {[p.email, p.phone, p.location].filter(Boolean).join(isMinimal ? "  ·  " : "  |  ")}
                </div>

                <div className="rp-links">
                    {p.linkedin && <span style={accentColor}>LinkedIn</span>}
                    {p.linkedin && p.github && <span className="rp-sep">|</span>}
                    {p.github && <span style={accentColor}>GitHub</span>}
                    {((p.linkedin || p.github) && p.portfolio) && <span className="rp-sep">|</span>}
                    {p.portfolio && <span style={accentColor}>Portfolio</span>}
                </div>

                {!isMinimal && <div className="rp-header-rule" style={{ borderColor: "#ddd" }} />}
            </div>

            {/* Summary */}
            {resumeData.summary && (
                <section className="rp-section">
                    <SectionHeading title="Professional Summary" template={template} accentColor={accentColor} />
                    <p className="rp-text">{resumeData.summary}</p>
                </section>
            )}

            {/* Skills */}
            {renderSkills()}

            {/* Education */}
            {education.length > 0 && (
                <section className="rp-section">
                    <SectionHeading title="Education" template={template} accentColor={accentColor} />
                    {education.map((edu, i) => (
                        <div key={i} className="rp-entry">
                            {isMinimal ? (
                                <>
                                    <div className="rp-entry-row">
                                        <strong>{edu.institution}</strong>
                                        {edu.location && <span className="rp-meta">, {edu.location}</span>}
                                    </div>
                                    <div className="rp-entry-sub">
                                        {[edu.degree, edu.field].filter(Boolean).join(" in ")}
                                        {edu.startDate && <span className="rp-meta"> — {edu.startDate}–{edu.endDate}</span>}
                                        {edu.cgpa && <span className="rp-meta"> | CGPA: {edu.cgpa}</span>}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="rp-entry-row">
                                        <strong>{[edu.degree, edu.field].filter(Boolean).join(" in ")}</strong>
                                        {edu.institution && <span> — {edu.institution}</span>}
                                    </div>
                                    <div className="rp-entry-meta">
                                        {[edu.startDate, edu.endDate].filter(Boolean).join(" — ")}
                                        {edu.location && <span> | {edu.location}</span>}
                                        {edu.cgpa && <span> | CGPA: {edu.cgpa}</span>}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </section>
            )}

            {/* Experience */}
            {experience.length > 0 && (
                <section className="rp-section">
                    <SectionHeading title="Work Experience" template={template} accentColor={accentColor} />
                    {experience.map((exp, i) => (
                        <div key={i} className="rp-entry">
                            {isMinimal ? (
                                <>
                                    <div className="rp-entry-row">
                                        <strong>{exp.role}</strong>
                                    </div>
                                    <div className="rp-entry-sub">
                                        {exp.company}{exp.location ? `, ${exp.location}` : ""}
                                        {[exp.startDate, exp.endDate].filter(Boolean).length > 0 &&
                                            <span className="rp-meta"> — {exp.startDate}–{exp.endDate}</span>}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="rp-entry-row">
                                        <strong>{exp.role}</strong>
                                        {exp.company && <span> — {exp.company}</span>}
                                    </div>
                                    <div className="rp-entry-meta">
                                        {[exp.startDate, exp.endDate].filter(Boolean).join(" — ")}
                                        {exp.location && <span> | {exp.location}</span>}
                                    </div>
                                </>
                            )}
                            <ul className="rp-bullets">
                                {flatten(exp.description).map((d, j) => (
                                    <li key={j}>{d}</li>
                                ))}
                            </ul>
                            {flatten(exp.technologies).length > 0 && (
                                <div className="rp-tech">
                                    <em>Technologies:</em> {flatten(exp.technologies).join(", ")}
                                </div>
                            )}
                        </div>
                    ))}
                </section>
            )}

            {/* Projects */}
            {projects.length > 0 && (
                <section className="rp-section">
                    <SectionHeading title={isProfessional ? "Key Projects" : "Projects"} template={template} accentColor={accentColor} />
                    {projects.map((proj, i) => (
                        <div key={i} className="rp-entry">
                            <div className="rp-entry-row">
                                <strong>{proj.name}</strong>
                                {proj.github && <span className="rp-link" style={accentColor}> | GitHub</span>}
                                {proj.link && <span className="rp-link" style={accentColor}> | Live Demo</span>}
                            </div>
                            <ul className="rp-bullets">
                                {flatten(proj.description).map((d, j) => (
                                    <li key={j}>{d}</li>
                                ))}
                            </ul>
                            {flatten(proj.technologies).length > 0 && (
                                <div className="rp-tech">
                                    <em>Technologies:</em> {flatten(proj.technologies).join(", ")}
                                </div>
                            )}
                        </div>
                    ))}
                </section>
            )}

            {/* Certifications */}
            {certs.length > 0 && (
                <section className="rp-section">
                    <SectionHeading title={isProfessional ? "Certifications & Licenses" : "Certifications"} template={template} accentColor={accentColor} />
                    {certs.map((cert, i) => (
                        <div key={i} className="rp-entry">
                            <div className="rp-entry-row">
                                <strong>{cert.name}</strong>
                                {cert.issuer && <span> — {cert.issuer}</span>}
                                {cert.date && <span className="rp-entry-meta"> ({cert.date})</span>}
                            </div>
                        </div>
                    ))}
                </section>
            )}
        </div>
    );
}

export default ResumePreview;
