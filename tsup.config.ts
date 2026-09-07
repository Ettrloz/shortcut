import { defineConfig } from 'tsup';

export default defineConfig([
  {
    clean: true,
    entry: ['./src/**/*.ts'],
    format: 'cjs',
    outDir: 'dist/cjs',
    sourcemap: true
  },
  {
    clean: true,
    entry: ['./src/**/*.ts'],
    format: 'esm',
    outDir: 'dist/esm',
    sourcemap: true
  }
]);
