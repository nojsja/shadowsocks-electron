const path = require('path');
const commonjs = require('@rollup/plugin-commonjs');
const alias = require('@rollup/plugin-alias');
const resolve = require('@rollup/plugin-node-resolve');
const typescript = require('rollup-plugin-typescript2');
const json = require('@rollup/plugin-json');
const copy = require('rollup-plugin-copy');

const pkg = require(path.resolve(__dirname, 'package.json'));

module.exports = {
  // 核心选项
  input: path.resolve(__dirname, './main/electron.ts'),     // 必须
  plugins: [
    commonjs(),
    alias({
      entries: [
        { find: '@', replacement: path.resolve(__dirname) },
        { find: '@common', replacement: path.resolve(__dirname, 'common') },
        { find: '@main', replacement: path.resolve(__dirname, 'main') },
        { find: '@renderer', replacement: path.resolve(__dirname, 'renderer') },
      ]
    }),
    typescript({
      cwd: path.resolve(__dirname, 'main'),
      tsconfig: 'tsconfig.json'
    }),
    json(),
    resolve({
      preferBuiltins: true
    }),
    copy({
      targets: [
        { src: 'main/test/', dest: 'public/' },
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