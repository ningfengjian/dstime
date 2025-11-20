const fs = require("fs");
const path = require("path");

const selectPath = path.join(
  __dirname,
  "..",
  "node_modules",
  "@radix-ui",
  "react-select",
  "dist",
  "index.mjs"
);

if (!fs.existsSync(selectPath)) {
  console.warn("@radix-ui/react-select not found; skipping patch.");
  process.exit(0);
}

const originalSnippet = "setTimeout(() => nextItem.ref.current.focus());";
const patchedSnippet = "setTimeout(() => nextItem.ref.current?.focus());";

const fileContents = fs.readFileSync(selectPath, "utf8");

if (fileContents.includes(patchedSnippet)) {
  console.log("@radix-ui/react-select already patched.");
  process.exit(0);
}

if (!fileContents.includes(originalSnippet)) {
  console.warn("Expected snippet not found; no changes applied.");
  process.exit(0);
}

const updatedContents = fileContents.replace(originalSnippet, patchedSnippet);
fs.writeFileSync(selectPath, updatedContents);
console.log("Applied @radix-ui/react-select focus safety patch.");
