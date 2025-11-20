const fs = require("fs");
const path = require("path");

const targetFiles = ["index.mjs", "index.js"].map((filename) =>
  path.join(
    __dirname,
    "..",
    "node_modules",
    "@radix-ui",
    "react-select",
    "dist",
    filename
  )
);

const existingTargets = targetFiles.filter((filePath) => fs.existsSync(filePath));

if (!existingTargets.length) {
  console.warn("@radix-ui/react-select not found; skipping patch.");
  process.exit(0);
}

const originalSnippet = "setTimeout(() => nextItem.ref.current.focus());";
const patchedSnippet = "setTimeout(() => nextItem.ref.current?.focus());";

let patchedCount = 0;

for (const filePath of existingTargets) {
  const fileContents = fs.readFileSync(filePath, "utf8");

  if (fileContents.includes(patchedSnippet)) {
    console.log(`${path.basename(filePath)} already patched.`);
    continue;
  }

  if (!fileContents.includes(originalSnippet)) {
    console.warn(
      `${path.basename(filePath)} did not contain expected snippet; skipping.`
    );
    continue;
  }

  const updatedContents = fileContents.replace(originalSnippet, patchedSnippet);
  fs.writeFileSync(filePath, updatedContents);
  patchedCount += 1;
  console.log(`Patched ${path.basename(filePath)} for focus safety.`);
}

if (patchedCount === 0) {
  console.warn("No @radix-ui/react-select files were patched.");
}
