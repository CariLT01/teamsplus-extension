const fs = require('fs');
const path = require('path');
const htmlmin = require('html-minifier');

// Configuration
const DOCS_DIR = path.join(__dirname, 'teams_plus/docs');
const MINIFIER_OPTIONS = {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  minifyCSS: true,
  minifyJS: true,
  minifyURLs: true,
};

// Function to minify HTML content
function minifyHtml(content) {
  return htmlmin.minify(content, MINIFIER_OPTIONS);
}

// Function to process all HTML files in a directory recursively
function processDirectory(directory) {
  fs.readdir(directory, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${directory}:`, err);
      return;
    }

    files.forEach(file => {
      const fullPath = path.join(directory, file.name);

      if (file.isDirectory()) {
        processDirectory(fullPath);
      } else if (file.isFile() && path.extname(file.name).toLowerCase() === '.html') {
        processHtmlFile(fullPath);
      }
    });
  });
}

// Function to process a single HTML file
function processHtmlFile(filePath) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file ${filePath}:`, err);
      return;
    }

    try {
      const minified = minifyHtml(data);
      fs.writeFile(filePath, minified, 'utf8', (err) => {
        if (err) {
          console.error(`Error writing file ${filePath}:`, err);
        } else {
          console.log(`Minified: ${filePath}`);
        }
      });
    } catch (minifyErr) {
      console.error(`Error minifying file ${filePath}:`, minifyErr);
    }
  });
}

// Start the process
console.log('Starting HTML minification process...');
processDirectory(DOCS_DIR);