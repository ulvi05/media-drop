import { NextRequest, NextResponse } from "next/server";
import { spawn, exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

function isValidVideoUrl(url: string) {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  const tiktokRegex = /^(https?:\/\/)?(www\.)?tiktok\.com\/.+$/;
  return youtubeRegex.test(url) || tiktokRegex.test(url);
}

export async function POST(req: NextRequest) {
  try {
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

    const fileName = `media-${Date.now()}.${format === "mp4" ? "mp4" : "mp3"}`;

    if (format === "mp3") {
      const args = [
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
      ];

      const ytdlp = spawn("yt-dlp", args);

      const stream = new ReadableStream({
        start(controller) {
          ytdlp.stdout.on("data", (chunk) => {
            try {
              controller.enqueue(chunk);
            } catch {}
          });
          ytdlp.stdout.on("end", () => {
            try {
              controller.close();
            } catch {}
          });
          ytdlp.stderr.on("data", (d) =>
            console.error("yt-dlp:", d.toString()),
          );
          ytdlp.on("error", (err) => {
            try {
              controller.error(err);
            } catch {}
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
    } else {
      // MP4: diske indir, stream et, sil
      const dir = path.join(process.cwd(), "public", "downloads");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const outputPath = path.join(dir, fileName);

      await execAsync(
        `yt-dlp -f "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best" --merge-output-format mp4 -o "${outputPath}" "${url}"`,
      );

      if (!fs.existsSync(outputPath)) {
        throw new Error("File could not be created");
      }

      // RAM'e yüklemek yerine stream et
      const fileStream = fs.createReadStream(outputPath);

      const stream = new ReadableStream({
        start(controller) {
          fileStream.on("data", (chunk) => {
            try {
              controller.enqueue(chunk);
            } catch {}
          });
          fileStream.on("end", () => {
            try {
              controller.close();
            } catch {}
            fs.unlink(outputPath, () => {}); // stream bittikten sonra sil
          });
          fileStream.on("error", (err) => {
            try {
              controller.error(err);
            } catch {}
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
    }
  } catch (err) {
    console.error("ERROR:", err);
    return NextResponse.json(
      { error: "Conversion failed", details: String(err) },
      { status: 500 },
    );
  }
}
