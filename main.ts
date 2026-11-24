import { mkdirSync as mk, readdirSync as rd, readFileSync as rf, writeFileSync as wf } from 'node:fs';
import { join as j } from 'node:path';
function run(p, q) {
const s = new Int32Array(256), c = new Int32Array(64), m = new Int32Array(256), o = new Uint8Array(65536);
let sp = 0, cp = 0, pc = 0, ip = 0, ol = 0, steps = 0;
const done = (code) => [o.slice(0, ol), code];
for (;;) {
if (steps === 1000000) return done(10);
if (pc < 0 || pc >= p.length) return done(9);
const op = p[pc];
let imm = 0, need = 0, give = 0;
switch (op) {
case 0x00: break;
case 0x01: imm = 1; give = 1; break;
case 0x02: imm = 4; give = 1; break;
case 0x03: need = 1; break;
case 0x04: need = 1; give = 2; break;
case 0x05: need = 2; give = 2; break;
case 0x06: need = 2; give = 3; break;
case 0x07: need = 3; give = 3; break;
case 0x10: case 0x11: case 0x12: case 0x13: case 0x14: case 0x15: case 0x16: case 0x18: case 0x19: case 0x1a: case 0x1c: case 0x1d: case 0x1e: case 0x20: case 0x21: case 0x22: need = 2; give = 1; break;
case 0x17: case 0x1b: need = 1; give = 1; break;
case 0x30: imm = 2; break;
case 0x31: case 0x32: imm = 2; need = 1; break;
case 0x33: imm = 2; break;
case 0x34: break;
case 0x40: need = 1; give = 1; break;
case 0x41: need = 2; break;
case 0x50: case 0x51: case 0x53: need = 1; break;
case 0x52: give = 1; break;
default: return done(5);
}
if (pc + imm >= p.length) return done(9);
steps++;
if (sp < need) return done(2);
if (sp - need + give > 256) return done(3);
const nx = pc + 1 + imm; pc = nx;
switch (op) {
case 0x00: return done(0);
case 0x01: s[sp++] = (p[nx - 1] << 24) >> 24; break;
case 0x02: s[sp++] = p[nx - 4] | (p[nx - 3] << 8) | (p[nx - 2] << 16) | (p[nx - 1] << 24); break;
case 0x03: sp--; break;
case 0x04: s[sp] = s[sp - 1]; sp++; break;
case 0x05: { const t = s[sp - 1]; s[sp - 1] = s[sp - 2]; s[sp - 2] = t; break; }
case 0x06: s[sp] = s[sp - 2]; sp++; break;
case 0x07: { const t = s[sp - 3]; s[sp - 3] = s[sp - 2]; s[sp - 2] = s[sp - 1]; s[sp - 1] = t; break; }
case 0x17: s[sp - 1] = -s[sp - 1] | 0; break;
case 0x1b: s[sp - 1] = ~s[sp - 1]; break;
case 0x10: case 0x11: case 0x12: case 0x13: case 0x14: case 0x15: case 0x16: case 0x18: case 0x19: case 0x1a: case 0x1c: case 0x1d: case 0x1e: case 0x20: case 0x21: case 0x22: {
const b = s[sp - 1], a = s[sp - 2]; let r;
if (op === 0x10) r = (a + b) | 0;
else if (op === 0x11) r = (a - b) | 0;
else if (op === 0x12) r = Math.imul(a, b);
else if (op === 0x13) { if (b === 0) return done(4); r = (a === -2147483648 && b === -1) ? a : (a / b) | 0; }
else if (op === 0x14) { if (b === 0) return done(4); r = b === -1 ? 0 : (a % b) | 0; }
else if (op === 0x15) { if (b === 0) return done(4); r = Math.floor((a >>> 0) / (b >>> 0)) | 0; }
else if (op === 0x16) { if (b === 0) return done(4); r = ((a >>> 0) % (b >>> 0)) | 0; }
else if (op === 0x18) r = a & b;
else if (op === 0x19) r = a | b;
else if (op === 0x1a) r = a ^ b;
else if (op === 0x1c) r = a << (b & 31);
else if (op === 0x1d) r = a >> (b & 31);
else if (op === 0x1e) r = (a >>> (b & 31)) | 0;
else if (op === 0x20) r = a === b ? 1 : 0;
else if (op === 0x21) r = a < b ? 1 : 0;
else r = (a >>> 0) < (b >>> 0) ? 1 : 0;
sp -= 2; s[sp++] = r; break; }
case 0x30: case 0x31: case 0x32: {
const rel = ((p[nx - 2] | (p[nx - 1] << 8)) << 16) >> 16; let take = true;
if (op !== 0x30) { const v = s[--sp]; take = op === 0x31 ? v === 0 : v !== 0; }
if (take) pc = nx + rel; break; }
case 0x33: if (cp === 64) return done(7); c[cp++] = nx; pc = p[nx - 2] | (p[nx - 1] << 8); break;
case 0x34: if (cp === 0) return done(8); pc = c[--cp]; break;
case 0x40: { const a = s[sp - 1]; if (a < 0 || a >= 256) return done(6); s[sp - 1] = m[a]; break; }
case 0x41: { const a = s[sp - 1], v = s[sp - 2]; if (a < 0 || a >= 256) return done(6); sp -= 2; m[a] = v; break; }
case 0x50: { const t = String(s[sp - 1]); if (ol + t.length > 65536) return done(11); sp--; for (let i = 0; i < t.length; i++) o[ol++] = t.charCodeAt(i); break; }
case 0x51: if (ol + 1 > 65536) return done(11); o[ol++] = s[--sp] & 255; break;
case 0x52: s[sp++] = ip < q.length ? q[ip++] : -1; break;
case 0x53: return done(s[--sp] & 255);
}
}
}
const I = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
for (const id of rd(I).sort()) {
const [out, code] = run(new Uint8Array(rf(j(I, id, 'program.bin'))), new Uint8Array(rf(j(I, id, 'input.bin'))));
mk(j(O, id), { recursive: true });
wf(j(O, id, 'stdout.bin'), out);
wf(j(O, id, 'exit.txt'), `${code}\n`);
}
