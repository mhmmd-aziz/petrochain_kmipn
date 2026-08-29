FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose hardhat local node port
EXPOSE 8545

# Run the hardhat node
CMD ["npx", "hardhat", "node"]
