const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const config = {
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
                        ]
                    },
                },
            },
        ],
    },
    resolve: {
        extensions: [
            '.ts', '.js',
        ],
    },
}

const testConfig = Object.assign({}, config, {
    entry: './template/index.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'test'),
    },
    plugin: [
        new webpack.HotModuleReplacementPlugin(),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './template/index.html',
            filename: 'index.html',
            minify: true,
        }),
    ]
});

module.exports = testConfig;