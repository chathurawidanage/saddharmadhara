import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^pg-native$|^cloudflare:sockets$/,
      }),
    );

    config.cache = {
      type: "memory",
    };

    return config;
  },
};

export default nextConfig;
