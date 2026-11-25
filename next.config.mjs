/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  // The pitch deck: a static page in public/pitch (made by pitch-deck/site.sh), not linked from the site and kept out of search.
  async rewrites() {
    return [
      { source: '/pitch', destination: '/pitch/index.html' },
      { source: '/pitch/video', destination: '/pitch/ADRENL-pitch-video.mp4' },
    ];
  },
  async redirects() {
    return [
      { source: '/pitchdeck', destination: '/pitch', permanent: false },
      { source: '/deck', destination: '/pitch', permanent: false },
      { source: '/pitchvideo', destination: '/pitch/video', permanent: false },
      { source: '/video', destination: '/pitch/video', permanent: false },
    ];
  },
  async headers() {
    const noindex = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];
    return [
      { source: '/pitch', headers: noindex },
      { source: '/pitch/:path+', headers: noindex },
    ];
  },
};
export default nextConfig;
