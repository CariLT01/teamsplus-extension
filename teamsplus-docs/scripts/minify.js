import fs from "fs";
import { glob } from "glob";
import { minify as minifyHtml } from "html-minifier-terser";
import CleanCSS from "clean-css";
import { minify as minifyJs } from "terser";

async function processFiles() {
  // Minify HTML
  const htmlFiles = await glob("teams_plus/**/*.html");
  for (const file of htmlFiles) {
    const content = fs.readFileSync(file, "utf8");
    const result = await minifyHtml(content, {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: true,
        removeOptionalTags: true,
        collapseBooleanAttributes: true,
        minifyCSS: true,
        minifyJS: true,
        sortAttributes: true,
        sortClassName: true,
    });
    fs.writeFileSync(file, result, "utf8");
    console.log(`Minified HTML: ${file}`);
  }

  // Minify CSS
  const cssFiles = await glob("teams_plus/docs/assets/**/*.css");
  const cssMinifier = new CleanCSS({});
  for (const file of cssFiles) {
    const content = fs.readFileSync(file, "utf8");
    const result = cssMinifier.minify(content).styles;
    fs.writeFileSync(file, result, "utf8");
    console.log(`Minified CSS: ${file}`);
  }

  // Minify JS
  const jsFiles = await glob("teams_plus/docs/assets/**/*.js");
  for (const file of jsFiles) {
    const content = fs.readFileSync(file, "utf8");
    const result = await minifyJs(content, {
        compress: {
            drop_console: true, // Remove console.log
            drop_debugger: true,
            passes: 3,           // Multiple optimization passes
            pure_funcs: ["assert"], // Remove functions you don’t need
        },
        mangle: true,           // Shorten variable/function names
        module: true,
    });
    fs.writeFileSync(file, result.code, "utf8");
    console.log(`Minified JS: ${file}`);
  }

  // Remove source map files
  const mapFiles = await glob("teams_plus/docs/assets/**/*.map");
  for (const file of mapFiles) {
    fs.unlinkSync(file);
    console.log(`Removed map file: ${file}`);
  }
}

processFiles();
