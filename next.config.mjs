/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.seadn.io" },
      { protocol: "https", hostname: "**.moralis.io" },
      { protocol: "https", hostname: "**.moralisusercontent.com" },
      { protocol: "https", hostname: "**.opensea.io" },
      { protocol: "https", hostname: "**.ipfs.io" },
      { protocol: "https", hostname: "ipfs.io" },
      { protocol: "https", hostname: "**.cloudfront.net" },
      { protocol: "https", hostname: "**.githubusercontent.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "**.coingecko.com" },
      { protocol: "https", hostname: "**.coinmarketcap.com" },
      { protocol: "https", hostname: "**.nftport.xyz" },
      { protocol: "https", hostname: "**.pinata.cloud" },
      { protocol: "https", hostname: "**.arweave.net" },
      { protocol: "https", hostname: "**.infura-ipfs.io" },
      { protocol: "https", hostname: "**.mypinata.cloud" },
      { protocol: "https", hostname: "assets.coingecko.com" },
      { protocol: "https", hostname: "coin-images.coingecko.com" },
      { protocol: "https", hostname: "logos.moralis.io" },
    ],
  },
};

export default nextConfig;
