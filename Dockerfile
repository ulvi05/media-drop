FROM node:22-slim

RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python-is-python3 \
    curl \
    build-essential \
    git \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm

WORKDIR /app

RUN echo "strict-peer-dependencies=false" > .npmrc && \
    echo "auto-install-peers=false" >> .npmrc && \
    echo "legacy-peer-deps=true" >> .npmrc && \
    echo "node-linker=hoisted" >> .npmrc

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --no-frozen-lockfile --loglevel=debug

COPY . . 

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN pnpm run build

EXPOSE 3000
ENV PORT=3000

CMD ["pnpm", "start"]