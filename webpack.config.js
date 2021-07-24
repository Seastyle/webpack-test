/*
 * @Author: your name
 * @Date: 2021-07-22 16:26:01
 * @LastEditTime: 2021-07-24 20:52:35
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /webpack-test/webpack.config.js
 */
const {resolve} = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')

// 设置nodejs环境变量
// process.env.NODE_ENV = 'development'

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'js/built.js',
        path: resolve(__dirname, 'build')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    // 'style-loader',
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'postcss-loader', // 处理css前缀-兼容
                        options: {
                            ident: 'postcss',
                            plugins: () => [
                                require('postcss-preset-env')()
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'less-loader',
                ]
            },
            {
                test: /\.(png|jpg|gif)$/,
                loader: 'url-loader',
                options: {
                    limit: 8*1024,
                    esMudule:false,
                    name: '[hash:4].[ext]',
                    outputPath: 'imgs'
                }
            },
            {
                test: /\.html$/,
                loader: 'html-loader',
            },
            // 统一开发人员的代码风格
            {
                test: /\.js$/,
                loader: 'eslint-loader',
                exclude: /node_modules/,
                options: {
                    fix: true
                }
            },
            /*
                js兼容性处理：babel-loader  @babel/core
                    1. 处理基本js兼容性  @babel/preset-env
                        问题：只能转换基本语法，如promise高级语法不能转换
                    2. 解决js全部兼容性问题  @babel/polyfill
                        不用写配置，直接在文件中引入即可
                        问题：将所有兼容性代码全部引入，体积太大
                    3. 需要做兼容性处理的就做按需加载  core-js
                
                我们使用的是第一个和第三个的结合
            */
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: [
                        '@babel/preset-env',
                        {
                            // 按需加载
                            useBuiltIns: 'usage',
                            // 指定core-js版本
                            corejs: {
                                version: 3
                            },
                            // 指定兼容性做到哪个版本的浏览器
                            targets: {
                                chrome: '60',
                                firefox: '60',
                                ie: '9',
                                sarari: '10',
                                edge: '17',
                            }
                        }
                    ]
                }
            },
            {
                exclude: /\.(js|css|less|html|jpg|png|gif)$/,
                loader: 'file-loader',
                options: {
                    name: '[hash:6].[ext]'
                }
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            minify: {
                collapseWhitespace: true,
                removeComments: true
            }
        }),
        new MiniCssExtractPlugin({
            filename: 'css/built.css'
        }),
        new OptimizeCssAssetsWebpackPlugin()
    ],
    devServer: {
        contentBase:resolve(__dirname, 'build'),
        compress: true,
        open: true,
        port: 8888
    },
    mode: 'development'
}