FROM node:18

# Set working directory
WORKDIR /app

# Install dependencies and build the app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Install a lightweight static file server
RUN npm install -g serve

# Serve the build folder
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
