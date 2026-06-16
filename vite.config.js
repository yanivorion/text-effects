import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

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

export default defineConfig({
  base: '/text-effects/',
  plugins: [react(), pruneDistPlugin()],
  server: { port: 5173, open: true },
});
