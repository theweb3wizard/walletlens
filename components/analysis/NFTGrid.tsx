"use client";

import { motion } from "framer-motion";
import { NFTItem } from "@/types";
import { ImageIcon } from "lucide-react";
import Image from "next/image";

interface Props {
  nfts: NFTItem[];
}

export default function NFTGrid({ nfts }: Props) {
  const displayed = nfts.slice(0, 12);

  return (
    <div className="glass rounded-2xl border border-border p-6">
      <div className="flex items-center gap-2 mb-5">
        <ImageIcon size={16} className="text-emerald" />
        <h2 className="font-display font-600 text-white text-sm">
          NFT Holdings
        </h2>
        <span className="ml-auto text-muted text-xs font-mono">
          {nfts.length} total
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {displayed.map((nft, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-xl border border-border bg-void/50 overflow-hidden group hover:border-emerald/30 transition-all duration-200"
          >
            {nft.collection_logo ? (
              <div className="relative w-full aspect-square">
                <Image
                  src={nft.collection_logo}
                  alt={nft.name || "NFT"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            ) : (
              <div className="w-full aspect-square bg-subtle flex items-center justify-center">
                <ImageIcon size={20} className="text-muted" />
              </div>
            )}
            <div className="p-2">
              <p className="text-white text-[10px] font-mono truncate">
                {nft.name || nft.symbol || "Unknown"}
              </p>
              <p className="text-muted text-[9px] font-mono">
                #{nft.token_id?.slice(0, 6)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}