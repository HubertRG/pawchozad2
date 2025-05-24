# syntax=docker/dockerfile:1.4

FROM scratch AS stage1

ADD alpine-minirootfs-3.21.3-x86_64.tar /

RUN --mount=type=cache,target=/var/cache/apk \
    apk add --update --no-cache nodejs npm \
    && rm -rf /var/cache/apk/*

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

COPY . .

FROM node:22-alpine AS stage2
LABEL authors="Hubert Gosik"

WORKDIR /app

COPY --from=stage1 /app /app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
   CMD node -e "require('http').get('http://localhost:3000/health', (res) => \
    process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

USER node

CMD ["node", "server.js"]