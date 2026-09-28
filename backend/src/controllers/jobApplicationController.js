const APPLICATION_STATUSES = ["not_applied", "applied", "interview", "accepted", "rejected"];

// GET /api/job-applications
// List the authenticated user's job application groups, newest first.
export async function listJobApplications(req, res) {
    const { supabase } = req;

    const { data: groups, error } = await supabase
        .from("job_applications")
        .select("id, company_name, job_title, application_status, selected_resume_id, created_at, updated_at")
        .eq("user_id", req.user.id)
        .order("created_at", { ascending: false });

    if (error) {
        return res.status(500).json({ success: false, message: error.message });
    }

    if (!groups || groups.length === 0) {
        return res.json({ success: true, data: [] });
    }

    const { data: resumes, error: resumesError } = await supabase
        .from("resumes")
        .select("id, job_application_id")
        .in("job_application_id", groups.map((group) => group.id))
        .eq("user_id", req.user.id);

    if (resumesError) {
        return res.status(500).json({ success: false, message: resumesError.message });
    }

    const counts = new Map();

    for (const resume of resumes || []) {
        counts.set(resume.job_application_id, (counts.get(resume.job_application_id) || 0) + 1);
    }

    res.json({
        success: true,
        data: groups.map((group) => ({
            ...group,
            resume_count: counts.get(group.id) || 0,
        })),
    });
}

// GET /api/job-applications/:id/resumes
// List the resumes saved inside one of the authenticated user's job applications.
export async function listJobApplicationResumes(req, res) {
    const { supabase } = req;

    const { id } = req.params;

    const { data: group, error: groupError } = await supabase
        .from("job_applications")
        .select("id")
        .eq("id", id)
        .eq("user_id", req.user.id)
        .maybeSingle();

    if (groupError) {
        return res.status(500).json({ success: false, message: groupError.message });
    }

    if (!group) {
        return res.status(404).json({ success: false, message: "Job application not found." });
    }

    const { data, error } = await supabase
        .from("resumes")
        .select("id, job_application_id, title, template, format, created_at, updated_at")
        .eq("job_application_id", id)
        .eq("user_id", req.user.id)
        .order("created_at", { ascending: false });

    if (error) {
        return res.status(500).json({ success: false, message: error.message });
    }

    res.json({ success: true, data });
}

// PATCH /api/job-applications/:id/selected-resume
// Record which resume was actually used for this application.
// Body: { resume_id: uuid | null }
export async function updateSelectedResume(req, res) {
    const { supabase } = req;

    const { id } = req.params;
    const resumeId = req.body?.resume_id ?? null;

    const { data: group, error: groupError } = await supabase
        .from("job_applications")
        .select("id")
        .eq("id", id)
        .eq("user_id", req.user.id)
        .maybeSingle();

    if (groupError) {
        return res.status(500).json({ success: false, message: groupError.message });
    }

    if (!group) {
        return res.status(404).json({ success: false, message: "Job application not found." });
    }

    if (resumeId) {
        const { data: resume, error: resumeError } = await supabase
            .from("resumes")
            .select("id")
            .eq("id", resumeId)
            .eq("user_id", req.user.id)
            .eq("job_application_id", id)
            .maybeSingle();

        if (resumeError) {
            return res.status(500).json({ success: false, message: resumeError.message });
        }

        if (!resume) {
            return res.status(400).json({
                success: false,
                message: "That resume does not belong to this job application.",
            });
        }
    }

    const { data, error } = await supabase
        .from("job_applications")
        .update({ selected_resume_id: resumeId, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", req.user.id)
        .select("id, selected_resume_id, updated_at");

    if (error) {
        return res.status(500).json({ success: false, message: error.message });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({ success: false, message: "Job application not found." });
    }

    res.json({ success: true, data: data[0] });
}

// PATCH /api/job-applications/:id/status
// Move the application through the manual status list.
// Body: { application_status: string }
export async function updateApplicationStatus(req, res) {
    const { supabase } = req;

    const { id } = req.params;
    const { application_status } = req.body || {};

    if (!APPLICATION_STATUSES.includes(application_status)) {
        return res.status(400).json({
            success: false,
            message: `Status must be one of: ${APPLICATION_STATUSES.join(", ")}.`,
        });
    }

    const { data, error } = await supabase
        .from("job_applications")
        .update({ application_status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", req.user.id)
        .select("id, application_status, updated_at");

    if (error) {
        return res.status(500).json({ success: false, message: error.message });
    }

    if (!data || data.length === 0) {
        return res.status(404).json({ success: false, message: "Job application not found." });
    }

    res.json({ success: true, data: data[0] });
}
