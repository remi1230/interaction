// build.js
const fs = require("fs");
const path = require("path");
const terser = require("terser");

const filesInOrder = [
  "js/calcul.js",
  "js/glob.js",
  "js/mouse.js",
  "js/avatar.js",
  "js/avatars.js",
  "js/canvas.js",
  "js/modifiers.js",
  "js/grids.js",
  "js/img.js",
  "js/ui.js",
  "js/save.js",
  "js/utils.js",
  "js/animation.js",
  "js/event.js",
  "js/tests.js"
];

(async () => {
  try {
    // concat en respectant l'ordre (avec séparateur sûr)
    const source = filesInOrder
      .map(f => fs.readFileSync(path.resolve(f), "utf8"))
      .join("\n;\n");

    // minification + source map inline
    const result = await terser.minify(source, {
        compress: true,
        mangle: true,
        sourceMap: {
            filename: "app.min.js", // nom "virtuel" du bundle
            url: "inline",           // map inline (data URI)
            includeSources: true     // <-- EMBARQUE le contenu des fichiers
    }
    });

    if (!fs.existsSync("dist")) fs.mkdirSync("dist", { recursive: true });
    fs.writeFileSync("dist/app.min.js", result.code, "utf8");

    console.log(`✅ Build OK → dist/app.min.js (${(result.code.length/1024).toFixed(1)} kB)`);
  } catch (err) {
    console.error("❌ Build error:", err);
    process.exit(1);
  }
})();