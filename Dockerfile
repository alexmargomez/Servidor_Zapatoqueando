FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy server code
COPY server.js ./
COPY public ./public

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
