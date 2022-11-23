const { NODE_ENV } = process.env;

const rewrites = [{ source: '/api/:path*', destination: 'http://192.168.66.244:8068/api/:path*' }];

const productionRewrites = [{ source: '/api/:path*', destination: 'http://192.168.66.244:8068/api/:path*' }];

module.exports = NODE_ENV === 'production' ? productionRewrites : rewrites;
