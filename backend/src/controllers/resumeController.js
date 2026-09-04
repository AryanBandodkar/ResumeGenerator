import { parsePDF } from "../services/parser/pdfParser.js";
import { unlink } from "fs/promises";

export async function parseResume(req, res) {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No file uploaded. Please upload a PDF, DOC, or DOCX file.",
        });
    }

    const filePath = req.file.path;

    try {
        const parsed = await parsePDF(filePath);
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
