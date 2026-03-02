FROM node:22-alpine

WORKDIR /app

# Install nodemon globally so we can use it to watch files
RUN npm install -g nodemon

# Copy package files and prisma schema first
COPY package*.json ./
COPY prisma ./prisma/

# Install local dependencies
RUN npm install

# Generate Prisma Client (Bakes it into the image)
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

EXPOSE 5000
EXPOSE 5555

# Use nodemon to run the app. It watches for file changes.
CMD ["nodemon", "index.js"]