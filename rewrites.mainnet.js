const host = 'https://ebridge.exchange';
module.exports = [{ source: '/api/:path*', destination: `${host}/api/:path*` }];
