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
  process.env.npm_config_cache = process.env.npm_config_cache || "/tmp/.npm";
  run("npm", ["ci"]);
}

const resolvedNextBin = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
if (!fs.existsSync(resolvedNextBin)) {
  console.error("next binary is still missing after npm ci.");
  process.exit(1);
}

const buildIdPath = path.join(process.cwd(), ".next", "BUILD_ID");
if (!fs.existsSync(buildIdPath)) {
  run("node", [resolvedNextBin, "build"]);
}

const port = process.env.PORT || "3000";
run("node", [resolvedNextBin, "start", "--hostname", "0.0.0.0", "--port", port]);
