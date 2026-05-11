# Media Drop

Media Drop is a fast, lightweight media conversion tool for turning YouTube and TikTok videos into MP3 or MP4 downloads. It is built to feel like a simple SaaS product: clean workflow, instant feedback, and no unnecessary friction.

## What it does

- Paste a supported video URL
- Preview the media before converting
- Download as MP3 or MP4
- Keep the flow clean with no signup, no ads, no extra steps

## Why it feels good to use

- Fast metadata lookup before conversion
- Simple two-format interface
- Streaming-based download flow
- Clean UI built with Next.js and Tailwind CSS

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- `yt-dlp` for metadata and conversion
- `ffmpeg` for audio and video processing

## Requirements

For local development, make sure these are installed and available on your PATH:

- Node.js 22+
- pnpm 9+
- `yt-dlp`
- `ffmpeg`

If you use Docker, the image already includes `yt-dlp` and `ffmpeg`.

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

## How It Works

1. Paste a YouTube or TikTok link.
2. The app calls `/api/info` to fetch the title, duration, thumbnail, and platform data.
3. Choose MP3 or MP4.
4. The app calls `/api/convert` and streams the converted file back as a download.

## API Routes

### `POST /api/info`

Fetches metadata for a supported video URL.

Request body:

```json
{
  "url": "https://www.youtube.com/watch?v=..."
}
```

Response example:

```json
{
  "title": "Example Video",
  "duration": 123,
  "thumbnail": "https://...",
  "platform": "Youtube"
}
```

### `POST /api/convert`

Converts the URL to MP3 or MP4 and returns the file as a streamed download.

Request body:

```json
{
  "url": "https://www.youtube.com/watch?v=...",
  "format": "mp3"
}
```

Supported formats:

- `mp3`
- `mp4`

## Docker

Build the image:

```bash
docker build -t media-drop .
```

Run it:

```bash
docker run -p 3000:3000 media-drop
```

## Notes

- Only YouTube and TikTok URLs are supported.
- MP4 conversions are written temporarily to `public/downloads/` and removed after streaming.
- The app uses the App Router manifest setup in `app/` for icons and install metadata.
