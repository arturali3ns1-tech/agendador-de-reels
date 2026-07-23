FROM node:20-alpine

WORKDIR /app

# Copy package manifests and install dependencies
COPY package*.json ./
RUN npm ci

# Copy application source
COPY . .

# Build application
RUN npm run build

ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "run", "start"]
