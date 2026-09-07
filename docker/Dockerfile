# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package manifests + postinstall script (needed during npm install)
COPY package.json .
COPY package-lock.json* ./
COPY scripts/sync-brand-emblems.mjs scripts/

# Install dependencies (postinstall syncs brand emblems into public/brands)
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Development server (bind 0.0.0.0 so host can reach HMR)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
