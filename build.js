const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

function readBaseManifest() {
  return JSON.parse(fs.readFileSync("manifest.json", "utf8"));
}

function writeManifest(manifest, browser) {
  const outputPath = path.join("dist", browser, "manifest.json");
  fs.mkdirSync(path.join("dist", browser), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
  console.log(`${browser} manifest created at: ${outputPath}`);
}

function createZip(browser, version) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(
      `dist/${browser}-extension-v${version}.zip`
    );
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      console.log(
        `${browser} extension v${version} has been zipped successfully`
      );
      resolve();
    });

    archive.on("error", (err) => {
      reject(err);
    });

    archive.pipe(output);

    archive.file("README.md", { name: "README.md" });
    archive.file("styles.css", { name: "styles.css" });
    archive.file(`dist/${browser}/manifest.json`, { name: "manifest.json" });
    archive.file("main.js", { name: "main.js" });
    archive.directory("assets", "assets");

    archive.finalize();
  });
}

function buildChrome(baseManifest) {
  const chromeManifest = { ...baseManifest };
  // Chrome-specific modifications can be added here

  writeManifest(chromeManifest, "chrome");
  return createZip("chrome", chromeManifest.version);
}

function buildFirefox(baseManifest) {
  const firefoxManifest = { ...baseManifest };
  firefoxManifest.browser_specific_settings = {
    gecko: {
      id: "silencio-x@adidoes",
      strict_min_version: "42.0",
    },
  };
  writeManifest(firefoxManifest, "firefox");
  return createZip("firefox", firefoxManifest.version);
}

async function build() {
  const baseManifest = readBaseManifest();
  await buildChrome(baseManifest);
  await buildFirefox(baseManifest);
  console.log("Build process completed successfully");
}

build().catch((error) => {
  console.error("An error occurred during the build process:", error);
});
