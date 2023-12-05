const host = 'https://test.ebridge.exchange';
module.exports = [
  { source: '/api/:path*', destination: `${host}/api/:path*` },
  { source: '/cms/:path*', destination: `https://test-cms.ebridge.exchange/:path*` },
  { source: '/AElfIndexer_eBridge/:path*', destination: `http://43.207.148.125:7022/AElfIndexer_eBridge/:path*` },
];
