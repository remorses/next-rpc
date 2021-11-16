"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const find_pages_dir_1 = require("next/dist/lib/find-pages-dir");
const path = __importStar(require("path"));
function init(withRpcConfig = {}) {
    return (nextConfig = {}) => {
        return Object.assign(Object.assign({}, nextConfig), { webpack(config, options) {
                const { experimentalContext = false } = withRpcConfig;
                const { isServer, dev, dir } = options;
                const pagesDir = (0, find_pages_dir_1.findPagesDir)(dir);
                const apiDir = path.resolve(pagesDir, './api');
                const rpcPluginOptions = {
                    isServer,
                    pagesDir,
                    dev,
                    apiDir,
                    basePath: nextConfig.basePath || '/',
                };
                const contextPluginOptions = { apiDir, isServer };
                config.module = config.module || {};
                config.module.rules = config.module.rules || [];
                config.module.rules.push({
                    test: /\.(tsx|ts|js|mjs|jsx)$/,
                    include: [pagesDir],
                    use: [
                        options.defaultLoaders.babel,
                        {
                            loader: 'babel-loader',
                            options: {
                                sourceMaps: dev,
                                plugins: [
                                    [
                                        require.resolve('../dist/babelTransformRpc'),
                                        rpcPluginOptions,
                                    ],
                                    ...(experimentalContext
                                        ? [
                                            [
                                                require.resolve('../dist/babelTransformContext'),
                                                contextPluginOptions,
                                            ],
                                        ]
                                        : []),
                                    require.resolve('@babel/plugin-syntax-jsx'),
                                    [
                                        require.resolve('@babel/plugin-syntax-typescript'),
                                        { isTSX: true },
                                    ],
                                ],
                            },
                        },
                    ],
                });
                if (typeof nextConfig.webpack === 'function') {
                    return nextConfig.webpack(config, options);
                }
                else {
                    return config;
                }
            } });
    };
}
exports.default = init;
