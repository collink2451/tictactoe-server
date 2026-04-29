const express = require('express');
const app = express();
const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github').Strategy;
const open = require('open')
const { auth } = require('express-openid-connect');
var url = require('url');
const bodyParser = require('body-parser');
const fs = require('fs');
const scoreboardFile = 'scoreboard.json';
const dotenv = require('dotenv');
const db = require('./db');
const LeaderBoardModel = require('./models/LeaderBoardModel');
dotenv.config();
db.connect();

const {ensureAuthenticated} = require('./middleware');

const port = process.env.PORT || 3000
var jsonParser = bodyParser.json()

// Use Express to publish static HTML, CSS, and JavaScript files that run in the browser. 
app.use(express.static(__dirname + '/static'))

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport setup
passport.use(new GitHubStrategy({
    clientID: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    callbackURL: process.env.OAUTH_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    console.log('GitHub profile:', profile);
    profile.accessToken = accessToken;
    return done(null, profile);
  }
));

passport.serializeUser(function(user, done) {
  // Serialize the user id into the session
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  // Deserialize the user from the session
  done(null, obj);
});

// Routes
app.get('/api/auth', (req, res) => {
  const redirectUrl = req.query.redirectUrl || '/';

  passport.authenticate('github', { callbackURL: process.env.OAUTH_CALLBACK_URL + '?redirectUrl=' + encodeURIComponent(redirectUrl) })(req, res);
});

app.get('/api/auth/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
    const redirectUrl = req.query.redirectUrl || '/';

    res.redirect(`${redirectUrl}?accessToken=${req.user.accessToken}`);
  }
);

app.post('/api/scoreboard', jsonParser, ensureAuthenticated, async (req, res) => {
  const user = await LeaderBoardModel.findOne({ username: req.user.login });

  if (user) {
    user.score++;
    await user.save();
  } else {
    await LeaderBoardModel.create({
      username: req.user.login,
      score: 1
    });
  }

  const leaderboard = await LeaderBoardModel.find({}).lean();

  res.send(leaderboard);
});

app.get("/api/scoreboard", async (req, res) => {
  const leaderboard = await LeaderBoardModel.find({}).lean();

  res.send(leaderboard);
});

// Custom 404 page.
app.use((request, response) => {
  response.type('text/plain')
  response.status(404)
  response.send('404 - Not Found')
})

// Custom 500 page.
app.use((err, request, response, next) => {
  console.error(err.message)
  response.type('text/plain')
  response.status(500)
  response.send('500 - Server Error')
})

app.listen(port, () => console.log(
  `Express started at \"http://localhost:${port}\"\n` +
  `press Ctrl-C to terminate.`)
)
