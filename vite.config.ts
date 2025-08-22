import { resolve } from 'path';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import { attrStylerVitePlugin } from './src/plugin';

export default defineConfig(() => {
  return {
    build: {
      outDir: 'build',
      lib: {
        entry: resolve(__dirname, 'src/index.js'),
        name: 'attr-styler',
        fileName: 'attr-styler',
      },
      rollupOptions: {
        external: ['node:fs'],
      },
    },
    plugins: [
      attrStylerVitePlugin({ fileExtToAnalize: ['.styler.ts', '.css', '.scss'] }),
      eslint({
        emitWarning: false,
        failOnError: true,
      }),
    ],
  };
});
