// Builds dist/dossier-check.js and dist/dossier-check.min.js from src/ and rules.json.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { transformSync } from 'esbuild';

const ui = readFileSync('src/ui.html', 'utf8');
const css = transformSync(ui.match(/<style>([\s\S]*?)<\/style>/)[1], { loader: 'css', minify: true }).code.trim();
const open = '<div id="bw-dc" data-dc-root>';
const start = ui.indexOf(open);
if (start < 0) throw new Error('root div not found in src/ui.html');
const inner = ui.slice(start + open.length, ui.lastIndexOf('</div>')).replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+</g, '><').trim();
const rules = JSON.parse(readFileSync('rules.json', 'utf8'));
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

let js = readFileSync('src/app.js', 'utf8');
const swap = (marker, value) => {
  if (!js.includes(marker)) throw new Error('marker missing: ' + marker);
  js = js.replace(marker, value);
};
swap("/*__RULES__*/null", JSON.stringify(rules));
swap("/*__CSS__*/''", JSON.stringify(css));
swap("/*__HTML__*/''", JSON.stringify(inner));
js = js.replace('/*! Briqwise dossier-check |', `/*! Briqwise dossier-check v${pkg.version} |`);

mkdirSync('dist', { recursive: true });
writeFileSync('dist/dossier-check.js', js);
const min = transformSync(js, { minify: true, legalComments: 'inline', target: 'es2015' }).code;
writeFileSync('dist/dossier-check.min.js', min);
console.log(`v${pkg.version}: dossier-check.js ${js.length.toLocaleString()} chars, min ${min.length.toLocaleString()} chars`);
