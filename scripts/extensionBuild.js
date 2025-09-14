

const childProcess = require("child_process")
const fs = require('fs');
const archiver = require('archiver');

const pkg = JSON.parse(fs.readFileSync('package.json'));

childProcess.execSync("node scripts/updateManifestJSON");

const output = fs.createWriteStream(`teamsPlus versions/teams_plus@${pkg.version}.zip`);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => console.log(`Created zip: teams_plus@${pkg.version}.zip`));

archive.pipe(output);
archive.directory('teams_plus/', false); // replace with your folder
archive.finalize();