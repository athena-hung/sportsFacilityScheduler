## Setup Instructions

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

### API Documentation

The API documentation is available in the `api_docs.md` file.

### Database Schema

The database schema is available in the `schema.md` file.