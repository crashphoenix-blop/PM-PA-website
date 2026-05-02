const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const nextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
if (!fs.existsSync(nextBin)) {
  console.error("next binary not found in node_modules. Ensure dependencies are installed during build stage.");
  process.exit(1);
}

run("node", [nextBin, "build"]);

const port = process.env.PORT || "3000";
run("node", [nextBin, "start", "--hostname", "0.0.0.0", "--port", port]);
