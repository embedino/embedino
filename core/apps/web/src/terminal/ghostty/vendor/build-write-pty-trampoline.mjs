// Regenerates ./ghostty-write-pty.wasm — the tiny PTY callback trampoline
// vendored alongside ghostty-vt.wasm.
//
// The module exports `ghostty_write_pty(a, b, c, d)` which forwards to the
// host-supplied `env.embedino_write_pty` import (the shared callback table
// entry wired up by src/terminal/ghostty/runtime.ts). The binary format is
// emitted here so the artifact stays reproducible without a WASM toolchain;
// run `node build-write-pty-trampoline.mjs` in this directory to rewrite it.
import * as NodeFS from "node:fs";
import * as NodeURL from "node:url";
import * as NodePath from "node:path";

const HOST_MODULE = "env";
const HOST_IMPORT = "embedino_write_pty";
const TRAMPOLINE_EXPORT = "ghostty_write_pty";

/** Unsigned LEB128. */
function uleb(value) {
  const out = [];
  let v = value;
  do {
    let byte = v & 0x7f;
    v >>>= 7;
    if (v !== 0) byte |= 0x80;
    out.push(byte);
  } while (v !== 0);
  return out;
}

function section(id, payload) {
  return [id, ...uleb(payload.length), ...payload];
}

function name(value) {
  return [...uleb(value.length), ...Buffer.from(value, "utf8")];
}

function vec(items) {
  return [...uleb(items.length), ...items.flat()];
}

// --- type section: type[0] = (i32, i32, i32, i32) -> () --------------------
const typeSection = section(0x01, vec([[0x60, ...vec([0x7f, 0x7f, 0x7f, 0x7f]), 0x00]]));

// --- import section: env.embedino_write_pty : type[0] ----------------------
const importSection = section(
  0x02,
  vec([
    [
      ...name(HOST_MODULE),
      ...name(HOST_IMPORT),
      0x00, // func import
      0x00, // type index 0
    ],
  ]),
);

// --- function section: function[1] : type[0] --------------------------------
const functionSection = section(0x03, vec([[0x00]]));

// --- memory section: 16 pages, enough for the callback scratch stack --------
const memorySection = section(0x05, vec([[0x00, 0x10]]));

// --- global section: mutable i32 stack pointer initialized to 1 MiB ---------
const globalSection = section(0x06, vec([[0x7f, 0x01, 0x41, ...uleb(0x100000), 0x0b]]));

// --- export section: memory + the trampoline --------------------------------
const exportSection = section(
  0x07,
  vec([
    [...name("memory"), 0x02, 0x00], // memory 0
    [...name(TRAMPOLINE_EXPORT), 0x00, 0x01], // function 1
  ]),
);

// --- code section: forward all four args to the host import -----------------
const codeBody = [
  0x00, // no locals
  0x20,
  0x00, // local.get 0
  0x20,
  0x01, // local.get 1
  0x20,
  0x02, // local.get 2
  0x20,
  0x03, // local.get 3
  0x10,
  ...uleb(0), // call env.embedino_write_pty
  0x0b, // end
];
const codeSection = section(0x0a, vec([[...uleb(codeBody.length), ...codeBody]]));

const wasm = Buffer.from([
  0x00,
  0x61,
  0x73,
  0x6d, // \0asm
  0x01,
  0x00,
  0x00,
  0x00, // version 1
  ...typeSection,
  ...importSection,
  ...functionSection,
  ...memorySection,
  ...globalSection,
  ...exportSection,
  ...codeSection,
]);

const here = NodePath.dirname(NodeURL.fileURLToPath(import.meta.url));
const target = NodePath.join(here, "ghostty-write-pty.wasm");
NodeFS.writeFileSync(target, wasm);
console.log(`wrote ${target} (${wasm.length} bytes)`);
