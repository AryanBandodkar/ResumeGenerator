import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
    listJobApplications,
    listJobApplicationResumes,
    updateSelectedResume,
    updateApplicationStatus,
} from "../controllers/jobApplicationController.js";

const router = Router();

router.get("/job-applications", requireAuth, listJobApplications);
router.get("/job-applications/:id/resumes", requireAuth, listJobApplicationResumes);
router.patch("/job-applications/:id/selected-resume", requireAuth, updateSelectedResume);
router.patch("/job-applications/:id/status", requireAuth, updateApplicationStatus);

export default router;
