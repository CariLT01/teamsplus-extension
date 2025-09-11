const path = require('path');
const webpack = require('webpack');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

module.exports = {
    // Multiple entry points
    cache: {
        type: 'filesystem', // Use the filesystem cache to persist build information
    },
    entry: {
        main: './src/main.ts', // Main application entry point
        popup: './src/popup/popup.ts', // Admin dashboard entry point
    },
    output: {
        // Dynamically create separate bundles for each entry point
        filename: '[name].bundle.js', // '[name]' will be replaced with 'app' or 'admin'
        path: path.resolve(__dirname, 'teams_plus'),
    },
    resolve: {
        extensions: ['.ts', '.js', '.css'], // Resolves .ts and .js files,
        alias: {
            'gradient-picker': path.resolve(__dirname, 'node_modules/gradient-picker/dist'), // Alias to ensure Webpack resolves types correctly,
            'emojilib$': 'emojilib/emojis.json', // Force use JSON instead of broken JS
        },
        fallback: {
            "buffer": require.resolve("buffer/"),
            "stream": require.resolve("stream-browserify"),
            "crypto": false // Disable if not needed
        }
    },
    module: {
        rules: [{
            test: /\.ts$/, // Apply this rule to .ts files
            use: 'babel-loader', // Use ts-loader to compile TypeScript
            exclude: /node_modules/,
        },
        {
            test: /\.css$/, // Process CSS files
            use: ['style-loader', 'css-loader'], // Apply style and css loaders
        },
        {
            test: /\.txt$/,
            type: 'asset/source'
        },
        {
            test: /\.(png|jpe?g|gif|svg|woff2?|eot|ttf|otf)$/i,
            type: 'asset/inline',
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
        new ProgressBarPlugin()
    ],
    mode: "production",
};