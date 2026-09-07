/*
    Extracts raw text from PDF, DOC, or DOCX files.
    (Used so the file content can be sent to the Groq parsing API.)
*/
import { readFile } from "fs/promises";
import { extname } from "path";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

const SUPPORTED_EXTENSIONS = [".pdf", ".doc", ".docx"];

export async function extractTextFromFile(filePath) {
    const ext = extname(filePath).toLowerCase();

    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
        throw new Error(
            `Unsupported file format "${ext}". Supported formats: ${SUPPORTED_EXTENSIONS.join(", ")}`
        );
    }

    const buffer = await readFile(filePath);

    let text;
    if (ext === ".pdf") {
        const pdf = new PDFParse({ data: buffer });
        const result = await pdf.getText();
        text = result.text;
    } else {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
    }

    if (!text || text.trim().length === 0) {
        throw new Error("No text content found in the provided file.");
    }

    return text;
}
