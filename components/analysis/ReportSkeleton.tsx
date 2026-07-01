"use client";

import { motion } from "framer-motion";

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-subtle/60 ${className || ""}`}
    />
  );
}

export default function ReportSkeleton() {
  return (
    <div className="min-h-screen bg-void noise">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-glow-indigo opacity-20" />
        <div
          className="absolute inset-0 bg-grid-pattern bg-grid"
          style={{ backgroundSize: "40px 40px" }}
        />
      </div>

      <div className="z-10 flex items-center justify-between px-6 md:px-10 py-5 border-b border-border glass-strong sticky top-0">
        <SkeletonBlock className="w-28 h-4" />
        <div className="flex items-center gap-2">
          <SkeletonBlock className="w-16 h-6 rounded-full" />
          <SkeletonBlock className="w-16 h-6 rounded-full" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <SkeletonBlock className="w-64 h-4" />
          <SkeletonBlock className="w-96 h-8" />
          <SkeletonBlock className="w-48 h-4" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <SkeletonBlock className="h-64" />
            </div>
            <SkeletonBlock className="h-64" />
          </div>

          <SkeletonBlock className="h-96" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SkeletonBlock className="h-80" />
            <SkeletonBlock className="h-80" />
          </div>

          <SkeletonBlock className="h-64" />
        </motion.div>
      </div>
    </div>
  );
}
