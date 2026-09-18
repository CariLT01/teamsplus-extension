const fs = require("fs");
const CleanCSS = require("clean-css");

// Input and output file paths
const inputFile = "teams_plus/popup.bundle.css";      // the CSS file you want to minify
const outputFile = "teams_plus/popup.bundle.css"; // minified output

// Read the CSS file
fs.readFile(inputFile, "utf8", (err, data) => {
    if (err) {
        console.error("Error reading file:", err);
        return;
    }

    // Minify the CSS
    const output = new CleanCSS({}).minify(data);

    if (output.errors.length) {
        console.error("Minify errors:", output.errors);
        return;
    }

    // Write the minified CSS to a new file
    fs.writeFile(outputFile, output.styles, (err) => {
        if (err) {
            console.error("Error writing file:", err);
            return;
        }
        console.log(`CSS minified successfully! Saved to ${outputFile}`);
    });
});