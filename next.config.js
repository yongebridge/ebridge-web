/* eslint-disable */
/** @type {import('next').NextConfig} */
const { NEXT_PUBLIC_PREFIX, ANALYZE, NODE_ENV, NEXT_PUBLIC_APP_ENV } = process.env;
const withLess = require('next-with-less');
const withPlugins = require('next-compose-plugins');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: ANALYZE === 'true',
});
const path = require('path');
const fs = require('fs');
const filePath = path.resolve(__dirname, `./src/constants/index.ts`);
const IS_MAINNET = NEXT_PUBLIC_APP_ENV === 'mainnet';

const appEnv = NEXT_PUBLIC_APP_ENV || 'testnet';

const rewrites = require(`./rewrites.${appEnv}`);

fs.writeFileSync(
  filePath,
  `export const IS_MAINNET = ${IS_MAINNET};\n
export * from './${appEnv}';\n`,
);

const plugins = [
  [withBundleAnalyzer],
  [
    withLess,
    {
      lessLoaderOptions: {
        lessOptions: {
          modifyVars: {
            '@app-prefix': NEXT_PUBLIC_PREFIX,
            '@ant-prefix': NEXT_PUBLIC_PREFIX,
          },
        },
      },
    },
  ],
];

const nextConfig = {
  reactStrictMode: false,
  // webpack(config) {
  //   config.resolve.alias['bn.js'] = path.resolve(process.cwd(), 'node_modules', 'bn.js');
  //   return config;
  // },
  async rewrites() {
    return rewrites;
  },
  images: {
    domains: ['raw.githubusercontent.com'],
  },
};

const productionConfig = {
  ...nextConfig,
  // swcMinify: true,
  compiler: {
    removeConsole: {
      exclude: ['error'],
    },
  },
  experimental: {
    'react-use': {
      transform: 'react-use/lib/{{member}}',
    },
    lodash: {
      transform: 'lodash/{{member}}',
    },
  },
  resolve: {},
};

module.exports = withPlugins(plugins, ANALYZE === 'true' || NODE_ENV === 'production' ? productionConfig : nextConfig);
