/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;

    return config;
  },
  reactStrictMode: false,
  // Production
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cvai.rebuzzpos.com",
        pathname: "/cv_images/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.cvai.dev",
        pathname: "/cv_images/**",
      },
    ],
  },
  // Local
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: "https",
  //       hostname: "cvai.azurewebsites.net",
  //       pathname: "/cv_images/**",
  //     },
  //   ],
  // },
  // Vs Code
};

export default nextConfig;
