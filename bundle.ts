import * as esbuild from 'https://deno.land/x/esbuild@v0.21.2/mod.js';
import { denoPlugins } from 'https://deno.land/x/esbuild_deno_loader@0.9.0/mod.ts';

await esbuild.build({
  plugins: [...denoPlugins({
    configPath: await Deno.realPath('deno.json'),
  })],
  entryPoints: ['src/client/main.ts'],
  outdir: 'client/js/',
  bundle: true,
  platform: 'browser',
  format: 'esm',
  minify: true,
  sourcemap: 'linked',
  logLevel: 'info',
});

await esbuild.stop();
