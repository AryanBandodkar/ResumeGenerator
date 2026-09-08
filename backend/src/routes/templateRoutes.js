import { Router } from "express";
import { renderTemplate, listTemplates, VALID_TEMPLATES } from "../services/templateRenderer.js";

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

export default router;
