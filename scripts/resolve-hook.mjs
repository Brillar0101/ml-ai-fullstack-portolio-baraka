// Node needs file extensions; Vite does not, and the project follows Vite's
// convention. This hook lets the verification scripts import the real app
// modules unchanged, so they check the code that actually ships.
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (err) {
    if (!specifier.startsWith('.')) throw err;
    for (const ext of ['.js', '.jsx', '/index.js']) {
      try {
        const candidate = new URL(specifier + ext, context.parentURL);
        if (existsSync(fileURLToPath(candidate))) {
          return next(specifier + ext, context);
        }
      } catch { /* keep trying */ }
    }
    throw err;
  }
}
