// postcss.config.js or postcss.config.mjs
module.exports = {
content: ['./src/**/*.{js,ts,jsx,tsx}'], // all files to scan for class names
  plugins: {
    "@tailwindcss/postcss": {}
    // optionally other PostCSS plugins if needed
  }
};