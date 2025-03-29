const express = require('express');
const bodyParser = require('body-parser');
const reservationRouter = require('./requests/reservation');
const courtRouter = require('./requests/court');
const userRouter = require('./requests/user');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');

const knexConfig = require('./knexfile');
const knex = require('knex')(knexConfig.development);

const bcrypt = require('bcryptjs');

// Initialize express app
const app = express();
//allows connection from front end port
const cors = require('cors');
app.use(cors());
const port = 3000;

//


// Middleware
app.use(bodyParser.json());
app.use(passport.initialize());

app.get('/', (req, res) => {
  console.log("successfully connected")
  res.send('Backend is runningg 🚀');
});


const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'yourSecretKey'
};

// Passport JWT Strategy: Lookup user in the DB based on JWT payload
passport.use(new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
  try {
    const user = await knex('user').where({ id: jwt_payload.id }).first();
    if (user) {
      // Remove sensitive fields if necessary
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (err) {
    return done(err, false);
  }
}));

// Open route for testing JWT authentication
app.get('/success', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.send('Logged in successfully!');
});

// Informational route (redirect users to /user/login for login via POST)
app.get('/login', (req, res) => {
  res.send('Please login via POST at /user/login with your credentials.');
});

// Mount protected routes
app.use('/reservation', passport.authenticate('jwt', { session: false }), reservationRouter);
app.use('/court', passport.authenticate('jwt', { session: false }), courtRouter);

// Mount user routes (registration, login, profile)
app.use('/user', userRouter);

// Start server only if this module is executed directly
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;
