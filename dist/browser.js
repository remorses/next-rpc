"use strict";
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
/**
 * Workaround for https://github.com/facebook/create-react-app/issues/4760
 * See https://github.com/zeit/next.js/blob/b88f20c90bf4659b8ad5cb2a27956005eac2c7e8/packages/next/client/dev/error-overlay/hot-dev-client.js#L105
 */
function rewriteStacktrace(error) {
    const toReplaceRegex = new RegExp(escapeRegExp(process.env.__NEXT_DIST_DIR), 'g');
    error.stack =
        error.stack && error.stack.replace(toReplaceRegex, '/_next/development');
    return error;
}
function createRpcFetcher(url, method) {
    return function rpcFetch() {
        return fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                method,
                params: Array.prototype.slice.call(arguments),
            }),
            headers: {
                'content-type': 'application/json',
            },
        })
            .then(function (res) {
            if (!res.ok) {
                throw new Error('Unexpected HTTP status ' + res.status);
            }
            return res.json();
        })
            .then(function (json) {
            if (json.error) {
                let err = Object.assign(new Error(json.error.message), json.error);
                if (process.env.NODE_ENV !== 'production') {
                    err = rewriteStacktrace(err);
                }
                throw err;
            }
            return json.result;
        });
    };
}
Object.defineProperty(exports, '__esModule', {
    value: true,
});
exports.createRpcFetcher = createRpcFetcher;
