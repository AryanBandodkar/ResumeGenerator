import { Router } from "express";
import multer from "multer";
import { join, extname } from "path";
import { existsSync, mkdirSync } from "fs";
import { parseResume, parseResumeText } from "../controllers/resumeController.js";

const uploadDir = join(process.cwd(), "uploads");
if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e5)}`;
        cb(null, `${unique}${extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (_req, file, cb) => {
        const allowed = [".pdf", ".doc", ".docx"];
        if (allowed.includes(extname(file.originalname).toLowerCase())) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF, DOC, and DOCX files are allowed."));
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.post("/parse", upload.single("resume"), parseResume);
router.post("/parse-text", parseResumeText);

export default router;
