import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { buildInfoPlugin } from './vite.build-info.js';

/** Drop playground / catalog assets if they still exist in public/. */
function pruneDistPlugin() {
  return {
    name: 'prune-dist-extras',
    closeBundle() {
      const dist = path.resolve('dist');
      for (const rel of ['fonts2', 'fonts/fonts2-catalog.css', 'fonts/fonts.css']) {
        const target = path.join(dist, rel);
        if (fs.existsSync(target)) {
          fs.rmSync(target, { recursive: true, force: true });
          console.log(`pruned dist/${rel}`);
        }
      }
    },
  };
}

const appBase = process.env.APP_BASE || '/text-effects/';

export default defineConfig({
  base: appBase,
  plugins: [react(), buildInfoPlugin(), pruneDistPlugin()],
  server: { port: 5173, open: true },
});
