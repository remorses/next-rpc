declare function escapeRegExp(string: string): string;
/**
 * Workaround for https://github.com/facebook/create-react-app/issues/4760
 * See https://github.com/zeit/next.js/blob/b88f20c90bf4659b8ad5cb2a27956005eac2c7e8/packages/next/client/dev/error-overlay/hot-dev-client.js#L105
 */
declare function rewriteStacktrace(error: Error): Error;
declare type NextRpcCall = (...params: any[]) => any;
declare function createRpcFetcher(url: string, method: string): NextRpcCall;
