import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderTemplate } from "./templateRenderer.js";

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// The LaTeX toolchain binaries are downloaded into backend/bin by the
// postinstall script (scripts/install-binaries.mjs). Override with the
// TECTONIC_BIN / PANDOC_BIN env vars or your system PATH if needed.
const BIN_DIR = join(__dirname, "../../bin");
const TECTONIC_BIN =
    process.env.TECTONIC_BIN ?? join(BIN_DIR, process.platform === "win32" ? "tectonic.exe" : "tectonic");
const PANDOC_BIN =
    process.env.PANDOC_BIN ?? join(BIN_DIR, process.platform === "win32" ? "pandoc.exe" : "pandoc");

const PDF_CONTENT_TYPE = "application/pdf";
const DOCX_CONTENT_TYPE =
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

async function withTempDir(run) {
    const dir = await mkdtemp(join(tmpdir(), "resume-gen-"));
    try {
        return await run(dir);
    } finally {
        await rm(dir, { recursive: true, force: true });
    }
}

async function runTool(command, args, options) {
    try {
        const { stdout, stderr } = await execFileAsync(command, args, {
            timeout: 120000,
            maxBuffer: 10 * 1024 * 1024,
            ...options,
        });
        if (stderr && stderr.trim()) {
            // Tectonic/pandoc print benign notes to stderr; only surface on failure.
            return { stdout, stderr };
        }
        return { stdout, stderr };
    } catch (err) {
        throw new Error(
            `Failed to run "${command}". ${err.message}${
                err.stderr ? `\nOutput: ${err.stderr}` : ""
            }`
        );
    }
}

// Render a resume through its LaTeX template and compile it to PDF with Tectonic.
// Returns { buffer, contentType, extension }.
async function generatePdf(templateName, resume) {
    const latex = renderTemplate(templateName, resume);

    return withTempDir(async (dir) => {
        const texPath = join(dir, "resume.tex");
        await writeFile(texPath, latex, "utf8");

        await runTool(TECTONIC_BIN, ["-X", "compile", texPath, "--outdir", dir]);

        const buffer = await readFile(join(dir, "resume.pdf"));
        return { buffer, contentType: PDF_CONTENT_TYPE, extension: "pdf" };
    });
}

// Render a resume through its LaTeX template and convert it to DOCX with Pandoc.
// Returns { buffer, contentType, extension }.
async function generateDocx(templateName, resume) {
    const latex = renderTemplate(templateName, resume);

    return withTempDir(async (dir) => {
        const texPath = join(dir, "resume.tex");
        await writeFile(texPath, latex, "utf8");

        const docxPath = join(dir, "resume.docx");
        await runTool(PANDOC_BIN, [texPath, "--from=latex", "--standalone", "-o", docxPath]);

        const buffer = await readFile(docxPath);
        return { buffer, contentType: DOCX_CONTENT_TYPE, extension: "docx" };
    });
}

// Dispatcher shared by the routes and saved-resume controller.
async function generateResumeFile(resume, templateName, format) {
    if (format === "pdf") return generatePdf(templateName, resume);
    if (format === "docx") return generateDocx(templateName, resume);
    throw new Error(`Unsupported format "${format}".`);
}

export { generateResumeFile, generatePdf, generateDocx };