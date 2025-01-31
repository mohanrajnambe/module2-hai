FROM node:22.9.0-slim

# Create app directory
WORKDIR /usr/src/app

# # Copy package.json and package-lock.json
# COPY package*.json ./

# Bundle app source
COPY . .

# Install app dependencies
RUN npm ci

# Build the TypeScript files
RUN npm run build

# Expose port 8080
EXPOSE 8080

# Start the app
CMD npm run start
