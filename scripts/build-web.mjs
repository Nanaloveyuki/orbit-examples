import { execFileSync } from 'node:child_process';
import { cp, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('../', import.meta.url));
process.chdir(root);
execFileSync('moon', ['-C', 'vibecraft/game', 'build', '--target', 'js', '--release', '--deny-warn'], { stdio: 'inherit' });
await mkdir('vibecraft/desktop/assets', { recursive: true });
await build({
  entryPoints: ['vibecraft/web/main.js'],
  bundle: true, minify: true, format: 'iife', target: 'es2022',
  outfile: 'vibecraft/desktop/assets/app.js',
  legalComments: 'linked',
});
for (const file of ['index.html', 'style.css']) {
  await cp(`vibecraft/web/${file}`, `vibecraft/desktop/assets/${file}`);
}
await cp('vibecraft/game/_build/js/release/build/cmd/main/main.js', 'vibecraft/desktop/assets/game.js');
await cp('vibecraft/licenses', 'vibecraft/desktop/assets/licenses', { recursive: true });
await cp('vibecraft/NOTICE.md', 'vibecraft/desktop/assets/NOTICE.md');
await cp('node_modules/three/LICENSE', 'vibecraft/desktop/assets/licenses/Three-MIT.txt');
await cp('node_modules/lucide/LICENSE', 'vibecraft/desktop/assets/licenses/Lucide-ISC.txt');
