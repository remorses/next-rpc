import { NextConfig } from 'next';
export interface WithRpcConfig {
    experimentalContext?: boolean;
}
export default function init(withRpcConfig?: WithRpcConfig): (nextConfig?: NextConfig) => NextConfig;
