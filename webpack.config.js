const {resolve} = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')

/*
    HMR：hot module replacement 热模块替换/模块热替换
    作用：一个模块发生变化，只会重新打包这一个模块（而不是打包所有模块），能够极大提升构建速度

    样式文件：可以使用HMR功能，因为style-loader内部实现了
    js文件：默认不能使用HMR功能，需要修改js代码，添加支持HMR功能的代码
        注意：HMR只能处理非入口js文件的其他文件。
    html文件：默认不能使用HMR功能，同时会导致html文件不能热更
        解决：修改entry入口，将html文件引入
        其实对html是不用做热更的，因为就一个html文件
        entry:['./src/index.js', './src/index.html']
        
*/

// 复用loader
const commonCssLoade = [
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

// 设置nodejs环境变量（可以决定browserslist使用哪个环境的配置）
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
                    ...commonCssLoade                
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
            /*
              正常来讲，一个文件只能被一个loader处理。
              当一个文件要被多个laoder处理，那么一定要指定loader执行的先后顺序：
                 先执行eslint 再执行babel

            */
            {
                // 统一开发人员的代码风格
                // 在package.json中配置eslintConfig --> airbnb
                test: /\.js$/,
                loader: 'eslint-loader',
                // 优先执行
                enforce: 'pre',
                exclude: /node_modules/,
                options: {
                    fix: true // 自动修复
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
        port: 8888,
        hot: true, // 热更新
    },
    mode: 'development'
}

// module.exports = {
//     entry: './src/index.js',
//     output: {
//         filename: 'js/built.js',
//         path: resolve(__dirname, 'build')
//     },
//     module: {
//         rules: [
//             {
//                 test: /\.css$/,
//                 use: [...commonCssLoade]
//             },
//             {
//                 test: /\.less$/,
//                 use: [
//                     ...commonCssLoade,
//                     'less-loader',
//                 ]
//             },
//             {
//                 test: /\.(png|jpg|gif)$/,
//                 loader: 'url-loader',
//                 options: {
//                     limit: 8*1024,
//                     esMudule:false,
//                     name: '[hash:6].[ext]',
//                     outputPath: 'imgs'
//                 }
//             },
//             {
//                 test: /\.html$/,
//                 loader: 'html-loader',
//             },
//             // 统一开发人员的代码风格
//             {
//                 test: /\.js$/,
//                 loader: 'eslint-loader',
//                 exclude: /node_modules/,
//                 options: {
//                     fix: true
//                 }
//             },
//             /*
//                 js兼容性处理：babel-loader  @babel/core
//                     1. 处理基本js兼容性  @babel/preset-env
//                         问题：只能转换基本语法，如promise高级语法不能转换
//                     2. 解决js全部兼容性问题  @babel/polyfill
//                         不用写配置，直接在文件中引入即可
//                         问题：将所有兼容性代码全部引入，体积太大
//                     3. 需要做兼容性处理的就做按需加载  core-js
                
//                 我们使用的是第一个和第三个的结合
//             */
//             {
//                 test: /\.js$/,
//                 exclude: /node_modules/,
//                 loader: 'babel-loader',
//                 options: {
//                     presets: [
//                         '@babel/preset-env',
//                         {
//                             // 按需加载
//                             useBuiltIns: 'usage',
//                             // 指定core-js版本
//                             corejs: {
//                                 version: 3
//                             },
//                             // 指定兼容性做到哪个版本的浏览器
//                             targets: {
//                                 chrome: '60',
//                                 firefox: '60',
//                                 ie: '9',
//                                 sarari: '10',
//                                 edge: '17',
//                             }
//                         }
//                     ]
//                 }
//             },
//             {
//                 exclude: /\.(js|css|less|html|jpg|png|gif)$/,
//                 loader: 'file-loader',
//                 options: {
//                     name: '[hash:6].[ext]',
//                     outputPath: 'media'
//                 }
//             },
//         ]
//     },
//     plugins: [
//         new HtmlWebpackPlugin({
//             template: './src/index.html',
//             minify: {
//                 collapseWhitespace: true,
//                 removeComments: true
//             }
//         }),
//         new MiniCssExtractPlugin({
//             filename: 'css/built.css'
//         }),
//         new OptimizeCssAssetsWebpackPlugin()
//     ],
//     mode: 'production'
// }