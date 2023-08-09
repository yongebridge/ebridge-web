const host = 'https://test.ebridge.exchange';
module.exports = [
  { source: '/api/:path*', destination: `${host}/api/:path*` },
  { source: '/cms/:path*', destination: `https://test-cms.ebridge.exchange/:path*` },
];
