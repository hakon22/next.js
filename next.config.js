/** @type {import('next').NextConfig} */

const nextConfig = {
  // output: 'export',
  // distDir: 'build',
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
  reactStrictMode: false,
};

export default nextConfig;
