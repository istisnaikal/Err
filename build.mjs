// Copies src/ to dist/ and writes a strict CSP whose hashes match the inline <script>/<style>.
import { readFileSync, writeFileSync, mkdirSync, cpSync } from "node:fs";
import { createHash } from "node:crypto";
const html = readFileSync("src/index.html", "utf8");
const h = (s) => `'sha256-${createHash("sha256").update(s, "utf8").digest("base64")}'`;
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => h(m[1]));
const styles = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => h(m[1]));
mkdirSync("dist", { recursive: true });
cpSync("src", "dist", { recursive: true });
const csp = [
  "default-src 'none'",
  `script-src ${scripts.join(" ")}`,
  `style-src ${styles.join(" ")}`,
  "img-src data:",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join("; ");
writeFileSync("dist/_headers", `/*
  Content-Security-Policy: ${csp}
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
  Cross-Origin-Opener-Policy: same-origin
  Strict-Transport-Security: max-age=31536000; includeSubDomains
`);
console.log("built dist/ —", scripts.length, "script hash,", styles.length, "style hash");

// Pages advanced mode: one tiny _worker.js serves everything (deployable through a single API call).
const hdrs = {
  "Content-Security-Policy": csp,
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};
const files = {
  "/": [html, "text/html; charset=utf-8"],
  "/robots.txt": [readFileSync("src/robots.txt", "utf8"), "text/plain; charset=utf-8"],
  "/sitemap.xml": [readFileSync("src/sitemap.xml", "utf8"), "application/xml; charset=utf-8"],
};
writeFileSync("dist/_worker.js", `const F=${JSON.stringify(files)},H=${JSON.stringify(hdrs)};
export default{async fetch(r){const u=new URL(r.url);let p=u.pathname;if(p==="/index.html")p="/";const f=F[p];
if(!f)return new Response("Not found",{status:404,headers:{...H,"content-type":"text/plain; charset=utf-8"}});
if(r.method!=="GET"&&r.method!=="HEAD")return new Response(null,{status:405,headers:{allow:"GET, HEAD"}});
return new Response(r.method==="HEAD"?null:f[0],{headers:{...H,"content-type":f[1],"cache-control":"public, max-age=600, must-revalidate"}})}};
`);
