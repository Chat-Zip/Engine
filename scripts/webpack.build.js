const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './src/index.ts',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, '../dist'),
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },
    resolve: {
        extensions: [
            '.ts', '.js',
        ],
    },
    module: {
        rules: [
            {
                test: /\.ts$/, use: 'ts-loader',
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "@babel/env",
                            "@babel/preset-typescript",
                        ],
                        plugins: [
                            "@babel/plugin-proposal-optional-chaining",
                            "@babel/plugin-proposal-class-properties",
                            ["@babel/plugin-proposal-decorators", {
                                "decoratorsBeforeExport": true,
                            }],
                        ],
                    },
                },
            },
            {
                test: /\.(png|svg|jpg|gif|zip)$/,
                type: "asset/resource",
                generator: {
                    filename: "asset/[hash][ext]",
                }
                /*
                use: {
                    loader: "file-loader",
                    options: {
                        outputPath: "images",
                    }
                }
                */
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
    ]
}