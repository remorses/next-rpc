"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function sendError(res, status, message) {
    res.status(status).json({ error: { message } });
}
function createRpcHandler(methodsInit) {
    const methods = new Map(methodsInit);
    return (req, res) => __awaiter(this, void 0, void 0, function* () {
        if (req.method !== 'POST') {
            sendError(res, 405, `method "${req.method}" is not allowed`);
            return;
        }
        const { method, params } = req.body;
        const requestedFn = methods.get(method);
        if (typeof requestedFn !== 'function') {
            sendError(res, 400, `"${method}" is not a function`);
            return;
        }
        try {
            const result = yield requestedFn(...params);
            return res.json({ result });
        }
        catch (error) {
            const { name = 'NextRpcError', message = `Invalid value thrown in "${method}", must be instance of Error`, stack = undefined, } = error instanceof Error ? error : {};
            return res.json({
                error: {
                    name,
                    message,
                    stack: process.env.NODE_ENV === 'production' ? undefined : stack,
                },
            });
        }
    });
}
Object.defineProperty(exports, '__esModule', {
    value: true,
});
exports.createRpcHandler = createRpcHandler;
