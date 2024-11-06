const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

module.exports = {
    mode: 'development',
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
                    filename: "images/[hash][ext]",
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
    resolve: {
        extensions: [
            '.ts', '.js',
        ],
        fallback: {
            "./lib/conn-pool.js": false,
            "./lib/utp.cjs": false,
            "@silentbot1/nat-api": false,
            "bittorrent-dht": false,
            "crypto": false,
            "fs": false,
            "fs-chunk-store": "hybrid-chunk-store",
            "http": false,
            "load-ip-set": false,
            "net": false,
            "os": false,
            "ut_pex": false,
            "dgram": false,
            "dns": false,
        }
    },
    entry: './template/index.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'test'),
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './template/index.html',
            filename: 'index.html',
            minify: true,
        }),
        new NodePolyfillPlugin({
            // https://www.npmjs.com/package/node-polyfill-webpack-plugin
            additionalAliases: ['process', 'punycode'],
        }),
        new webpack.DefinePlugin({
            global: 'globalThis'
        })
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, "./template"),
        },
        compress: true,
        port: process.env.PORT,
    }
}