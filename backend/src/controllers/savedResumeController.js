import { supabase } from "../services/supabaseClient.js";
import { generateResumeFile } from "../services/fileGenerator.js";
import { VALID_TEMPLATES } from "../services/templateRenderer.js";

// POST /api/resumes
// Save a resume to the authenticated user's history.
// Body: { title?, template, format, resume_data }
export async function saveResume(req, res) {
    const { title, template, format, resume_data } = req.body || {};

    if (!resume_data || typeof resume_data !== "object") {
        return res.status(400).json({
            success: false,
            message: "A resume_data object is required in the request body.",
        });
    }

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

    const { data, error } = await supabase
        .from("resumes")
        .insert({
            user_id: req.user.id,
            title: typeof title === "string" && title.trim() ? title.trim() : "Untitled Resume",
            template,
            format,
            resume_data,
        })
        .select("id, title, template, format, created_at, updated_at")
        .single();

    if (error) {
        return res.status(500).json({ success: false, message: error.message });
    }

    res.status(201).json({ success: true, data });
}

// GET /api/resumes
// List the authenticated user's saved resumes, newest first.
export async function listResumes(req, res) {
    const { data, error } = await supabase
        .from("resumes")
        .select("id, title, template, format, created_at, updated_at")
        .eq("user_id", req.user.id)
        .order("created_at", { ascending: false });

    if (error) {
        return res.status(500).json({ success: false, message: error.message });
    }

    res.json({ success: true, data });
}

// GET /api/resumes/:id
// Fetch the full resume (including resume_data) for viewing or editing.
export async function getResume(req, res) {
    const { id } = req.params;

    const { data, error } = await supabase
        .from("resumes")
        .select("id, title, template, format, resume_data, created_at, updated_at")
        .eq("id", id)
        .eq("user_id", req.user.id)
        .single();

    if (error || !data) {
        return res.status(404).json({ success: false, message: "Resume not found." });
    }

    res.json({ success: true, data });
}

// GET /api/resumes/:id/download
// Regenerate the file from stored data and stream it to the client.
export async function downloadResume(req, res) {
    const { id } = req.params;

    const { data, error } = await supabase
        .from("resumes")
        .select("resume_data, template, format")
        .eq("id", id)
        .eq("user_id", req.user.id)
        .single();

    if (error || !data) {
        return res.status(404).json({ success: false, message: "Resume not found." });
    }

    try {
        const { buffer, contentType, extension } = await generateResumeFile(
            data.resume_data,
            data.template,
            data.format
        );

        const filename = `resume-${data.template}.${extension}`;

        res.setHeader("Content-Type", contentType);
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.send(buffer);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// DELETE /api/resumes/:id
// Remove one of the authenticated user's saved resumes.
export async function deleteResume(req, res) {
    const { id } = req.params;

    const { data, error } = await supabase
        .from("resumes")
        .delete()
        .eq("id", id)
        .eq("user_id", req.user.id)
        .select("id");

    if (error) {
        return res.status(500).json({ success: false, message: error.message });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({ success: false, message: "Resume not found." });
    }

    res.json({ success: true });
}