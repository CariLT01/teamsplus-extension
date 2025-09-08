import { execSync } from "child_process";
import fs from "fs";

try {

    try {
        fs.rmSync("teams_plus/docs", { recursive: true, force: true });
    } catch (err) {

    }


  console.log("➡️  Changing into docs folder...");
  process.chdir("teamsplus-docs/");

  console.log("📦 Building MkDocs site...");
  execSync("py -m mkdocs build", { stdio: "inherit" });

  console.log("✨ Minifying site...");
  execSync("node scripts/minify", { stdio: "inherit" });

  console.log("⬅️  Going back to project root...");
  process.chdir("..");

  console.log("🗑️  Removing old docs folder...");
  fs.rmSync("teams_plus/docs", { recursive: true, force: true });

  console.log("📂 Copying new site build...");
  fs.cpSync("teamsplus-docs/teams_plus/docs", "teams_plus/docs", {
    recursive: true,
    force: true,
  });

  console.log("✏️  Renaming site → docs...");
  //fs.renameSync("teams_plus/site", "teams_plus/docs");

  console.log("🧹 Cleaning up build folder...");
  fs.rmSync("teamsplus-docs/teams_plus", { recursive: true, force: true });

  console.log("✅ Done! Docs built, minified, and copied.");
} catch (err) {
  console.error("❌ Error:", err.message);
  process.exit(1);
}
