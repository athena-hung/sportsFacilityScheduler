const express = require('express');
const bodyParser = require('body-parser');
const reservationRouter = require('./requests/reservation');
const courtRouter = require('./requests/court');
const userRouter = require('./requests/user');
const courtTypeRouter = require('./requests/court_type');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');

const knexConfig = require('./knexfile');
const knex = require('knex')(knexConfig.development);

const bcrypt = require('bcryptjs');

const app = express();
const cors = require('cors');
app.use(cors());
const port = 3001;



app.use(bodyParser.json());
app.use(passport.initialize());

app.get('/', (req, res) => {
  console.log("successfully connected")
  res.send('Backend is runningg 🚀');
});


const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'yourSecretKey',
  jsonWebTokenOptions: {
    expiresIn: '30d'
  }
};

passport.use(new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
  try {
    const user = await knex('user').where({ id: jwt_payload.id }).first();
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (err) {
    return done(err, false);
  }
}));

app.get('/success', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.send('Logged in successfully!');
});

app.get('/login', (req, res) => {
  res.send('Please login via POST at /user/login with your credentials.');
});

app.use('/reservation', passport.authenticate('jwt', { session: false }), reservationRouter);
app.use('/court', passport.authenticate('jwt', { session: false }), courtRouter);
app.use('/court-type', passport.authenticate('jwt', { session: false }), courtTypeRouter);

app.use('/user', userRouter);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;
