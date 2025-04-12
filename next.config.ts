// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:5000/:path*', // Usa 127.0.0.1 en lugar de localhost
      },
    ];
  },
};
