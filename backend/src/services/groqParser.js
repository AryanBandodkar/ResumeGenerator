import Groq from "groq-sdk";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const resumeModel = JSON.parse(
    readFileSync(join(__dirname, "../models/resumeModel.json"), "utf-8")
);

// Response format includes an extra "job" field for the user's target
// role and job description, which the frontend stores alongside the resume.
const RESUME_SCHEMA = {
    ...resumeModel,
    job: {
        role: "",
        jobDescription: "",
    },
};

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a resume parser. Extract all information from the provided resume text and return it as JSON.

Return ONLY valid JSON matching this exact schema (no markdown, no commentary):

${JSON.stringify(RESUME_SCHEMA, null, 2)}

Rules:
- "personal.name" should be the person's full name.
- "summary" is a single string; if missing, make it an empty string.
- "skills" is an array of strings (individual skills).
- "education", "experience", "projects", "certifications" are arrays of objects.
  Include as many entries as appear in the resume. If none, return an empty array
  (NOT a single empty-object entry).
- "experience[].description" is an array of bullet-point strings.
- "experience[].technologies" and "projects[].technologies" are arrays of strings.
- Fill dates as strings (e.g. "2023" or "May 2026"). Leave missing optional fields as empty strings / empty arrays.
- "job.role" is the job title the person is targeting.
- "job.jobDescription" is the full job description text. If not provided, leave it empty.
- Never invent information that is not present in the text.`;

export async function parseResumeWithGroq(text, job = {}) {
    if (!text || !text.trim()) {
        throw new Error("No resume content provided.");
    }

    const content = `${text}\n\nTarget role: ${job.role || ""}\nJob description: ${job.jobDescription || ""}`;

    const completion = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content },
        ],
    });

    const raw = completion.choices?.[0]?.message?.content;

    if (!raw) {
        throw new Error("Groq returned an empty response.");
    }

    // The model should return pure JSON (json_object mode), but strip any
    // accidental markdown fences just in case.
    const cleaned = raw.replace(/```(?:json)?/g, "").trim();

    let parsed;
    try {
        parsed = JSON.parse(cleaned);
    } catch {
        throw new Error("Failed to parse the AI response as JSON.");
    }

    // Merge onto the schema so every expected field exists, even if the
    // model omitted some.
    return mergeWithSchema(parsed);
}

function mergeWithSchema(parsed) {
    const result = JSON.parse(JSON.stringify(RESUME_SCHEMA));

    // personal
    result.personal = { ...result.personal, ...(parsed.personal || {}) };

    // simple scalar fields
    if (typeof parsed.summary === "string") result.summary = parsed.summary;
    result.skills = Array.isArray(parsed.skills) ? parsed.skills : [];

    // arrays of objects
    for (const key of ["education", "experience", "projects", "certifications"]) {
        const src = parsed[key];
        if (Array.isArray(src)) {
            const template = result[key][0] || {};
            result[key] = src.map((item) => ({
                ...template,
                ...(typeof item === "object" && item !== null ? item : {}),
            }));
        }
    }

    // job (may not exist in the model output)
    if (parsed.job && typeof parsed.job === "object") {
        result.job = { ...result.job, ...parsed.job };
    }

    return result;
}
