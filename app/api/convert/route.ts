import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";

const requests = new Map<string, number[]>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const windowMs = 60_000;

  const timestamps = requests.get(ip)?.filter((t) => now - t < windowMs) ?? [];

  if (timestamps.length >= 10) {
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

    const { url, format } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    if (!isValidVideoUrl(url)) {
      return NextResponse.json(
        { error: "Only YouTube or TikTok URLs allowed" },
        { status: 400 },
      );
    }

    const extension = format === "mp4" ? "mp4" : "mp3";

    const fileName = `media-${Date.now()}.${extension}`;

    if (format === "mp3") {
      const ytdlp = spawn("yt-dlp", [
        "--extract-audio",
        "--audio-format",
        "mp3",
        "--audio-quality",
        "0",
        "--postprocessor-args",
        "ffmpeg:-b:a 320k",
        "-o",
        "-",
        url,
      ]);

      const stream = new ReadableStream({
        start(controller) {
          ytdlp.stdout.on("data", (chunk) => {
            controller.enqueue(chunk);
          });

          ytdlp.stdout.on("end", () => {
            controller.close();
          });

          ytdlp.stderr.on("data", (data) => {
            console.error("yt-dlp:", data.toString());
          });

          ytdlp.on("error", (err) => {
            controller.error(err);
          });
        },

        cancel() {
          ytdlp.kill();
        },
      });

      return new NextResponse(stream, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      });
    }

    const tempDir = os.tmpdir();
    const outputPath = path.join(tempDir, fileName);

    const ytdlp = spawn("yt-dlp", [
      "-f",
      "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best",
      "--merge-output-format",
      "mp4",
      "-o",
      outputPath,
      url,
    ]);

    await new Promise<void>((resolve, reject) => {
      let stderr = "";

      ytdlp.stderr.on("data", (d) => {
        stderr += d.toString();
      });

      ytdlp.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(stderr || "yt-dlp failed"));
        }
      });

      ytdlp.on("error", reject);
    });

    if (!fs.existsSync(outputPath)) {
      throw new Error("File could not be created");
    }

    const fileStream = fs.createReadStream(outputPath);

    const stream = new ReadableStream({
      start(controller) {
        fileStream.on("data", (chunk) => {
          controller.enqueue(chunk);
        });

        fileStream.on("end", () => {
          controller.close();

          fs.unlink(outputPath, () => {});
        });

        fileStream.on("error", (err) => {
          controller.error(err);

          fs.unlink(outputPath, () => {});
        });
      },

      cancel() {
        fileStream.destroy();

        fs.unlink(outputPath, () => {});
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    console.error("ERROR:", err);

    return NextResponse.json(
      {
        error: "Conversion failed",
        details: String(err),
      },
      { status: 500 },
    );
  }
}
