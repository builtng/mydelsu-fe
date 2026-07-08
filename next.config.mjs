/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/manna',
        destination: '/',
        permanent: true,
      },
      {
        source: '/manna/wall-of-thanks',
        destination: '/wall-of-thanks',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
