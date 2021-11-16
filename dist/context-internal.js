"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapPage = exports.wrapGetInitialProps = exports.wrapGetServerSideProps = exports.wrapApiHandler = exports.getContext = void 0;
const async_hooks_1 = require("async_hooks");
const DEFAULT_CONTEXT = {};
const asyncLocalStorage = new async_hooks_1.AsyncLocalStorage();
function getContext() {
    return asyncLocalStorage.getStore() || DEFAULT_CONTEXT;
}
exports.getContext = getContext;
function wrapApiHandler(handler) {
    return (req, res) => {
        const context = { req, res };
        return asyncLocalStorage.run(context, () => handler(req, res));
    };
}
exports.wrapApiHandler = wrapApiHandler;
function wrapGetServerSideProps(getServerSideProps) {
    return (context) => asyncLocalStorage.run(context, () => getServerSideProps(context));
}
exports.wrapGetServerSideProps = wrapGetServerSideProps;
function wrapGetInitialProps(getInitialProps) {
    return (context) => asyncLocalStorage.run(context, () => getInitialProps(context));
}
exports.wrapGetInitialProps = wrapGetInitialProps;
function wrapPage(Page) {
    if (typeof Page.getInitialProps === 'function') {
        Page.getInitialProps = wrapGetInitialProps(Page.getInitialProps);
    }
    return new Proxy(Page, {
        set(target, property, value) {
            if (property === 'getInitialProps' && typeof value === 'function') {
                return Reflect.set(target, property, wrapGetInitialProps(value));
            }
            return Reflect.set(target, property, value);
        },
    });
}
exports.wrapPage = wrapPage;
