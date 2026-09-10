import {
    Document, Packer, Paragraph, TextRun,
    AlignmentType, BorderStyle,
    ExternalHyperlink, UnderlineType,
    TabStopPosition, TabStopType,
} from "docx";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// ─── Helpers ────────────────────────────────────────────

function flattenArray(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.filter(Boolean);
}

function text(content, opts = {}) {
    return new TextRun({ text: content, ...opts });
}

// ─── Template Definitions ───────────────────────────────
// Each template defines visual properties for DOCX and PDF.
// All templates share the same ATS-friendly section headings.

const TEMPLATES = {
    modern: {
        color: "0050A0",
        headingBar: true,
        headingBarStyle: "single",
        nameAlign: "center",
        skillsStyle: "tags",
    },
    classic: {
        color: "111111",
        headingBar: true,
        headingBarStyle: "double",
        nameAlign: "center",
        skillsStyle: "list",
    },
    minimal: {
        color: "444444",
        headingBar: false,
        headingBarStyle: "none",
        nameAlign: "left",
        skillsStyle: "inline",
    },
    professional: {
        color: "1B4F5C",
        headingBar: true,
        headingBarStyle: "single",
        nameAlign: "center",
        skillsStyle: "columns",
    },
};

// ─── DOCX Generation ───────────────────────────────────

function buildDocxHeading(title, cfg) {
    const children = [];

    if (cfg.headingBarStyle === "double") {
        // Classic: underline under heading
        children.push(
            new Paragraph({
                children: [text(title, { bold: true, size: 24, color: cfg.color, font: "Georgia" })],
                spacing: { before: 280, after: 60 },
            }),
            new Paragraph({
                border: {
                    bottom: { style: BorderStyle.DOUBLE, size: 4, color: cfg.color },
                },
                spacing: { after: 100 },
            }),
        );
    } else if (cfg.headingBarStyle === "single") {
        // Modern / Professional: single rule
        children.push(
            new Paragraph({
                children: [text(title, { bold: true, size: 24, color: cfg.color })],
                spacing: { before: 280, after: 60 },
            }),
            new Paragraph({
                border: {
                    bottom: { style: BorderStyle.SINGLE, size: 6, color: cfg.color },
                },
                spacing: { after: 100 },
            }),
        );
    } else {
        // Minimal: no rule, just italic title
        children.push(
            new Paragraph({
                children: [text(title, { italics: true, bold: true, size: 22, color: cfg.color })],
                spacing: { before: 240, after: 100 },
            }),
        );
    }

    return children;
}

function generateDocx(resume, templateName) {
    const cfg = TEMPLATES[templateName] || TEMPLATES.modern;
    const personal = resume.personal || {};
    const sections = [];

    const isMinimal = templateName === "minimal";
    const isClassic = templateName === "classic";

    const bodyFont = isClassic ? "Georgia" : "Calibri";
    const headingFont = isClassic ? "Georgia" : "Calibri";

    // ── Name ──
    const nameAlign = cfg.nameAlign === "left" ? AlignmentType.LEFT : AlignmentType.CENTER;
    sections.push(
        new Paragraph({
            children: [text(personal.name || "", { bold: true, size: isMinimal ? 32 : 36, color: cfg.color, font: headingFont })],
            alignment: nameAlign,
            spacing: { after: isMinimal ? 40 : 80 },
        })
    );

    // ── Contact line ──
    const contactParts = [personal.email, personal.phone, personal.location].filter(Boolean);
    if (contactParts.length) {
        const separator = isMinimal ? "  ·  " : isClassic ? "  |  " : "  |  ";
        sections.push(
            new Paragraph({
                children: [text(contactParts.join(separator), { size: 20, color: "555555", font: bodyFont })],
                alignment: nameAlign,
                spacing: { after: isMinimal ? 30 : 60 },
            })
        );
    }

    // ── Links ──
    const links = [];
    if (personal.linkedin) links.push({ text: "LinkedIn", url: personal.linkedin });
    if (personal.github) links.push({ text: "GitHub", url: personal.github });
    if (personal.portfolio) links.push({ text: "Portfolio", url: personal.portfolio });

    if (links.length) {
        const sep = isMinimal ? "  ·  " : "  |  ";
        const linkRuns = links.flatMap((l, i) => {
            const runs = [
                new ExternalHyperlink({
                    children: [text(l.text, { color: cfg.color, underline: { type: UnderlineType.SINGLE }, font: bodyFont, size: 20 })],
                    link: l.url,
                }),
            ];
            if (i < links.length - 1) runs.push(text(sep, { size: 20, color: "999999" }));
            return runs;
        });
        sections.push(
            new Paragraph({
                children: linkRuns,
                alignment: nameAlign,
                spacing: { after: isMinimal ? 100 : 160 },
            })
        );
    }

    // ── Separator for non-minimal ──
    if (!isMinimal) {
        sections.push(
            new Paragraph({
                border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "DDDDDD" } },
                spacing: { after: 80 },
            })
        );
    }

    // ── Summary ──
    if (resume.summary) {
        sections.push(...buildDocxHeading("Professional Summary", cfg));
        sections.push(
            new Paragraph({
                children: [text(resume.summary, { size: 22, font: bodyFont })],
                spacing: { after: 120 },
            })
        );
    }

    // ── Skills ──
    const skills = flattenArray(resume.skills);
    if (skills.length) {
        sections.push(...buildDocxHeading("Technical Skills", cfg));

        if (cfg.skillsStyle === "tags") {
            // Modern: comma-separated with bullet separators
            sections.push(
                new Paragraph({
                    children: [text(skills.join("  ·  "), { size: 22, font: bodyFont })],
                    spacing: { after: 120 },
                })
            );
        } else if (cfg.skillsStyle === "list") {
            // Classic: bulleted list
            for (const skill of skills) {
                sections.push(
                    new Paragraph({
                        children: [text(`•  ${skill}`, { size: 22, font: bodyFont })],
                        spacing: { after: 30 },
                        indent: { left: 240 },
                    })
                );
            }
            sections.push(new Paragraph({ spacing: { after: 80 } }));
        } else if (cfg.skillsStyle === "columns") {
            // Professional: two-column feel using tabs
            const perRow = 2;
            for (let i = 0; i < skills.length; i += perRow) {
                const row = skills.slice(i, i + perRow);
                const runs = [];
                row.forEach((skill, j) => {
                    runs.push(text(`▪  ${skill}`, { size: 22, font: bodyFont }));
                    if (j < row.length - 1) {
                        runs.push(text("\t\t", { size: 22 }));
                    }
                });
                sections.push(
                    new Paragraph({
                        children: runs,
                        tabStops: [{ type: TabStopType.LEFT, position: TabStopPosition.MAX / 2 }],
                        spacing: { after: 30 },
                    })
                );
            }
            sections.push(new Paragraph({ spacing: { after: 80 } }));
        } else {
            // Minimal: inline text
            sections.push(
                new Paragraph({
                    children: [text(skills.join(", "), { size: 22, font: bodyFont })],
                    spacing: { after: 120 },
                })
            );
        }
    }

    // ── Education ──
    const education = flattenArray(resume.education);
    if (education.length) {
        sections.push(...buildDocxHeading("Education", cfg));
        for (const edu of education) {
            const degreeLine = [edu.degree, edu.field].filter(Boolean).join(" in ");
            if (isMinimal) {
                // Minimal: institution first, degree on right
                sections.push(
                    new Paragraph({
                        children: [
                            text(edu.institution || "", { bold: true, size: 22, font: headingFont }),
                            text(edu.location ? `, ${edu.location}` : "", { size: 20, color: "777777", font: bodyFont }),
                        ],
                        spacing: { after: 30 },
                    })
                );
                sections.push(
                    new Paragraph({
                        children: [
                            text(degreeLine || "", { italics: true, size: 22, font: bodyFont }),
                            text([edu.startDate, edu.endDate].filter(Boolean).length
                                ? `  —  ${edu.startDate}–${edu.endDate}` : "", { size: 20, color: "777777", font: bodyFont }),
                            text(edu.cgpa ? `  |  CGPA: ${edu.cgpa}` : "", { size: 20, color: "777777", font: bodyFont }),
                        ],
                        spacing: { after: 120 },
                    })
                );
            } else {
                sections.push(
                    new Paragraph({
                        children: [
                            text(degreeLine || "", { bold: true, size: 22, font: headingFont }),
                            text(edu.institution ? ` — ${edu.institution}` : "", { size: 22, font: bodyFont }),
                        ],
                        spacing: { after: 30 },
                    })
                );
                const dateStr = [edu.startDate, edu.endDate].filter(Boolean).join(" — ");
                const meta = [dateStr, edu.location, edu.cgpa ? `CGPA: ${edu.cgpa}` : ""].filter(Boolean).join("  |  ");
                if (meta) {
                    sections.push(
                        new Paragraph({
                            children: [text(meta, { size: 20, color: "777777", font: bodyFont })],
                            spacing: { after: 120 },
                        })
                    );
                }
            }
        }
    }

    // ── Experience ──
    const experience = flattenArray(resume.experience);
    if (experience.length) {
        sections.push(...buildDocxHeading("Work Experience", cfg));
        for (const exp of experience) {
            if (isMinimal) {
                sections.push(
                    new Paragraph({
                        children: [
                            text(exp.role || "", { bold: true, size: 22, font: headingFont }),
                        ],
                        spacing: { after: 20 },
                    })
                );
                sections.push(
                    new Paragraph({
                        children: [
                            text(exp.company || "", { size: 22, font: bodyFont }),
                            text(exp.location ? `, ${exp.location}` : "", { size: 20, color: "777777", font: bodyFont }),
                            text([exp.startDate, exp.endDate].filter(Boolean).length
                                ? `  —  ${exp.startDate}–${exp.endDate}` : "", { size: 20, color: "777777", font: bodyFont }),
                        ],
                        spacing: { after: 60 },
                    })
                );
            } else {
                sections.push(
                    new Paragraph({
                        children: [
                            text(exp.role || "", { bold: true, size: 22, font: headingFont }),
                            text(exp.company ? ` — ${exp.company}` : "", { size: 22, font: bodyFont }),
                        ],
                        spacing: { after: 30 },
                    })
                );
                const dateStr = [exp.startDate, exp.endDate].filter(Boolean).join(" — ");
                const locParts = [dateStr, exp.location].filter(Boolean);
                if (locParts.length) {
                    sections.push(
                        new Paragraph({
                            children: [text(locParts.join("  |  "), { size: 20, color: "777777", font: bodyFont })],
                            spacing: { after: 60 },
                        })
                    );
                }
            }

            const descs = flattenArray(exp.description);
            for (const d of descs) {
                sections.push(
                    new Paragraph({
                        children: [text(isMinimal ? `–  ${d}` : `•  ${d}`, { size: 22, font: bodyFont })],
                        spacing: { after: 30 },
                        indent: { left: isMinimal ? 180 : 360 },
                    })
                );
            }
            const techs = flattenArray(exp.technologies);
            if (techs.length) {
                sections.push(
                    new Paragraph({
                        children: [
                            text("Technologies: ", { italics: true, size: 20, color: "666666", font: bodyFont }),
                            text(techs.join(", "), { size: 20, color: "666666", font: bodyFont }),
                        ],
                        spacing: { after: 120 },
                    })
                );
            }
        }
    }

    // ── Projects ──
    const projects = flattenArray(resume.projects);
    if (projects.length) {
        sections.push(...buildDocxHeading("Projects", cfg));
        for (const proj of projects) {
            const projRuns = [text(proj.name || "", { bold: true, size: 22, font: headingFont })];
            if (proj.github) {
                projRuns.push(text("  |  ", { size: 20, color: "999999" }));
                projRuns.push(new ExternalHyperlink({ children: [text("GitHub", { color: cfg.color, underline: { type: UnderlineType.SINGLE }, font: bodyFont, size: 20 })], link: proj.github }));
            }
            if (proj.link) {
                projRuns.push(text("  |  ", { size: 20, color: "999999" }));
                projRuns.push(new ExternalHyperlink({ children: [text("Live Demo", { color: cfg.color, underline: { type: UnderlineType.SINGLE }, font: bodyFont, size: 20 })], link: proj.link }));
            }
            sections.push(new Paragraph({ children: projRuns, spacing: { after: 60 } }));

            const descs = flattenArray(proj.description);
            for (const d of descs) {
                sections.push(
                    new Paragraph({
                        children: [text(isMinimal ? `–  ${d}` : `•  ${d}`, { size: 22, font: bodyFont })],
                        spacing: { after: 30 },
                        indent: { left: isMinimal ? 180 : 360 },
                    })
                );
            }
            const techs = flattenArray(proj.technologies);
            if (techs.length) {
                sections.push(
                    new Paragraph({
                        children: [
                            text("Technologies: ", { italics: true, size: 20, color: "666666", font: bodyFont }),
                            text(techs.join(", "), { size: 20, color: "666666", font: bodyFont }),
                        ],
                        spacing: { after: 120 },
                    })
                );
            }
        }
    }

    // ── Certifications ──
    const certs = flattenArray(resume.certifications);
    if (certs.length) {
        sections.push(...buildDocxHeading("Certifications", cfg));
        for (const cert of certs) {
            if (isMinimal) {
                sections.push(
                    new Paragraph({
                        children: [
                            text(cert.name || "", { bold: true, size: 22, font: headingFont }),
                            text(cert.issuer ? ` — ${cert.issuer}` : "", { size: 22, font: bodyFont }),
                            text(cert.date ? `  (${cert.date})` : "", { size: 20, color: "777777", font: bodyFont }),
                        ],
                        spacing: { after: 80 },
                    })
                );
            } else {
                const parts = [cert.name, cert.issuer].filter(Boolean).join(" — ");
                const datePart = cert.date ? ` (${cert.date})` : "";
                sections.push(
                    new Paragraph({
                        children: [
                            text(`${parts}${datePart}`, { size: 22, font: bodyFont }),
                            ...(cert.link ? [
                                text("  ", { size: 20 }),
                                new ExternalHyperlink({ children: [text("Link", { color: cfg.color, underline: { type: UnderlineType.SINGLE }, font: bodyFont, size: 20 })], link: cert.link }),
                            ] : []),
                        ],
                        spacing: { after: 80 },
                    })
                );
            }
        }
    }

    const margins = isMinimal
        ? { top: 720, bottom: 720, left: 1080, right: 1080 }
        : { top: 720, bottom: 720, left: 900, right: 900 };

    const doc = new Document({
        sections: [{
            properties: { page: { margin: margins } },
            children: sections,
        }],
    });

    return Packer.toBuffer(doc);
}

// ─── PDF Generation ────────────────────────────────────

async function generatePdf(resume, templateName) {
    const cfg = TEMPLATES[templateName] || TEMPLATES.modern;
    const pdfDoc = await PDFDocument.create();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    const isMinimal = templateName === "minimal";
    const isClassic = templateName === "classic";

    const bodyFont = isClassic ? italicFont : font;
    const headingFont = isClassic ? boldFont : boldFont;

    const themeRGB = hexToRgb(cfg.color);
    const grayRGB = rgb(0.47, 0.47, 0.47);
    const lightGrayRGB = rgb(0.75, 0.75, 0.75);

    // ── Page state ──
    let currentPage = pdfDoc.addPage();
    const { width } = currentPage.getSize();
    const marginLeft = isMinimal ? 65 : 50;
    const marginRight = isMinimal ? 65 : 50;
    const marginTop = isMinimal ? 55 : 50;
    const marginBottom = 50;
    const contentWidth = width - marginLeft - marginRight;
    let y = currentPage.getSize().height - marginTop;

    const normalSize = 10;
    const smallSize = 9;
    const tinySize = 8.5;
    const leading = 4;

    function ensureSpace(needed) {
        if (y - needed < marginBottom + 20) {
            currentPage = pdfDoc.addPage();
            y = currentPage.getSize().height - marginTop;
        }
    }

    function drawLine(x1, x2, thickness, color) {
        currentPage.drawLine({
            start: { x: x1, y },
            end: { x: x2, y },
            thickness,
            color,
        });
    }

    function drawTextBlock(str, x, opts = {}) {
        const f = opts.font || bodyFont;
        const sz = opts.size || normalSize;
        const clr = opts.color || rgb(0.1, 0.1, 0.1);
        const maxW = opts.maxWidth || (contentWidth - (x - marginLeft));
        const lines = wrapText(str, f, sz, maxW);
        for (const line of lines) {
            ensureSpace(sz + leading + 2);
            currentPage.drawText(line, { x, y, size: sz, font: f, color: clr });
            y -= sz + leading;
        }
    }

    function drawCenteredText(str, sz, f, clr) {
        const w = f.widthOfTextAtSize(str, sz);
        if (w > contentWidth) {
            // Too wide to center safely - draw as wrapped block starting at left margin
            drawTextBlock(str, marginLeft, { font: f, size: sz, color: clr });
            return;
        }
        ensureSpace(sz + leading + 2);
        currentPage.drawText(str, { x: (width - w) / 2, y, size: sz, font: f, color: clr });
        y -= sz + leading;
    }

    function drawSectionHeading(title) {
        const gapBefore = isMinimal ? 14 : 16;
        const gapAfter = isMinimal ? 6 : 8;
        y -= gapBefore;
        ensureSpace(30);

        const sz = isMinimal ? 10.5 : 11;
        const f = isMinimal ? italicFont : boldFont;

        if (cfg.headingBarStyle === "double") {
            // Classic: double underline
            drawTextBlock(title.toUpperCase(), marginLeft, { font: f, size: sz, color: themeRGB });
            y -= 1;
            drawLine(marginLeft, width - marginRight, 0.6, themeRGB);
            y -= 3;
            drawLine(marginLeft, width - marginRight, 0.6, themeRGB);
            y -= gapAfter;
        } else if (cfg.headingBarStyle === "single") {
            // Modern / Professional: single rule
            drawTextBlock(title.toUpperCase(), marginLeft, { font: f, size: sz, color: themeRGB });
            y -= 1;
            drawLine(marginLeft, width - marginRight, isClassic ? 0.5 : 0.8, themeRGB);
            y -= gapAfter;
        } else {
            // Minimal: no rule
            drawTextBlock(title, marginLeft, { font: f, size: sz, color: themeRGB });
            y -= gapAfter;
        }
    }

    // ── Name ──
    const p = resume.personal || {};
    const name = p.name || "";
    if (cfg.nameAlign === "left") {
        drawTextBlock(name, marginLeft, { font: boldFont, size: isMinimal ? 16 : 18, color: themeRGB });
    } else {
        drawCenteredText(name, isMinimal ? 16 : 18, boldFont, themeRGB);
    }

    // ── Contact ──
    const contactSep = isMinimal ? "  ·  " : "  |  ";
    const contactLine = [p.email, p.phone, p.location].filter(Boolean).join(contactSep);
    if (contactLine) {
        if (cfg.nameAlign === "left") {
            drawTextBlock(contactLine, marginLeft, { font, size: tinySize, color: grayRGB });
        } else {
            const cw = font.widthOfTextAtSize(contactLine, tinySize);
            if (cw > contentWidth) {
                drawTextBlock(contactLine, marginLeft, { font, size: tinySize, color: grayRGB });
            } else {
                ensureSpace(tinySize + leading + 2);
                currentPage.drawText(contactLine, { x: (width - cw) / 2, y, size: tinySize, font, color: grayRGB });
                y -= tinySize + leading;
            }
        }
    }

    // ── Links ──
    const linkParts = [];
    if (p.linkedin) linkParts.push("LinkedIn");
    if (p.github) linkParts.push("GitHub");
    if (p.portfolio) linkParts.push("Portfolio");
    if (linkParts.length) {
        const lt = linkParts.join(isMinimal ? "  ·  " : "  |  ");
        if (cfg.nameAlign === "left") {
            drawTextBlock(lt, marginLeft, { font, size: tinySize, color: themeRGB });
        } else {
            const lw = font.widthOfTextAtSize(lt, tinySize);
            if (lw > contentWidth) {
                drawTextBlock(lt, marginLeft, { font, size: tinySize, color: themeRGB });
            } else {
                ensureSpace(tinySize + leading + 2);
                currentPage.drawText(lt, { x: (width - lw) / 2, y, size: tinySize, font, color: themeRGB });
                y -= tinySize + leading;
            }
        }
    }

    // ── Separator ──
    if (!isMinimal) {
        y -= 4;
        drawLine(marginLeft, width - marginRight, 0.4, lightGrayRGB);
        y -= 6;
    }

    // ── Summary ──
    if (resume.summary) {
        drawSectionHeading("Professional Summary");
        drawTextBlock(resume.summary, marginLeft, { size: normalSize });
        y -= 4;
    }

    // ── Skills ──
    const skills = flattenArray(resume.skills);
    if (skills.length) {
        drawSectionHeading("Technical Skills");

        if (cfg.skillsStyle === "tags") {
            // Modern: dot-separated inline
            drawTextBlock(skills.join("  ·  "), marginLeft, { size: normalSize });
        } else if (cfg.skillsStyle === "list") {
            // Classic: bulleted list
            for (const skill of skills) {
                drawTextBlock(`•  ${skill}`, marginLeft + 10, { size: normalSize });
            }
        } else if (cfg.skillsStyle === "columns") {
            // Professional: two-column
            const colWidth = contentWidth / 2;
            for (let i = 0; i < skills.length; i += 2) {
                ensureSpace(normalSize + leading + 2);
                const leftText = `>  ${skills[i]}`;
                currentPage.drawText(leftText, { x: marginLeft, y, size: normalSize, font: bodyFont, color: rgb(0.1, 0.1, 0.1) });
                if (skills[i + 1]) {
                    const rightText = `>  ${skills[i + 1]}`;
                    const rightW = bodyFont.widthOfTextAtSize(rightText, normalSize);
                    if (marginLeft + colWidth + rightW > width - marginRight) {
                        // Would overflow right margin, truncate with ellipsis
                        const available = width - marginRight - marginLeft - colWidth;
                        const truncated = truncateToWidth(rightText, bodyFont, normalSize, available);
                        currentPage.drawText(truncated, { x: marginLeft + colWidth, y, size: normalSize, font: bodyFont, color: rgb(0.1, 0.1, 0.1) });
                    } else {
                        currentPage.drawText(rightText, { x: marginLeft + colWidth, y, size: normalSize, font: bodyFont, color: rgb(0.1, 0.1, 0.1) });
                    }
                }
                y -= normalSize + leading;
            }
        } else {
            // Minimal: comma-separated
            drawTextBlock(skills.join(", "), marginLeft, { size: normalSize });
        }
        y -= 4;
    }

    // ── Education ──
    const educations = flattenArray(resume.education);
    if (educations.length) {
        drawSectionHeading("Education");
        for (const edu of educations) {
            const degreeLine = [edu.degree, edu.field].filter(Boolean).join(" in ");

            if (isMinimal) {
                // Minimal: institution on top, degree below
                const instLine = [edu.institution, edu.location].filter(Boolean).join(", ");
                drawTextBlock(instLine, marginLeft, { font: boldFont, size: normalSize });
                const degreeDate = [degreeLine, [edu.startDate, edu.endDate].filter(Boolean).join("–")].filter(Boolean).join("  —  ");
                const cgpaPart = edu.cgpa ? `  |  CGPA: ${edu.cgpa}` : "";
                drawTextBlock(`${degreeDate}${cgpaPart}`, marginLeft + 10, { size: smallSize, color: grayRGB });
            } else {
                const degreeInst = [degreeLine, edu.institution ? `— ${edu.institution}` : ""].filter(Boolean).join(" ");
                drawTextBlock(degreeInst, marginLeft, { font: boldFont, size: normalSize });
                const dateStr = [edu.startDate, edu.endDate].filter(Boolean).join(" — ");
                const meta = [dateStr, edu.location, edu.cgpa ? `CGPA: ${edu.cgpa}` : ""].filter(Boolean).join("  |  ");
                if (meta) drawTextBlock(meta, marginLeft, { size: smallSize, color: grayRGB });
            }
            y -= 2;
        }
    }

    // ── Experience ──
    const experiences = flattenArray(resume.experience);
    if (experiences.length) {
        drawSectionHeading("Work Experience");
        for (const exp of experiences) {
            if (isMinimal) {
                drawTextBlock(exp.role || "", marginLeft, { font: boldFont, size: normalSize });
                const compLine = [exp.company, exp.location].filter(Boolean).join(", ");
                const datePart = [exp.startDate, exp.endDate].filter(Boolean).join("–");
                drawTextBlock(`${compLine}${datePart ? `  —  ${datePart}` : ""}`, marginLeft + 10, { size: smallSize, color: grayRGB });
            } else {
                const roleLine = [exp.role, exp.company ? `— ${exp.company}` : ""].filter(Boolean).join(" ");
                drawTextBlock(roleLine, marginLeft, { font: boldFont, size: normalSize });
                const dateStr = [exp.startDate, exp.endDate].filter(Boolean).join(" — ");
                const meta = [dateStr, exp.location].filter(Boolean).join("  |  ");
                if (meta) drawTextBlock(meta, marginLeft, { size: smallSize, color: grayRGB });
            }

            const descs = flattenArray(exp.description);
            for (const d of descs) {
                const bullet = isMinimal ? "–  " : "•  ";
                drawTextBlock(`${bullet}${d}`, marginLeft + (isMinimal ? 10 : 16), { size: normalSize });
            }
            const techs = flattenArray(exp.technologies);
            if (techs.length) {
                drawTextBlock(`Technologies: ${techs.join(", ")}`, marginLeft + (isMinimal ? 10 : 16), { font: italicFont, size: smallSize, color: grayRGB });
            }
            y -= 2;
        }
    }

    // ── Projects ──
    const projects = flattenArray(resume.projects);
    if (projects.length) {
        drawSectionHeading("Projects");
        for (const proj of projects) {
            drawTextBlock(proj.name || "", marginLeft, { font: boldFont, size: normalSize });
            const descs = flattenArray(proj.description);
            for (const d of descs) {
                const bullet = isMinimal ? "–  " : "•  ";
                drawTextBlock(`${bullet}${d}`, marginLeft + (isMinimal ? 10 : 16), { size: normalSize });
            }
            const techs = flattenArray(proj.technologies);
            if (techs.length) {
                drawTextBlock(`Technologies: ${techs.join(", ")}`, marginLeft + (isMinimal ? 10 : 16), { font: italicFont, size: smallSize, color: grayRGB });
            }
            y -= 2;
        }
    }

    // ── Certifications ──
    const certs = flattenArray(resume.certifications);
    if (certs.length) {
        drawSectionHeading("Certifications");
        for (const cert of certs) {
            if (isMinimal) {
                const line = [cert.name, cert.issuer].filter(Boolean).join(" — ");
                const datePart = cert.date ? `  (${cert.date})` : "";
                drawTextBlock(`${line}${datePart}`, marginLeft, { size: normalSize });
            } else {
                const line = [cert.name, cert.issuer].filter(Boolean).join(" — ");
                const datePart = cert.date ? `  (${cert.date})` : "";
                drawTextBlock(`${line}${datePart}`, marginLeft, { size: normalSize });
            }
        }
    }

    return pdfDoc.save();
}

// ─── Utilities ──────────────────────────────────────────

function personal(resume) {
    return resume.personal || {};
}

function hexToRgb(hex) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16) / 255;
    const g = parseInt(h.substring(2, 4), 16) / 255;
    const b = parseInt(h.substring(4, 6), 16) / 255;
    return rgb(r, g, b);
}

function wrapText(str, fontObj, fontSize, maxWidth) {
    if (!str) return [""];
    const words = str.split(" ");
    const lines = [];
    let currentLine = "";

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = fontObj.widthOfTextAtSize(testLine, fontSize);
        if (testWidth > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine) lines.push(currentLine);
    return lines.length ? lines : [""];
}

function truncateToWidth(str, fontObj, fontSize, maxWidth) {
    if (fontObj.widthOfTextAtSize(str, fontSize) <= maxWidth) return str;
    let result = "";
    for (const ch of str.split("")) {
        if (fontObj.widthOfTextAtSize(result + ch + "…", fontSize) > maxWidth) break;
        result += ch;
    }
    return result + "…";
}

// ─── Exports ────────────────────────────────────────────

export async function generateResumeFile(resume, templateName, format) {
    if (format === "docx") {
        const buffer = await generateDocx(resume, templateName);
        return {
            buffer,
            contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            extension: "docx",
        };
    }

    if (format === "pdf") {
        const bytes = await generatePdf(resume, templateName);
        return {
            buffer: Buffer.from(bytes),
            contentType: "application/pdf",
            extension: "pdf",
        };
    }

    throw new Error(`Unsupported format "${format}". Use "pdf" or "docx".`);
}
