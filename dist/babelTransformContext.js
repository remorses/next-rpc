"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const astUtils_1 = require("./astUtils");
const IMPORT_PATH = 'next-rpc/dist/context-internal';
function visitApiHandler({ types: t }, path) {
    let defaultExportPath;
    path.traverse({
        ExportDefaultDeclaration(path) {
            defaultExportPath = path;
        },
    });
    if (defaultExportPath) {
        const { declaration } = defaultExportPath.node;
        if (t.isTSDeclareFunction(declaration)) {
            return;
        }
        const wrapApiHandlerIdentifier = path.scope.generateUidIdentifier('wrapApiHandler');
        path.node.body.unshift(t.importDeclaration([
            t.importSpecifier(wrapApiHandlerIdentifier, t.identifier('wrapApiHandler')),
        ], t.stringLiteral(IMPORT_PATH)));
        const exportAsExpression = t.isDeclaration(declaration)
            ? t.toExpression(declaration)
            : declaration;
        defaultExportPath.replaceWith(t.exportDefaultDeclaration((0, astUtils_1.annotateAsPure)(t, t.callExpression(wrapApiHandlerIdentifier, [exportAsExpression]))));
    }
}
function visitPage({ types: t }, path) {
    const wrapGetServerSidePropsIdentifier = path.scope.generateUidIdentifier('wrapGetServerSideProps');
    const wrapPageIdentifier = path.scope.generateUidIdentifier('wrapPage');
    path.node.body.unshift(t.importDeclaration([
        t.importSpecifier(wrapGetServerSidePropsIdentifier, t.identifier('wrapGetServerSideProps')),
        t.importSpecifier(wrapPageIdentifier, t.identifier('wrapPage')),
    ], t.stringLiteral(IMPORT_PATH)));
    path.traverse({
        ExportNamedDeclaration(path) {
            const { declaration } = path.node;
            if (t.isFunctionDeclaration(declaration) &&
                t.isIdentifier(declaration.id, { name: 'getServerSideProps' })) {
                const exportAsExpression = t.isDeclaration(declaration)
                    ? t.toExpression(declaration)
                    : declaration;
                path.node.declaration = t.variableDeclaration('const', [
                    t.variableDeclarator(declaration.id, (0, astUtils_1.annotateAsPure)(t, t.callExpression(wrapGetServerSidePropsIdentifier, [
                        exportAsExpression,
                    ]))),
                ]);
            }
        },
        ExportDefaultDeclaration(defaultExportPath) {
            const { declaration } = defaultExportPath.node;
            if (t.isTSDeclareFunction(declaration)) {
                return;
            }
            if (t.isDeclaration(declaration)) {
                if (!declaration.id) {
                    return;
                }
                defaultExportPath.insertAfter(t.expressionStatement(t.assignmentExpression('=', declaration.id, (0, astUtils_1.annotateAsPure)(t, t.callExpression(wrapPageIdentifier, [declaration.id])))));
            }
            else {
                defaultExportPath.replaceWith(t.exportDefaultDeclaration((0, astUtils_1.annotateAsPure)(t, t.callExpression(wrapPageIdentifier, [declaration]))));
                defaultExportPath.skip();
            }
        },
    });
}
function default_1(babel, options) {
    const { apiDir, isServer } = options;
    return {
        visitor: {
            Program(path) {
                if (!isServer) {
                    return;
                }
                const { filename } = this.file.opts;
                const isApiRoute = filename && filename.startsWith(apiDir);
                if (isApiRoute) {
                    visitApiHandler(babel, path);
                }
                else {
                    visitPage(babel, path);
                }
            },
        },
    };
}
exports.default = default_1;
