import { execSync } from 'node:child_process';

/** Vite plugin — embed git SHA + build time in the client bundle. */
export function buildInfoPlugin() {
  let sha = 'dev';
  let shortSha = 'dev';
  try {
    sha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    shortSha = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch {
    /* local without git */
  }

  const builtAt = new Date().toISOString();

  return {
    name: 'build-info',
    config() {
      return {
        define: {
          __BUILD_SHA__: JSON.stringify(sha),
          __BUILD_SHORT_SHA__: JSON.stringify(shortSha),
          __BUILD_TIME__: JSON.stringify(builtAt),
        },
      };
    },
  };
}
