const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const ports = [3000, 3001, 3002, 3003];

function sleep(ms) {
  execSync(`ping 127.0.0.1 -n ${Math.ceil(ms / 500) + 1} > nul`, {
    stdio: "ignore",
    shell: true,
  });
}

function killPort(port) {
  try {
    if (process.platform === "win32") {
      const result = execSync(`netstat -ano | findstr :${port}`, {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "ignore"],
      });
      const pids = new Set();
      for (const line of result.split("\n")) {
        if (!line.includes("LISTENING")) continue;
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && /^\d+$/.test(pid) && pid !== "0") pids.add(pid);
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
          console.log(`Stopped process ${pid} on port ${port}`);
        } catch {
          // already stopped
        }
      }
      return;
    }

    execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, {
      shell: true,
      stdio: "ignore",
    });
  } catch {
    // no process on port
  }
}

function removeNextCache() {
  const nextDir = path.join(root, ".next");
  if (!fs.existsSync(nextDir)) return;

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    try {
      if (process.platform === "win32") {
        execSync(
          `powershell -NoProfile -Command "Remove-Item -LiteralPath '${nextDir.replace(/'/g, "''")}' -Recurse -Force -ErrorAction Stop"`,
          { stdio: "ignore" }
        );
      } else {
        fs.rmSync(nextDir, { recursive: true, force: true });
      }

      if (!fs.existsSync(nextDir)) {
        console.log("Removed .next cache");
        return;
      }
    } catch {
      if (attempt < 5) sleep(500);
    }
  }

  throw new Error("Failed to remove .next cache after multiple attempts");
}

for (const port of ports) {
  killPort(port);
}

sleep(1500);
removeNextCache();

console.log("Starting dev server on http://localhost:3000 ...");

const child = spawn("npx", ["next", "dev", "--turbopack"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 0));
