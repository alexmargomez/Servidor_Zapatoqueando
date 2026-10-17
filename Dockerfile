FROM node:20-alpine

RUN apk add --no-cache openssl

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and prisma schema, then install dependencies
COPY package*.json ./
COPY prisma ./prisma
RUN npm install

# Copy TypeScript config, source and public assets
COPY tsconfig.json ./
COPY src ./src
COPY public ./public

# Generate Prisma Client and compile TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
