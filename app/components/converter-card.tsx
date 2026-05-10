"use client";

import { useEffect, useState } from "react";
import VideoPreview from "./video-preview";
import type { VideoInfo } from "@/types";
import { toast } from "sonner";
import { Spinner } from "./Spinner";

const ConverterCard = () => {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<"mp3" | "mp4">("mp3");
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo>(null);
  const [infoLoading, setInfoLoading] = useState(false);

  const handleConvert = async () => {
    if (!videoInfo?.url) return;

    const convertUrl = videoInfo.url;
    const convertTitle = videoInfo.title;

    setLoading(true);
    const toastId = toast.loading("Converting...");

    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: convertUrl, format }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Something went wrong", { id: toastId });
        setLoading(false);
        return;
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = convertTitle
        ? `${convertTitle}.${format}`
        : `media.${format}`;
      a.click();
      URL.revokeObjectURL(objectUrl);

      toast.success("Downloaded!", { id: toastId });
    } catch {
      toast.error("Network error", { id: toastId });
    }

    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVideoInfo(null);
  }, [url]);

  useEffect(() => {
    if (!url) return;

    const timer = setTimeout(async () => {
      setInfoLoading(true);
      try {
        const res = await fetch("/api/info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = await res.json();
        if (res.ok)
          setVideoInfo({
            url,
            title: data.title ?? "Unknown",
            duration: data.duration,
            thumbnail: data.thumbnail,
            platform: data.platform,
          });
        else setVideoInfo(null);
      } catch {
        setVideoInfo(null);
      }
      setInfoLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [url]);

  return (
    <>
      <div className="mt-12 flex justify-center px-4">
        <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-xl">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube or TikTok URL..."
            className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3 outline-none"
          />

          <div className="mt-4 flex items-center justify-center">
            <div className="flex rounded-xl border border-zinc-800 bg-zinc-950 p-1">
              <button
                onClick={() => setFormat("mp3")}
                className={`px-4 py-1 rounded-lg text-sm transition ${
                  format === "mp3"
                    ? "bg-white text-black"
                    : "text-zinc-400 cursor-pointer"
                }`}
              >
                MP3
              </button>

              <button
                onClick={() => setFormat("mp4")}
                className={`px-4 py-1 rounded-lg text-sm transition ${
                  format === "mp4"
                    ? "bg-white text-black"
                    : "text-zinc-400 cursor-pointer"
                }`}
              >
                MP4
              </button>
            </div>
          </div>
          <button
            onClick={handleConvert}
            disabled={loading || infoLoading || !videoInfo}
            className="mt-4 w-full rounded-xl bg-white text-black py-2 font-medium flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Spinner />}
            Convert {format.toUpperCase()}
          </button>
        </div>
      </div>
      <VideoPreview info={videoInfo} loading={infoLoading} />
    </>
  );
};

export default ConverterCard;
