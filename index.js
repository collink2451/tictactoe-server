const express = require('express');
const app = express();
const passport = require('passport');
const session = require('express-session');
const GitHubStrategy = require('passport-github').Strategy;
const open = require('open')
const { auth } = require('express-openid-connect');
var url = require('url');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const scoreboardFile = 'scoreboard.json';
const dotenv = require('dotenv');
dotenv.config();

const {ensureAuthenticated} = require('./middleware');

const port = process.env.PORT || 3000
var jsonParser = bodyParser.json()

// Use Express to publish static HTML, CSS, and JavaScript files that run in the browser. 
app.use(express.static(__dirname + '/static'))

app.use(cors());

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
  if (!fs.existsSync(scoreboardFile)) {
    fs.writeFileSync(scoreboardFile, "[]");
  }

  fs.readFile(scoreboardFile, 'utf8', function (err, data) {
    if (err) {
      console.log('Error reading file:', err);
      return;
    }

    const scoreboard = JSON.parse(data);

    // Check if user has a score
    if (!scoreboard.find((user) => user.username === req.user.login)) {
      scoreboard.push({username: req.user.login, score: 1});
    } else {
      scoreboard.find((user) => user.username === req.user.login).score++;
    }

    fs.writeFile(scoreboardFile, JSON.stringify(scoreboard), function (err) {
      if (err) {
        console.log('Error writing file:', err);
      }
    });
    res.send(scoreboard);
    return;
  });
});

app.get("/api/scoreboard", (req, res) => {
  if (!fs.existsSync(scoreboardFile)) {
    fs.writeFileSync(scoreboardFile, "[]");
  }

  // Read the file
  fs.readFile(scoreboardFile, 'utf8', function (err, data) {
    if (err) {
      console.log('Error reading file:', err);
      return;
    }
    res.send(data);
  });
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
