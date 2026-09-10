/**
 * Tiny build step for a static site: substitutes environment variables
 * into config.template.js and writes config.js.
 *
 * Run automatically via `npm run build` during deployment (Vercel/Netlify).
 * Requires CALENDLY_URL to be set as an environment variable in the
 * hosting provider's dashboard — never committed to source control.
 */
const fs = require("fs");
const path = require("path");

/**
 * Minimal .env loader (no dependency needed). Only used for local
 * development — Vercel/Netlify inject environment variables directly,
 * so this is a no-op in production and never overrides a variable
 * that's already set in the environment.
 */
function loadDotEnv(envPath) {
  if (!fs.existsSync(envPath)) return;
  var lines = fs.readFileSync(envPath, "utf8").split("\n");
  lines.forEach(function (line) {
    var trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    var eq = trimmed.indexOf("=");
    if (eq === -1) return;
    var key = trimmed.slice(0, eq).trim();
    var value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  });
}

loadDotEnv(path.join(__dirname, ".env"));

const CALENDLY_URL = process.env.CALENDLY_URL;

if (!CALENDLY_URL) {
  console.error(
    "\n[build] Missing required environment variable: CALENDLY_URL\n" +
    "Set it in your hosting provider's environment variables settings\n" +
    "(e.g. Vercel/Netlify project settings > Environment Variables).\n"
  );
  process.exit(1);
}

const templatePath = path.join(__dirname, "config.template.js");
const outputPath = path.join(__dirname, "config.js");

const template = fs.readFileSync(templatePath, "utf8");
const output = template.replace("__CALENDLY_URL__", CALENDLY_URL);

fs.writeFileSync(outputPath, output, "utf8");
console.log("[build] Wrote config.js from environment variables.");
