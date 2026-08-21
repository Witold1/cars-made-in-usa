# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if it exists)
COPY package.json .
COPY package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose Vite's default port
EXPOSE 5173

# Development server (bind 0.0.0.0 so host can reach HMR)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
