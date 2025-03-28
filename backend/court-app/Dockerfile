FROM node:14

WORKDIR /court-app

# Copy package files first to leverage Docker cache for dependency installation
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code into the container
COPY . .

# Expose the port the application will run on
EXPOSE 3000

# Run Knex migrations and seed the database, then start the app (as per your README instructions)
# CMD ["sh", "-c", "npx knex migrate:latest && npx knex seed:run && npm start"]
CMD ["sh", "-c", "npm start"]

# CMD ["sh", "-c", "node dbSetup/deleteAllTables.js && npx knex migrate:latest && npx knex seed:run && npm start"]
