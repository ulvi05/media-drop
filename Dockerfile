FROM node:22-slim

RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python-is-python3 \
    curl \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./

RUN pnpm config set strict-peer-dependencies false
RUN pnpm install

COPY . .    

RUN pnpm run build

EXPOSE 3000

ENV PORT=3000
CMD ["pnpm", "start"]