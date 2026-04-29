const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const db = require('./db');
const LeaderBoardModel = require('./models/LeaderBoardModel');
const { ensureAuthenticated } = require('./middleware');
db.connect();

const port = process.env.PORT || 3000;
const jsonParser = bodyParser.json();

app.use(express.static(__dirname + '/static'));

app.post('/api/scoreboard', jsonParser, ensureAuthenticated, async (req, res) => {
  await LeaderBoardModel.incrementScore(req.user.login);
  const leaderboard = await LeaderBoardModel.findAll();
  res.send(leaderboard);
});

app.get('/api/scoreboard', async (req, res) => {
  const leaderboard = await LeaderBoardModel.findAll();
  res.send(leaderboard);
});

app.use((request, response) => {
  response.type('text/plain');
  response.status(404);
  response.send('404 - Not Found');
});

app.use((err, request, response, next) => {
  console.error(err.message);
  response.type('text/plain');
  response.status(500);
  response.send('500 - Server Error');
});

app.listen(port, () => console.log(
  `Express started at "http://localhost:${port}"\n` +
  `press Ctrl-C to terminate.`
));
