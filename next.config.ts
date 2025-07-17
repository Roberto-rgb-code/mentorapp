module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.API_URL || 'http://127.0.0.1:5000/:path*',
      },
    ];
  },
};