const path = require('path');
const webpack = require('webpack');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const IS_DESKTOP_APP = false;

module.exports = (env) => ({
    cache: {
        type: 'filesystem',
    },
    entry: {
        main: './src/main.ts',
        ...(IS_DESKTOP_APP ? {} : { popup: './src/popup/popup.tsx' }),
        inject: "./src/inject.ts",
        background: "./src/background.ts"
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'teams_plus'),
        assetModuleFilename: 'assets/[name][ext]',
        publicPath: IS_DESKTOP_APP ? './' : 'auto',
    },
    resolve: {
        extensions: ['.ts', '.js', '.css', '.tsx'],
        alias: {
            'gradient-picker': path.resolve(__dirname, 'node_modules/gradient-picker/dist'),
            'emojilib$': 'emojilib/emojis.json',
            assets: path.resolve(__dirname, 'teams_plus/assets'),
            pages: path.resolve(__dirname, 'teams_plus/pages'),
        },
        fallback: {
            "buffer": require.resolve("buffer/"),
            "stream": require.resolve("stream-browserify"),
            "crypto": false
        },
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        },
        {
            test: /\.(txt|html)$/,
            type: 'asset/source',
        },
        {
            test: /\.(png|jpe?g|gif|svg|woff2?|eot|ttf|otf)$/i,
            type: 'asset/resource',
        },
        {
            test: /\.css$/i,
            oneOf: [
                {
                    resourceQuery: /asString/,
                    use: [
                        { loader: 'css-loader', options: { exportType: 'string' } },
                        'postcss-loader',
                    ],
                },
                {
                    use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
                },
            ],
        },
        ],

    },
    devServer: {
        contentBase: path.resolve(__dirname, 'dist'),
        port: 9000,
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
        new ProgressBarPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name].bundle.css',
        }),
        new webpack.DefinePlugin({
            __DESKTOP_APP__: JSON.stringify(IS_DESKTOP_APP)
        })
    ],
    mode: "production"
});