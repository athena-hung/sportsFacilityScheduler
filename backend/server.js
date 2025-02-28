const express = require('express');
const bodyParser = require('body-parser');
const reservationRouter = require('./requests/reservation'); 

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use('/reservation', reservationRouter);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
