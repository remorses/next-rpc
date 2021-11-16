"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.annotateAsPure = void 0;
const PURE_ANNOTATION = '#__PURE__';
function annotateAsPure(t, node) {
    t.addComment(node, 'leading', PURE_ANNOTATION);
    return node;
}
exports.annotateAsPure = annotateAsPure;
