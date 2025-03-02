const express = require('express');
const bodyParser = require('body-parser');
const reservationRouter = require('./requests/reservation');
const courtRouter = require('./requests/court');

// Initialize express app
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/reservation', reservationRouter);
app.use('/court', courtRouter);
// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
