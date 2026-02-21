# Use Node.js 18 (or 20) as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

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