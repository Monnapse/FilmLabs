# Use Node.js 20 as Next.js 15 strongly prefers it
FROM node:20-alpine

# Install essential build tools needed for native dependencies (Prisma, bcrypt, etc.)
RUN apk add --no-cache python3 make g++

# Set the working directory inside the container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies 
# Using --legacy-peer-deps prevents installation from failing if there are strict React version mismatches
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Generate the Prisma client required for database access
RUN npx prisma generate

# Build the Next.js application for production
RUN npm run build

# Expose the internal port (matches the compose file)
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "run", "start"]