var isCoverage = process.env.NODE_ENV === 'coverage';

module.exports = {
    mode: 'production',
    target: 'node',
    output: {
        libraryTarget: 'umd',
        libraryExport: 'default',
        umdNamedDefine: true,
        globalObject: `(typeof self !== 'undefined' ? self : this)`
    },
    module: {
        noParse: (content) => /gdalWebAssembly/.test(content),
        rules: [
            isCoverage ? {
                test: /\.(js|ts)/,
                loader: 'coverage-istanbul-loader',
                options: { esModules: true }
            }: {},
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
};
