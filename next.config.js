/* eslint-disable */
/** @type {import('next').NextConfig} */
const withLess = require('next-with-less');
const withPlugins = require('next-compose-plugins');
const { NEXT_PUBLIC_PREFIX, ANALYZE, NODE_ENV } = process.env;
const rewrites = require('./rewrites');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: ANALYZE === 'true',
});
const path = require('path');
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
