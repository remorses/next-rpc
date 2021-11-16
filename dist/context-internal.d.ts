/// <reference types="node" />
import type { NextApiHandler, GetServerSideProps, NextPageContext, NextPage } from 'next';
import type { IncomingMessage, ServerResponse } from 'http';
interface NextRpcContext {
    req?: IncomingMessage;
    res?: ServerResponse;
}
export declare function getContext(): NextRpcContext;
export declare function wrapApiHandler(handler: NextApiHandler): NextApiHandler;
export declare function wrapGetServerSideProps(getServerSideProps: GetServerSideProps): GetServerSideProps;
export declare type GetInitialProps<IP> = (context: NextPageContext) => IP | Promise<IP>;
export declare function wrapGetInitialProps<IP>(getInitialProps: GetInitialProps<IP>): GetInitialProps<IP>;
export declare function wrapPage<P, IP>(Page: NextPage<P, IP>): NextPage<P, IP>;
export {};
