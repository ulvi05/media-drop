import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 10;

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    const { stdout } = await execAsync(
      `yt-dlp --dump-json --no-download "${url}"`,
    );

    const info = JSON.parse(stdout);

    const data = {
      title: info.title,
      duration: info.duration,
      thumbnail: info.thumbnail,
      platform: info.extractor_key,
    };

    cache.set(url, { data, timestamp: Date.now() });

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch video info", details: String(err) },
      { status: 500 },
    );
  }
}
