FROM node:18-alpine AS builder

# RUN apk update
# RUN apk --no-cache add make gcc g++ --virtual .builds-deps build-base python3 musl-dev openssl-dev

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npm run build

FROM node:18-alpine

# RUN apk update
# RUN apk --no-cache add make gcc g++ --virtual .builds-deps build-base python3 musl-dev openssl-dev

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist

COPY .env.default .env
COPY templates ./templates

CMD ["npm", "run", "start"]