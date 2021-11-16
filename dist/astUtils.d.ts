import { Node, types } from '@babel/core';
export declare function annotateAsPure<N extends Node>(t: typeof types, node: N): N;
