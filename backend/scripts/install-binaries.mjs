import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { constants } from "node:fs";
import { createWriteStream } from "node:fs";
import {
    access,
    chmod,
    copyFile,
    mkdir,
    mkdtemp,
    readdir,
    rm,
    writeFile,
} from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { randomBytes } from "node:crypto";
import { arch, platform, tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import https from "node:https";

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BIN_DIR = join(__dirname, "..", "bin");
const IS_WINDOWS = platform() === "win32";
const EXE = IS_WINDOWS ? ".exe" : "";

const TECTONIC_VERSION = process.env.TECTONIC_VERSION || "0.17.0";
const PANDOC_VERSION = process.env.PANDOC_VERSION || "3.11";

const log = (...args) => console.log(`[install-binaries]`, ...args);
const warn = (...args) => console.warn(`[install-binaries]`, ...args);

async function fileExists(path) {
    try {
        await access(path, constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

// Download a URL (following redirects) to a local file using Node's https module.
function downloadToFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const follow = (currentUrl, redirects) => {
            if (redirects > 5) {
                return reject(new Error(`Too many redirects while downloading ${currentUrl}`));
            }

            let parsed;
            try {
                parsed = new URL(currentUrl);
            } catch {
                return reject(new Error(`Invalid download URL: ${currentUrl}`));
            }

            const req = https.request(
                {
                    hostname: parsed.hostname,
                    port: parsed.port || 443,
                    path: parsed.pathname + parsed.search,
                    method: "GET",
                    headers: { "User-Agent": "resume-generator/1.0" },
                },
                (res) => {
                    if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
                        res.resume();
                        return follow(new URL(res.headers.location, currentUrl).toString(), redirects + 1);
                    }
                    if (res.statusCode !== 200) {
                        res.resume();
                        return reject(
                            new Error(`Download failed with HTTP ${res.statusCode}: ${currentUrl}`)
                        );
                    }
                    pipeline(res, createWriteStream(destPath))
                        .then(() => resolve())
                        .catch(reject);
                }
            );
            req.on("error", reject);
            req.end();
        };
        follow(url, 0);
    });
}

// Extract either a .zip or .tar.gz archive using the system tar (bsdtar on
// Windows/macOS, GNU tar on Linux - both handle the formats we need).
async function extractArchive(archivePath, destDir) {
    await execFileAsync("tar", ["-xf", archivePath, "-C", destDir], { stdio: "pipe" });
}

// Recursively locate a binary by name inside an extracted archive.
async function findBinary(dir, targetName) {
    const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
            const found = await findBinary(full, targetName);
            if (found) return found;
        } else if (entry.name === targetName) {
            return full;
        }
    }
    return null;
}

async function installBinary({ name, url }) {
    const target = join(BIN_DIR, `${name}${EXE}`);

    if (process.env[`SKIP_${name.toUpperCase()}`] === "1") {
        warn(`Skipping ${name} download (SKIP_${name.toUpperCase()}=1).`);
        return target;
    }

    if (await fileExists(target)) {
        log(`${name} already installed (${target}).`);
        return target;
    }

    log(`Downloading ${name} (${url})...`);
    const tmp = await mkdtemp(join(tmpdir(), `rg-${name}-`));
    const archivePath = join(tmp, basename(url));
    try {
        await downloadToFile(url, archivePath);
        log(`Extracting ${name}...`);
        await extractArchive(archivePath, tmp);

        const found = await findBinary(tmp, `${name}${EXE}`);
        if (!found) {
            throw new Error(`Could not locate the ${name} binary inside the downloaded archive.`);
        }

        await copyFile(found, target);
        if (!IS_WINDOWS) {
            await chmod(target, 0o755);
        }
        log(`${name} installed to ${target}.`);
    } finally {
        await rm(tmp, { recursive: true, force: true });
    }
    return target;
}

function tectonicAsset() {
    const base = `https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic@${TECTONIC_VERSION}`;
    if (process.env.TECTONIC_URL) return { name: "tectonic", url: process.env.TECTONIC_URL };
    if (platform() === "win32") {
        return {
            name: "tectonic",
            url: `${base}/tectonic-${TECTONIC_VERSION}-x86_64-pc-windows-msvc.zip`,
        };
    }
    if (platform() === "darwin") {
        const target = arch() === "arm64" ? "aarch64-apple-darwin" : "x86_64-apple-darwin";
        return {
            name: "tectonic",
            url: `${base}/tectonic-${TECTONIC_VERSION}-${target}.tar.gz`,
        };
    }
    if (platform() === "linux") {
        const target =
            arch() === "arm64" ? "aarch64-unknown-linux-musl" : "x86_64-unknown-linux-musl";
        return {
            name: "tectonic",
            url: `${base}/tectonic-${TECTONIC_VERSION}-${target}.tar.gz`,
        };
    }
    throw new Error(`Unsupported platform for tectonic: ${platform()}`);
}

function pandocAsset() {
    const base = `https://github.com/jgm/pandoc/releases/download/${PANDOC_VERSION}`;
    if (process.env.PANDOC_URL) return { name: "pandoc", url: process.env.PANDOC_URL };
    if (platform() === "win32") {
        return {
            name: "pandoc",
            url: `${base}/pandoc-${PANDOC_VERSION}-windows-x86_64.zip`,
        };
    }
    if (platform() === "darwin") {
        const target = arch() === "arm64" ? "arm64" : "x86_64";
        return {
            name: "pandoc",
            url: `${base}/pandoc-${PANDOC_VERSION}-${target}-macOS.zip`,
        };
    }
    if (platform() === "linux") {
        const target = arch() === "arm64" ? "arm64" : "amd64";
        return {
            name: "pandoc",
            url: `${base}/pandoc-${PANDOC_VERSION}-linux-${target}.tar.gz`,
        };
    }
    throw new Error(`Unsupported platform for pandoc: ${platform()}`);
}

// Compile a trivial document so the tectonic LaTeX bundle is cached locally.
// This makes the first real resume the user generates fast. Best-effort only.
async function prewarmTectonic(tectonicBin) {
    if (process.env.TECTONIC_PREWARM === "0") {
        warn("Skipping tectonic bundle pre-warm (TECTONIC_PREWARM=0).");
        return;
    }
    const tmp = await mkdtemp(join(tmpdir(), "rg-prewarm-"));
    try {
        const tex = join(tmp, "prewarm.tex");
        await writeFile(tex, "\\documentclass{article}\n\\begin{document}\nprewarm\n\\end{document}\n");
        await execFileAsync(tectonicBin, ["-X", "compile", tex, "--outdir", tmp], {
            timeout: 600000,
        });
        log("Tectonic LaTeX bundle pre-warmed (first compile will be instant).");
    } catch (err) {
        warn(`Tectonic bundle pre-warm failed (non-fatal): ${err.message}`);
    } finally {
        await rm(tmp, { recursive: true, force: true });
    }
}

async function main() {
    if (process.env.RESUME_GEN_SKIP_BINARIES === "1") {
        warn("Skipping binary downloads (RESUME_GEN_SKIP_BINARIES=1).");
        return;
    }
    if (IS_WINDOWS) {
        try {
            await execFileAsync("tar", ["--version"], { stdio: "pipe" });
        } catch {
            throw new Error(
                "The system 'tar' command is required to extract the downloaded tools. " +
                    "Please install Windows tar (available on Windows 10 build 17063+) and re-run npm install."
            );
        }
    }

    await mkdir(BIN_DIR, { recursive: true });

    const tectonicBin = await installBinary(tectonicAsset());
    await installBinary(pandocAsset());
    await prewarmTectonic(tectonicBin);

    log(`All LaTeX toolchain binaries are ready in ${BIN_DIR}.`);
}

main().catch((err) => {
    console.error(`[install-binaries] ERROR: ${err.message}`);
    process.exit(1);
});