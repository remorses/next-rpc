import * as babel from '@babel/core';
declare type Babel = typeof babel;
export interface PluginOptions {
    apiDir: string;
    isServer: boolean;
}
export default function (babel: Babel, options: PluginOptions): babel.PluginObj;
export {};
