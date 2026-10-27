import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const patterns = [
  ["provider credential", /\b(?:sb_secret_|sbp_|ghp_|github_pat_|sk-proj-|sk-ant-api\d+-|sk_live_|re_)[A-Za-z0-9_-]{20,}/g],
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g],
  ["cloud access key", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g],
  ["Google API credential", /\bAIza[A-Za-z0-9_-]{35}\b/g],
  ["Slack credential", /\bxox[baprs]-[A-Za-z0-9-]{20,}/g],
  ["credential-bearing database URL", /\bpostgres(?:ql)?:\/\/[^\s:@/]+:[^\s@/]{8,}@[^\s/]+/g],
];

export function findSecrets(text) {
  const findings = [];
  for (const [category, pattern] of patterns) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      findings.push({ category, line: text.slice(0, match.index).split("\n").length });
    }
  }
  for (const match of text.matchAll(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g)) {
    try {
      const payload = JSON.parse(Buffer.from(match[0].split(".")[1], "base64url").toString());
      if (payload.role === "service_role") findings.push({ category: "service-role JWT", line: text.slice(0, match.index).split("\n").length });
    } catch { /* Not a JWT. */ }
  }
  return findings;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const git = (args) => execFileSync("git", args, { maxBuffer: 32 * 1024 * 1024 });
  const findings = [];
  let scanned = 0;
  const files = git(["ls-files", "--cached", "--others", "--exclude-standard", "-z"]).toString().split("\0").filter(Boolean);
  for (const file of files) {
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) continue;
    const buffer = fs.readFileSync(file);
    if (buffer.includes(0)) continue;
    scanned++;
    findings.push(...findSecrets(buffer.toString("utf8")).map((finding) => ({ file, ...finding })));
  }
  if (process.argv.includes("--history")) {
    for (const line of git(["rev-list", "--objects", "--all"]).toString().split("\n")) {
      const space = line.indexOf(" ");
      if (space < 0) continue;
      const oid = line.slice(0, space), file = line.slice(space + 1);
      if (git(["cat-file", "-t", oid]).toString().trim() !== "blob") continue;
      const buffer = git(["cat-file", "blob", oid]);
      if (buffer.includes(0)) continue;
      scanned++;
      findings.push(...findSecrets(buffer.toString("utf8")).map((finding) => ({ file, object: oid, ...finding })));
    }
  }
  // Report locations/categories only. Never print a matched credential.
  console.log(JSON.stringify({ scannedTextFilesAndHistoryBlobs: scanned, findings, scope: "high-signal patterns; not proof that every possible credential is absent" }, null, 2));
  if (findings.length) process.exitCode = 1;
}
