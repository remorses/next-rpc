import * as babel from '@babel/core';
declare type Babel = typeof babel;
export interface PluginOptions {
    isServer: boolean;
    pagesDir: string;
    dev: boolean;
    apiDir: string;
    basePath: string;
}
export default function ({ types: t }: Babel, { apiDir, pagesDir, isServer, basePath }: PluginOptions): babel.PluginObj;
export {};
