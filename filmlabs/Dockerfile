# Use Node.js 20 as Next.js 15 strongly prefers it
FROM node:20-alpine

# Install essential build tools needed for native dependencies
RUN apk add --no-cache python3 make g++

# Set the working directory inside the container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies 
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Generate the Prisma client required for database access
RUN npx prisma generate

# --- ADDED: Dummy environment variables for the build phase ---
# This prevents Next.js from crashing when it tries to pre-render pages
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV NEXTAUTH_SECRET="dummy_secret"
ENV NEXTAUTH_URL="http://localhost:3000"
ENV TMDB_API_KEY="dummy_key"
ENV PASSWORD_PEPPER="dummy_pepper"

# Build the Next.js application for production
RUN npm run build

# Expose the internal port (matches the compose file)
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "run", "start"]