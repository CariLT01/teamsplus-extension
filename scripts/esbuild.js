const { build } = require('esbuild');

build({
  entryPoints: ['src/main.ts'],
  outfile: 'test_extension/main.bundle.js',
  bundle: true,
  minify: true,
  sourcemap: true,
  platform: 'browser', // or 'node' for Node.js apps
  target: ['es2020'], // Transpile to specific JS version
}).catch(() => process.exit(1));

build({
    entryPoints: ['src/popup/popup.js'],
    outfile: 'test_extension/popup.bundle.js',
    bundle: true,
    minify: true,
    sourcemap: true,
    platform: 'browser', // or 'node' for Node.js apps
    target: ['es2020'], // Transpile to specific JS version
  }).catch(() => process.exit(1));