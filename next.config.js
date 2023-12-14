/** @type {import('next').NextConfig} */

const nextConfig = {
  basePath: '/marketplace',
  transpilePackages: [
    'rc-util',
    'rc-tree',
    'rc-pagination',
    'rc-picker',
    'rc-table',
    '@ant-design/icons',
    '@ant-design/icons-svg',
  ],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://192.168.1.111:3007/marketplace/api/:path*', // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
