FROM node:20.10.0-alpine AS builder
ENV NODE_ENV production
WORKDIR /app

# copy package.json first to avoid unnecessary npm install when other files change
# Unless packages change, this layer will be cached
COPY package.json package-lock.json /app/

RUN npm install --production

# Copy app files
COPY src /app/src
COPY vite.config.js index.html /app/

# Build the app
RUN npm run build

# Bundle static assets with nginx
FROM nginx:1.25.3-alpine
ENV NODE_ENV production
COPY --from=builder /app/dist /usr/share/nginx/html
