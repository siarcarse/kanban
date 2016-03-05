const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const NpmInstallPlugin = require('npm-install-webpack-plugin');
const AppCachePlugin = require('appcache-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const ChunkManifestPlugin = require('chunk-manifest-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TARGET = process.env.npm_lifecycle_event; //Capturo variable pasada a NPM (i.e npm START)
process.env.BABEL_ENV = TARGET;


const PATHS = {
    app: path.join(__dirname, 'app'),
    build: path.join(__dirname, 'build')
};

const common = {
    entry: {
        app: PATHS.app
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    output: {
        path: PATHS.build,
        filename: '[bundle].[chunkhash].js',
        //filename: 'bundle.js',
        chunkFilename: '[bundle].[chunkhash].js'
    },
    module: {
        loaders: [{
            test: /\.css$/,
            loaders: ['style', 'css'],
            include: PATHS.app
        }, {
            test: /\.jsx?$/,
            loaders: ['babel?cacheDirectory'],
            include: PATHS.app
        }],
        preLoaders: [{
            test: /\.jsx?$/,
            loaders: ['eslint', 'jscs'],
            include: PATHS.app
        }]
    }
};
// Default configuration
if (TARGET === 'start' || !TARGET) {
    module.exports = merge(common, {
        devtool: 'eval-source-map',
        devServer: {
            contentBase: PATHS.build,
            historyApiFallback: true,
            hot: true,
            inline: true,
            progress: true,

            stats: 'errors-only',

            // Parse host and port from env so this is easy to customize.
            host: process.env.HOST,
            port: process.env.PORT
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            new NpmInstallPlugin({
                save: true // --save
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: "app",
                minChunks: Infinity,
            }),
            new ManifestPlugin(),
            new ChunkManifestPlugin({
                filename: "chunk-manifest.json",
                manifestVariable: "webpackManifest"
            }),
            new webpack.optimize.OccurenceOrderPlugin()
        ]
    });
}

if (TARGET === 'build') {
    module.exports = merge(common, {
        plugins: [
            new HtmlWebpackPlugin({
                template: 'node_modules/html-webpack-template/index.ejs',
                title: 'Kanban app',
                appMountId: 'app',
                inject: false
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: "app",
                minChunks: Infinity,
            }),
            new ManifestPlugin(),
            new ChunkManifestPlugin({
                filename: "chunk-manifest.json",
                manifestVariable: "webpackManifest"
            }),
            new webpack.optimize.OccurenceOrderPlugin(),
            new AppCachePlugin({
              settings: ['prefer-online'],
              output: 'my-manifest.appcache'
            })
        ]
    });
}
