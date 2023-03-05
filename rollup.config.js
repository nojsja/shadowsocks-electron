const path = require('path');
const commonjs = require('@rollup/plugin-commonjs');
const alias = require('@rollup/plugin-alias');
const resolve = require('@rollup/plugin-node-resolve');
const typescript = require('rollup-plugin-typescript2');
const json = require('@rollup/plugin-json');
const copy = require('rollup-plugin-copy');

const pkg = require(path.resolve(__dirname, 'package.json'));
delete pkg.dependencies['quick-lru'];

module.exports = {
  // 核心选项
  input: path.resolve(__dirname, './src/main/electron.ts'),     // 必须
  plugins: [
    commonjs(),
    alias({
      entries: [
        { find: '@', replacement: path.resolve(__dirname, './src') },
        { find: '@common', replacement: path.resolve(__dirname, './src/common') },
        { find: '@main', replacement: path.resolve(__dirname, './src/main') },
        { find: '@renderer', replacement: path.resolve(__dirname, './src/renderer') },
      ]
    }),
    typescript({
      cwd: path.resolve(__dirname, './src/main'),
      tsconfig: 'tsconfig.json'
    }),
    json(),
    resolve({
      preferBuiltins: true
    }),
    copy({
      targets: [
        { src: './src/main/test/', dest: 'public/' },
      ]
    })
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ],
  output: [
    {
      dir: path.resolve(__dirname, 'public/'),
      format: 'cjs',
      sourcemap: true,
    }
  ],
};