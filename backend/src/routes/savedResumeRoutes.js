import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
    saveResume,
    listResumes,
    getResume,
    downloadResume,
    deleteResume,
} from "../controllers/savedResumeController.js";

const router = Router();

router.post("/resumes", requireAuth, saveResume);
router.get("/resumes", requireAuth, listResumes);
router.get("/resumes/:id/download", requireAuth, downloadResume);
router.get("/resumes/:id", requireAuth, getResume);
router.delete("/resumes/:id", requireAuth, deleteResume);

export default router;