import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import virtual from '@rollup/plugin-virtual';
import istanbul from 'rollup-plugin-istanbul';
import { uglify } from "rollup-plugin-uglify";

const nodeLibs = {
    fs: `export default {};`,
    path: `export default {};`,
    string_decoder: `export default {};`,
    buffer: `export default {};`,
    crypto: `export default {};`,
    stream: `export default {};`
};

export default [
    {
        plugins: [virtual(nodeLibs), nodeResolve(), commonjs({transformMixedEsModules: true, ignoreTryCatch: 'remove'}), babel({ babelHelpers: 'bundled' }), uglify()],
        input: 'src/index.js',
        output: {
            file: 'build/package/gdal3.js',
            format: 'umd',
            name: 'initGdalJs',
        }
    },
    {
        plugins: [nodeResolve(), commonjs(), babel({ babelHelpers: 'bundled' }), uglify()],
        input: 'src/index.js',
        output: {
            file: 'build/package/gdal3.node.js',
            format: 'umd',
            name: 'initGdalJs',
        }
    },
    {
        plugins: [nodeResolve(), commonjs()],
        input: 'src/index.js',
        output: {
            file: 'build/package/gdal3.dev.js',
            format: 'umd',
            name: 'initGdalJs',
            sourcemap: 'inline',
        }
    },
    {
        plugins: [
            nodeResolve(),
            commonjs(),
            istanbul({
                exclude: ['src/**/*.spec.js']
            })
        ],
        input: 'src/index.js',
        output: {
            file: 'build/package/gdal3.coverage.js',
            format: 'umd',
            name: 'initGdalJs',
        }
    },
];
