"use client";

import Image from "next/image";
import type { VideoInfo } from "@/types";

interface VideoPreviewProps {
  info: VideoInfo | null;
  loading: boolean;
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const VideoPreview = ({ info, loading }: VideoPreviewProps) => {
  if (!info && !loading) return null;

  return (
    <div className="mt-6 flex justify-center px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
        {loading ? (
          <>
            <div className="h-40 rounded-xl bg-zinc-800 animate-pulse" />
            <div className="mt-4 h-4 w-2/3 rounded bg-zinc-800 animate-pulse" />
            <div className="mt-2 h-3 w-1/3 rounded bg-zinc-800 animate-pulse" />
          </>
        ) : info ? (
          <>
            {info.platform === "TikTok" ? (
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  {info.thumbnail ? (
                    <Image
                      src={info.thumbnail}
                      alt={info.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="relative w-full h-full bg-zinc-800/30">
                      <Image
                        src="https://blocks.astratic.com/img/general-img-landscape.png"
                        alt="Placeholder"
                        fill
                        className="object-cover opacity-30 mix-blend-overlay"
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white line-clamp-2 text-sm">
                    {info.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400">
                      TikTok
                    </span>
                    {info.duration !== undefined && (
                      <span className="text-xs text-zinc-500">
                        {formatDuration(info.duration)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {info.thumbnail && (
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden">
                    <Image
                      src={info.thumbnail}
                      alt={info.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                      className="object-cover"
                    />
                  </div>
                )}
                <h3 className="mt-4 font-medium text-white line-clamp-2">
                  {info.title}
                </h3>
                <div className="mt-2 flex items-center gap-2">
                  {info.platform && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400">
                      {info.platform}
                    </span>
                  )}
                  {info.duration !== undefined && (
                    <span className="text-xs text-zinc-500">
                      {formatDuration(info.duration)}
                    </span>
                  )}
                </div>
              </>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default VideoPreview;
