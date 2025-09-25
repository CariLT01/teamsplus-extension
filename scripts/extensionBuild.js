const childProcess = require("child_process");
const fs = require('fs');
const archiver = require('archiver');

const pkg = JSON.parse(fs.readFileSync('package.json'));

// Optional command-line argument for version
// Usage: node buildZip.js 1.2.3
const versionArg = process.argv[2] || pkg.version;

childProcess.execSync("node scripts/updateManifestJSON");

const output = fs.createWriteStream(`teamsPlus versions/teams_plus@${versionArg}.zip`);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => console.log(`Created zip: teams_plus@${versionArg}.zip`));

archive.pipe(output);
archive.directory('teams_plus/', false); // replace with your folder
archive.finalize();
