# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files, lock file, and npmrc
COPY package*.json ./
COPY .npmrc ./
COPY angular.json ./
COPY tsconfig*.json ./

# Install dependencies (using --legacy-peer-deps to handle peer dependency conflicts)
# Try npm ci first, fallback to npm install if lock file is out of sync
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS final

# Copy built app to nginx
COPY --from=build /app/dist/workflow-client/browser /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]










