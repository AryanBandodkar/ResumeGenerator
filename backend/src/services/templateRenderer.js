import Mustache from "mustache";
import { readFileSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, basename, extname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEMPLATES_DIR = join(__dirname, "../templates");

const VALID_TEMPLATES = new Set(["classic", "modern", "minimal", "professional"]);

// Strings read from user data may contain LaTeX-special characters which would
// break compilation or produce wrong output. Escape them before rendering.
const ESCAPE_MAP = {
    "\\": "\\textbackslash{}",
    "{": "\\{",
    "}": "\\}",
    "&": "\\&",
    "%": "\\%",
    "$": "\\$",
    "#": "\\#",
    "_": "\\_",
    "~": "\\textasciitilde{}",
    "^": "\\textasciicircum{}",
};

function escapeLatex(value) {
    if (typeof value !== "string") return value;
    return value.replace(/[\\{}&%$#_~^]/g, (ch) => ESCAPE_MAP[ch]);
}

function sanitize(value) {
    if (typeof value === "string") {
        return escapeLatex(value);
    }
    if (Array.isArray(value)) {
        return value.map(sanitize);
    }
    if (value && typeof value === "object") {
        const out = {};
        for (const key of Object.keys(value)) {
            out[key] = sanitize(value[key]);
        }
        return out;
    }
    return value;
}

// Build the exact view the templates expect. Array fields that are displayed
// inline (skills in some templates, technologies) are pre-joined into a single
// comma-separated string so templates never have to reason about list position.
function buildView(resume) {
    const data = sanitize(resume || {});

    const personal = data.personal || {};

    const mapWithJoined = (list, joinedKeys) => {
        if (!Array.isArray(list)) return [];
        return list.map((item) => {
            const base = typeof item === "object" && item !== null ? item : {};
            const out = { ...base };
            for (const key of joinedKeys) {
                if (Array.isArray(base[key])) {
                    out[`${key}_joined`] = base[key].filter(Boolean).join(", ");
                }
            }
            return out;
        });
    };

    return {
        personal,
        summary: typeof data.summary === "string" ? data.summary : "",
        skills: Array.isArray(data.skills) ? data.skills : [],
        skills_joined: (Array.isArray(data.skills) ? data.skills : []).filter(Boolean).join(", "),
        education: Array.isArray(data.education) ? data.education : [],
        experience: mapWithJoined(data.experience, ["technologies"]),
        projects: mapWithJoined(data.projects, ["technologies"]),
        certifications: Array.isArray(data.certifications) ? data.certifications : [],
    };
}

function renderTemplate(templateName, resumeData) {
    if (!VALID_TEMPLATES.has(templateName)) {
        throw new Error(
            `Unknown template "${templateName}". Valid templates: ${[...VALID_TEMPLATES].join(", ")}`
        );
    }

    const templatePath = join(TEMPLATES_DIR, `${templateName}.tex`);
    const templateContent = readFileSync(templatePath, "utf-8");

    // Disable HTML-escaped output (default escapes &, <, >, etc.) since we are
    // producing LaTeX, not HTML, and we already sanitize the data ourselves.
    Mustache.escape = (value) => value;

    return Mustache.render(templateContent, buildView(resumeData));
}

function listTemplates() {
    return readdirSync(TEMPLATES_DIR)
        .filter((file) => extname(file) === ".tex")
        .map((file) => basename(file, ".tex"));
}

export { renderTemplate, listTemplates, VALID_TEMPLATES };
