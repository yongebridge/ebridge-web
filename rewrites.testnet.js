const host = 'https://test.ebridge.exchange';
module.exports = [{ source: '/api/:path*', destination: `${host}/api/:path*` }];
