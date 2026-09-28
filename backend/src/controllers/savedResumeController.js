import { generateResumeFile } from "../services/latexService.js";
import { VALID_TEMPLATES } from "../services/templateRenderer.js";

// POST /api/resumes
// Save a resume to the authenticated user's history.
// Body: { title?, template, format, resume_data, company_name? }
export async function saveResume(req, res) {
    const { supabase } = req;
    const { title, template, format, resume_data, company_name } = req.body || {};

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

    // Group the resume with the others saved for the same job (title + company).
    // Resumes saved without a target role stay ungrouped.
    const jobTitle =
        typeof resume_data.job?.role === "string" && resume_data.job.role.trim()
            ? resume_data.job.role.trim()
            : null;

    const company =
        typeof company_name === "string" && company_name.trim() ? company_name.trim() : null;

    let jobApplicationId = null;

    if (jobTitle) {
        let lookup = supabase
            .from("job_applications")
            .select("id")
            .eq("user_id", req.user.id)
            .eq("job_title", jobTitle);

        lookup = company ? lookup.eq("company_name", company) : lookup.is("company_name", null);

        const { data: existing, error: lookupError } = await lookup.limit(1).maybeSingle();

        if (lookupError) {
            return res.status(500).json({ success: false, message: lookupError.message });
        }

        if (existing) {
            jobApplicationId = existing.id;
        } else {
            const { data: created, error: createError } = await supabase
                .from("job_applications")
                .insert({
                    user_id: req.user.id,
                    job_title: jobTitle,
                    company_name: company,
                    job_description: resume_data.job?.jobDescription || null,
                })
                .select("id")
                .single();

            if (createError) {
                return res.status(500).json({ success: false, message: createError.message });
            }

            jobApplicationId = created.id;
        }
    }

    const { data, error } = await supabase
        .from("resumes")
        .insert({
            user_id: req.user.id,
            title: typeof title === "string" && title.trim() ? title.trim() : "Untitled Resume",
            template,
            format,
            resume_data,
            job_application_id: jobApplicationId,
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
    const { supabase } = req;

    const { data, error } = await supabase
        .from("resumes")
        .select("id, title, template, format, job_application_id, created_at, updated_at")
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
    const { supabase } = req;
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
    const { supabase } = req;
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
    const { supabase } = req;
    const { id } = req.params;

    const { data: target, error: targetError } = await supabase
        .from("resumes")
        .select("id, job_application_id")
        .eq("id", id)
        .eq("user_id", req.user.id)
        .maybeSingle();

    if (targetError) {
        return res.status(500).json({ success: false, message: targetError.message });
    }

    if (!target) {
        return res.status(404).json({ success: false, message: "Resume not found." });
    }

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

    // The selected resume is reset by the foreign key (on delete set null).
    // The group only exists to hold resumes, so drop it once it is empty.
    if (target.job_application_id) {
        const { count } = await supabase
            .from("resumes")
            .select("id", { count: "exact", head: true })
            .eq("job_application_id", target.job_application_id)
            .eq("user_id", req.user.id);

        if (count === 0) {
            await supabase
                .from("job_applications")
                .delete()
                .eq("id", target.job_application_id)
                .eq("user_id", req.user.id);
        }
    }

    res.json({ success: true });
}