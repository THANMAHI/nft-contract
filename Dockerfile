FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies (needed for node-gyp & hardhat)
RUN apk add --no-cache python3 make g++ git

# Copy package files first (layer caching)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the project
COPY . .

# Compile contracts
RUN npx hardhat compile

# Default command = run test suite
CMD ["npx", "hardhat", "test"]
