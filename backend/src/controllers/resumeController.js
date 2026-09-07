import { extractTextFromFile } from "../services/fileTextExtractor.js";
import { parseResumeWithGroq } from "../services/groqParser.js";
import { unlink } from "fs/promises";

// Parse an uploaded resume file (PDF / DOC / DOCX) using Groq.
export async function parseResume(req, res) {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No file uploaded. Please upload a PDF, DOC, or DOCX file.",
        });
    }

    const filePath = req.file.path;
    const job = req.body.job ? JSON.parse(req.body.job) : {};

    try {
        const text = await extractTextFromFile(filePath);
        const parsed = await parseResumeWithGroq(text, job);
        res.json({ success: true, data: parsed });
    } catch (err) {
        res.status(422).json({
            success: false,
            message: err.message,
        });
    } finally {
        await unlink(filePath).catch(() => {});
    }
}

// Parse raw resume text using Groq.
export async function parseResumeText(req, res) {
    const { text, job } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json({
            success: false,
            message: "No resume text provided.",
        });
    }

    try {
        const parsed = await parseResumeWithGroq(text, job || {});
        res.json({ success: true, data: parsed });
    } catch (err) {
        res.status(422).json({
            success: false,
            message: err.message,
        });
    }
}
