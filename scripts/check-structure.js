const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const requiredFiles = ["index.html", "style.css", "script.js", "package.json", "playwright.config.js"];
const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));

if (missing.length > 0) throw new Error(`Missing required files: ${missing.join(", ")}`);

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
for (const asset of ["style.css", "script.js"]) {
  if (!html.includes(`"${asset}"`)) throw new Error(`index.html does not reference ${asset}`);
}

const testDir = path.join(root, "tests", "e2e");
if (!fs.existsSync(testDir) || !fs.statSync(testDir).isDirectory()) throw new Error("tests/e2e must be a directory");
const testFiles = fs.readdirSync(testDir).filter((file) => file.endsWith(".spec.js"));
if (testFiles.length === 0) throw new Error("No Playwright test files found in tests/e2e");

console.log(`Structure check passed (${testFiles.length} E2E file${testFiles.length === 1 ? "" : "s"}).`);
