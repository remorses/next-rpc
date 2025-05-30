"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const astUtils_1 = require("./astUtils");
const IMPORT_PATH_SERVER = 'next-rpc/dist/server';
const IMPORT_PATH_BROWSER = 'next-rpc/dist/browser';
function buildRpcApiHandler(t, createRpcHandlerIdentifier, rpcMethodNames) {
    return (0, astUtils_1.annotateAsPure)(t, t.callExpression(createRpcHandlerIdentifier, [
        t.arrayExpression(rpcMethodNames.map((name) => t.arrayExpression([t.stringLiteral(name), t.identifier(name)]))),
    ]));
}
function isAllowedTsExportDeclaration(t, declaration) {
    return (t.isTSTypeAliasDeclaration(declaration) ||
        t.isTSInterfaceDeclaration(declaration));
}
function default_1({ types: t }, { apiDir, pagesDir, isServer, basePath }) {
    return {
        visitor: {
            Program(path) {
                const { filename } = this.file.opts;
                if (!filename) {
                    return;
                }
                const isApiRoute = filename && filename.startsWith(apiDir);
                if (!isApiRoute) {
                    return;
                }
                const rpcRelativePath = filename
                    .slice(pagesDir.length)
                    .replace(/\.[j|t]sx?$/, '')
                    .replace(/\/index$/, '');
                const rpcPath = basePath === '/' ? rpcRelativePath : `${basePath}/${rpcRelativePath}`;
                const errors = [];
                const rpcMethodNames = [];
                let isRpc = false;
                let defaultExportPath;
                path.traverse({
                    ExportNamedDeclaration(path) {
                        const { declaration } = path.node;
                        if (isAllowedTsExportDeclaration(t, declaration)) {
                            return;
                        }
                        else if (t.isFunctionDeclaration(declaration)) {
                            if (!declaration.async) {
                                errors.push(path.buildCodeFrameError('rpc exports must be declared "async"'));
                            }
                            if (declaration.id) {
                                rpcMethodNames.push(declaration.id.name);
                            }
                        }
                        else if (t.isVariableDeclaration(declaration) &&
                            declaration.kind === 'const') {
                            for (const varDeclaration of declaration.declarations) {
                                if (t.isIdentifier(varDeclaration.id) &&
                                    varDeclaration.id.name === 'config' &&
                                    t.isObjectExpression(varDeclaration.init) &&
                                    varDeclaration.init.properties.some((property) => {
                                        return (t.isObjectProperty(property) &&
                                            t.isIdentifier(property.key) &&
                                            property.key.name === 'rpc' &&
                                            t.isBooleanLiteral(property.value, { value: true }));
                                    })) {
                                    isRpc = true;
                                }
                                else if (t.isFunctionExpression(varDeclaration.init) ||
                                    t.isArrowFunctionExpression(varDeclaration.init)) {
                                    if (!varDeclaration.init.async) {
                                        errors.push(path.buildCodeFrameError('rpc exports must be declared "async"'));
                                    }
                                    const { id } = varDeclaration;
                                    if (t.isIdentifier(id)) {
                                        rpcMethodNames.push(id.name);
                                    }
                                }
                                else if (t.isIdentifier(varDeclaration.id) &&
                                    t.isCallExpression(varDeclaration.init)) {
                                    rpcMethodNames.push(varDeclaration.id.name);
                                }
                                else {
                                    errors.push(path.buildCodeFrameError('rpc exports must be static functions'));
                                }
                            }
                        }
                        else {
                            errors.push(path.buildCodeFrameError('rpc exports must be static functions'));
                        }
                    },
                    ExportDefaultDeclaration(path) {
                        defaultExportPath = path;
                    },
                });
                if (!isRpc) {
                    return;
                }
                if (errors.length > 0) {
                    throw errors[0];
                }
                if (defaultExportPath) {
                    throw path.buildCodeFrameError('default exports are not allowed in rpc routes');
                }
                if (isServer) {
                    const createRpcHandlerIdentifier = path.scope.generateUidIdentifier('createRpcHandler');
                    let apiHandlerExpression = buildRpcApiHandler(t, createRpcHandlerIdentifier, rpcMethodNames);
                    path.node.body = [
                        t.importDeclaration([
                            t.importSpecifier(createRpcHandlerIdentifier, t.identifier('createRpcHandler')),
                        ], t.stringLiteral(IMPORT_PATH_SERVER)),
                        ...path.node.body,
                        t.exportDefaultDeclaration(apiHandlerExpression),
                    ];
                }
                else {
                    const createRpcFetcherIdentifier = path.scope.generateUidIdentifier('createRpcFetcher');
                    path.node.body = [
                        t.importDeclaration([
                            t.importSpecifier(createRpcFetcherIdentifier, t.identifier('createRpcFetcher')),
                        ], t.stringLiteral(IMPORT_PATH_BROWSER)),
                        ...rpcMethodNames.map((name) => t.exportNamedDeclaration(t.variableDeclaration('const', [
                            t.variableDeclarator(t.identifier(name), (0, astUtils_1.annotateAsPure)(t, t.callExpression(createRpcFetcherIdentifier, [
                                t.stringLiteral(rpcPath),
                                t.stringLiteral(name),
                            ]))),
                        ]))),
                    ];
                }
            },
        },
    };
}
exports.default = default_1;
