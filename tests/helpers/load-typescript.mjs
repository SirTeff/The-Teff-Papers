import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";

const root = process.cwd();
const require = createRequire(path.join(root, "package.json"));

// Exercise the real server modules without credentials, Next request storage,
// network access or server-only's deliberate non-React import exception.
export function loadTypeScript(relativePath, { mocks = {}, environment = {}, globals = {} } = {}) {
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const loaded = { exports: {} };
    cache.set(filename, loaded);
    const localRequire = (name) => {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      if (name === "server-only") return {};
      if (!name.startsWith(".") && !name.startsWith("@/")) return require(name);
      const base = name.startsWith("@/")
        ? path.join(root, "src", name.slice(2))
        : path.resolve(path.dirname(filename), name);
      const target = [base, `${base}.ts`, `${base}.tsx`].find((file) => fs.existsSync(file) && fs.statSync(file).isFile());
      if (!target) throw new Error(`Unresolved test import: ${name}`);
      return load(target);
    };
    const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      fileName: filename,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    });
    const context = {
      module: loaded, exports: loaded.exports, require: localRequire,
      process: { env: { ...environment } }, console,
      URL, URLSearchParams, Request, Response, Headers, FormData,
      TextDecoder, TextEncoder, ReadableStream, AbortController,
      setTimeout, clearTimeout, Buffer, ...globals,
    };
    vm.runInNewContext(outputText, context, { filename });
    return loaded.exports;
  }
  return load(path.resolve(root, relativePath));
}
