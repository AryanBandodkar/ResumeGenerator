
/*
    What this module does : 
    Extracts important information from text nd parses it into 
    structured json (format of json is in backend/models/resumeModel.json )
*/
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

//basically done to load my resumeModel.json into a js object
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const resumeModel = JSON.parse(readFileSync(join(__dirname, "../../models/resumeModel.json"), "utf-8"));

// A helper function that matches the regular expression provided with the text(Finds first match) and returns empty string if no matches r found
function getMatch(text, regex, fallback = "") {
    const match = text.match(regex);
    return match ? match[0].trim() : fallback;
}

// Helper fn tht matches regular expression with text ( finds all matches)
function getAllMatches(text, regex) {
    const globalRegex = regex.global ? regex : new RegExp(regex.source, regex.flags + "g");
    return [...text.matchAll(globalRegex)].map((m) => m[0].trim());
}

//Fn that matches personal info based on the ext 
function extractPersonal(text) {
    const email = getMatch(text, /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
    const phone = getMatch(text, /(?:\+91[\s-]?)?[6-9]\d{9}/);
    const github = getMatch(text, /https?:\/\/(?:www\.)?github\.com\/[\w.-]+/);
    const linkedin = getMatch(text, /https?:\/\/(?:www\.)?linkedin\.com\/in\/[\w-]+/);
    const portfolio = getMatch(text, /https?:\/\/(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/\S*)?/);

    // Done as \n is stored as a seperate character/entry in the array
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const sectionHeaders = ["experience", "education", "skills", "projects", "certifications", "summary", "contact"];

    //Assuming that the user will type his name at the first line of the text
    let name = "";
    for (const line of lines) {
        const lower = line.toLowerCase();
        if (sectionHeaders.some((h) => lower.includes(h))) continue;
        if (line.includes("@") || line.startsWith("http")) continue;
        if (line.length < 2 || line.length > 60) continue;
        name = line;
        break;
    }

    const location = getMatch(text, /(?:Location|Address|City|Location:)\s*[:\-]?\s*(.+)/i, "");

    return {
        name,
        email,
        phone,
        location,
        linkedin,
        github,
        portfolio
    };
}

// ---- SKILLS ----
function extractSkills(text) {
    // this is the regex for finding the "Skills" Section till its end ie. when another section starts like experience, education etc
    const skillsSection = text.match(/skills[\s:]*\n([\s\S]*?)(?=\n\s*\n|\n\s*(?:experience|education|projects|certifications|summary))/i);
    if (skillsSection) {
        // split by comma, newline, or bullet points
        const raw = skillsSection[1];
        const skills = raw.split(/[\n,•\-\*]+/).map((s) => s.trim()).filter(Boolean);
        return skills;
    }

    // fallback: common skill keywords
    const commonSkills = [
        "javascript", "typescript", "python", "java", "c\\+\\+", "c#", "ruby", "go", "rust",
        "react", "angular", "vue", "node\\.js", "express", "django", "flask", "spring",
        "html", "css", "sql", "mongodb", "postgresql", "mysql", "redis",
        "aws", "docker", "kubernetes", "git", "linux", "figma",
        "machine learning", "data science", "REST", "graphql"
    ];

    //this is done incase the user  types "Ive built a REST API using node.js and postgresql. it can extract the skill used"
    const found = [];
    const lowerText = text.toLowerCase();
    for (const skill of commonSkills) {
        const regex = new RegExp("\\b" + skill + "\\b", "i");
        if (regex.test(lowerText)) {
            found.push(skill.replace(/\\\+/g, "+").replace(/\\\./g, "."));
        }
    }
    return [...new Set(found)];
}

// ---- EDUCATION ----
function extractEducation(text) {
    const eduSection = text.match(/education[\s:]*\n([\s\S]*?)(?=\n\s*\n|\n\s*(?:experience|skills|projects|certifications|summary))/i);

    //Incase user forgers to add his education or the fn couldnt find it , fallback is placed so he can fill it later
    if (!eduSection) return [{ institution: "", degree: "", field: "", location: "", startDate: "", endDate: "", cgpa: "" }];

    const block = eduSection[1];
    //regular expressions to find the lines containing what type of institution,degree and cgpa and copies that whole block 
    // (Assumes that block is the correct info)
    const institutions = getAllMatches(block, /[\w\s]+(?:university|college|institute|school)[\s\S]*?(?=\n|$)/gi);
    const degrees = getAllMatches(block, /(?:bachelor|master|b\.?s\.?|m\.?s\.?|b\.?tech|m\.?tech|b\.?e\.?|m\.?e\.?|ph\.?d\.?|diploma)[\s\S]*?(?=\n|$)/gi);
    const cgpa = getMatch(block, /(?:cgpa|gpa|grade)[:\s]*([\d.]+)/i, "");

    const education = [];
    const count = Math.max(institutions.length, degrees.length, 1);
    for (let i = 0; i < count; i++) {
        education.push({
            institution: institutions[i] || "",
            degree: degrees[i] || "",
            field: "",
            location: "",
            startDate: "",
            endDate: "",
            cgpa
        });
    }
    return education;
}

// ---- EXPERIENCE ----
function extractExperience(text) {
    const expSection = text.match(/experience[\s:]*\n([\s\S]*?)(?=\n\s*\n|\n\s*(?:education|skills|projects|certifications|summary))/i);
    if (!expSection) return [{ company: "", role: "", location: "", startDate: "", endDate: "", description: [], technologies: [] }];

    const block = expSection[1];
    const companies = getAllMatches(block, /(?:at|@)\s+([A-Z][A-Za-z\s&]+)/g).map((c) => c.replace(/^(?:at|@)\s+/i, ""));
    const roles = getAllMatches(block, /(?:intern|developer|engineer|manager|analyst|lead|associate|senior|junior)[\s\S]*?(?=\n|$)/gi).map((r) => r.replace(/\s+(?:at|@)\s+.*/i, ""));

    const description = block.split("\n").map((l) => l.trim()).filter((l) => l.length > 5 && !l.match(/^(experience|education|skills|projects)/i));

    return [{
        company: companies[0] || "",
        role: roles[0] || "",
        location: "",
        startDate: "",
        endDate: "",
        description: description.slice(0, 5),
        technologies: []
    }];
}

// ---- PROJECTS ----
function extractProjects(text) {
    const projSection = text.match(/projects[\s:]*\n([\s\S]*?)(?=\n\s*\n|\n\s*(?:experience|education|skills|certifications|summary))/i);
    if (!projSection) return [{ name: "", description: [], technologies: [], github: "", link: "" }];

    const block = projSection[1];
    const githubLinks = getAllMatches(block, /https?:\/\/(?:www\.)?github\.com\/[\w.-]+(?:\/[\w.-]+)?/);
    const names = getAllMatches(block, /^(?:[\-\*\s]*)([A-Z][^\n]+)/gm);
    const descriptions = block.split("\n").map((l) => l.trim()).filter((l) => l.length > 5 && !l.match(/^(projects|experience|education|skills)/i));

    return [{
        name: names[0] || "",
        description: descriptions.slice(0, 5),
        technologies: [],
        github: githubLinks[0] || "",
        link: ""
    }];
}

// ---- CERTIFICATIONS ----
function extractCertifications(text) {
    const certSection = text.match(/certifications?[\s:]*\n([\s\S]*?)$/i);
    if (!certSection) return [{ name: "", issuer: "", date: "", link: "" }];

    const block = certSection[1];
    const certs = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const links = getAllMatches(block, /https?:\/\/\S+/);

    return certs.map((cert, i) => ({
        name: cert,
        issuer: "",
        date: "",
        link: links[i] || ""
    }));
}

// ---- MAIN PARSER ----
export function parseText(text) {
    const resume = JSON.parse(JSON.stringify(resumeModel));

    resume.personal = extractPersonal(text);
    resume.skills = extractSkills(text);
    resume.education = extractEducation(text);
    resume.experience = extractExperience(text);
    resume.projects = extractProjects(text);
    resume.certifications = extractCertifications(text);

    return resume;
}
