import { Router } from "express";
import { renderTemplate, listTemplates, VALID_TEMPLATES } from "../services/templateRenderer.js";
import { generateResumeFile } from "../services/fileGenerator.js";

const router = Router();

// GET /api/templates
// List available templates.
router.get("/templates", (_req, res) => {
    res.json({
        success: true,
        templates: listTemplates(),
    });
});

// POST /api/templates/render
// Render a resume into LaTeX using a named template.
// Body: { template: "classic", resume: { ...resumeModel shape } }
router.post("/templates/render", (req, res) => {
    const { template, resume } = req.body || {};

    if (!VALID_TEMPLATES.has(template)) {
        return res.status(400).json({
            success: false,
            message: `Unknown template "${template}". Valid templates: ${[...VALID_TEMPLATES].join(", ")}`,
        });
    }

    if (!resume || typeof resume !== "object") {
        return res.status(400).json({
            success: false,
            message: "A resume object is required in the request body.",
        });
    }

    try {
        const latex = renderTemplate(template, resume);
        res.json({
            success: true,
            template,
            latex,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/templates/generate
// Generate a resume file (PDF or DOCX) from resume data.
// Body: { template: "modern", format: "pdf"|"docx", resume: { ... } }
router.post("/templates/generate", async (req, res) => {
    const { template, format, resume } = req.body || {};

    if (!VALID_TEMPLATES.has(template)) {
        return res.status(400).json({
            success: false,
            message: `Unknown template "${template}". Valid templates: ${[...VALID_TEMPLATES].join(", ")}`,
        });
    }

    if (!format || !["pdf", "docx"].includes(format)) {
        return res.status(400).json({
            success: false,
            message: 'Format must be "pdf" or "docx".',
        });
    }

    if (!resume || typeof resume !== "object") {
        return res.status(400).json({
            success: false,
            message: "A resume object is required in the request body.",
        });
    }

    try {
        const { buffer, contentType, extension } = await generateResumeFile(resume, template, format);
        const filename = `resume-${template}.${extension}`;

        res.setHeader("Content-Type", contentType);
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.send(buffer);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
