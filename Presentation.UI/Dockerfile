# -------- BUILD STAGE --------
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./
COPY .npmrc ./
COPY angular.json ./
COPY tsconfig*.json ./

RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy full source
COPY . .

# Build production
RUN npm run build


# -------- RUNTIME STAGE --------
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ⚠ IMPORTANT: adjust this path to match your dist folder
COPY --from=build /app/dist/medipos/browser /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
