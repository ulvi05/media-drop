import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 10;

const requests = new Map<string, number[]>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const windowMs = 60_000;

  const timestamps = requests.get(ip)?.filter((t) => now - t < windowMs) ?? [];

  if (timestamps.length >= 15) {
    return true;
  }

  timestamps.push(now);
  requests.set(ip, timestamps);

  return false;
}

function isValidVideoUrl(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    const allowedHosts = [
      "youtube.com",
      "www.youtube.com",
      "m.youtube.com",
      "youtu.be",

      "tiktok.com",
      "www.tiktok.com",
      "m.tiktok.com",
      "vt.tiktok.com",
    ];

    return allowedHosts.some(
      (domain) => host === domain || host.endsWith(`.${domain}`),
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    if (!isValidVideoUrl(url)) {
      return NextResponse.json(
        { error: "Only YouTube or TikTok URLs allowed" },
        { status: 400 },
      );
    }

    const cached = cache.get(url);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    const ytdlp = spawn("yt-dlp", ["--dump-json", "--no-download", url]);

    let stdout = "";
    let stderr = "";

    for await (const chunk of ytdlp.stdout) {
      stdout += chunk.toString();
    }

    for await (const chunk of ytdlp.stderr) {
      stderr += chunk.toString();
    }

    const exitCode = await new Promise<number>((resolve) => {
      ytdlp.on("close", resolve);
    });

    if (exitCode !== 0) {
      throw new Error(stderr || "yt-dlp failed");
    }

    const info = JSON.parse(stdout);

    const data = {
      title: info.title,
      duration: info.duration,
      thumbnail: info.thumbnail,
      platform: info.extractor_key,
    };

    cache.set(url, {
      data,
      timestamp: Date.now(),
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Failed to fetch video info",
        details: String(err),
      },
      { status: 500 },
    );
  }
}
