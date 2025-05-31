// update-manifest-version.js
const fs = require('fs');

const pkg = JSON.parse(fs.readFileSync('package.json'));
const manifestPath = 'teams_plus\\manifest.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath));

manifest.version = pkg.version;

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Updated manifest.json to version ${pkg.version}`);