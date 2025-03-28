# Documentation

## API Documentation

The API documentation is available in the `api_docs.md` file.

## Database Schema

The database schema is available in the `schema.md` file.

# Backend Setup

## Docker Setup (Recommended)

### Install Docker Desktop

1. Download and install Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
2. Start Docker Desktop and ensure it's running

### Environment Setup

Before running Docker, you need to create two `.env` files:

1. In the `/backend` directory, create a `.env` file with:

```bash
POSTGRESDB_USER=postgres
POSTGRESDB_ROOT_PASSWORD=123456
POSTGRESDB_DATABASE=court-reservation
POSTGRESDB_LOCAL_PORT=5433
POSTGRESDB_DOCKER_PORT=5432

NODE_LOCAL_PORT=3000
NODE_DOCKER_PORT=3000
```

2. In the `/backend/court-app` directory, create a `.env` file with:

```bash
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=123456
DB_NAME=court-reservation
DB_PORT=5432

NODE_DOCKER_PORT=3000
```

You can use the `sample.env` files in the same directories as templates. Simply rename them to `.env` and modify the values as needed.

### Run with Docker Compose

Navigate to the `/backend` directory and run:

```bash
docker compose up
```

This will create and start all necessary containers including the PostgreSQL database and Node.js application.

### Database Migration and Seeding

To reset, migrate, and seed the database, run:

```bash
docker exec backend-app-1 sh -c "node dbSetup/deleteAllTables.js && npx knex migrate:latest && npx knex seed:run"
```

Note: The container name might vary. To find your container name, run:

```bash
docker ps
```

Look for a container with a name similar to `backend-app-1` in the output.

## Manual Setup Instructions

### Install NodeJS

Using homebrew on mac (how to install homebrew [here](https://brew.sh/)):

```bash
brew install node
```

On Windows, download the installer from [nodejs.org](https://nodejs.org/en/download/)

### Setup Database

Install PostgreSQL (see [here](https://www.postgresql.org/download/))

Create a database called 'courtreservation' (instructions [here](https://www.postgresql.org/docs/current/app-createdb.html))

Create a file called .env in the `backend` folder and add the following:

```bash
DB_NAME=courtreservation
DB_USER=postgres
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=5432
```

### Install Dependencies

Within the backend folder, run npm install to install the dependencies.

```bash
npm install
```

```bash
npm install -g knex
```

```bash
knex migrate:latest
```

```bash
knex seed:run
```

### Navigate to the Project and Start the Server

```
npm start
```

Now, the server will run at http://localhost:3000/

Make API requests to the server to test (I recommend using [Postman](https://www.postman.com/))

### Running Tests

In the backend folder, run the following command to execute the test suite:

```bash
npm test
```

This command will run all the automated tests for the backend.
