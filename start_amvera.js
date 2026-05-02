const { spawnSync } = require("node:child_process");

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (process.env.SKIP_NPM_INSTALL !== "1") {
  run("npm", ["ci"]);
}

run("npm", ["run", "build"]);

const port = process.env.PORT || "3000";
run("npm", ["run", "start", "--", "--hostname", "0.0.0.0", "--port", port]);
