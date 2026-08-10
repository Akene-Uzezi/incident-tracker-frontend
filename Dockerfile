FROM node:24-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

FROM node:24-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

ARG NEXT_PUBLIC_apiurl

ARG NEXT_PUBLIC_deathreport

ENV NEXT_PUBLIC_apiurl=$NEXT_PUBLIC_apiurl

ENV NEXT_PUBLIC_deathreport=$NEXT_PUBLIC_deathreport

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]


