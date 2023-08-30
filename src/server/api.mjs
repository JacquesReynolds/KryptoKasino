import express from 'express';
import bodyParser from 'body-parser';
import { generateKey } from 'crypto';

const app = express();
app.use(bodyParser.json());

const games = [];

function createEndpoint(playerId) {
  return `/game/${playerId}`;
}

app.post('/start', (req, res) => {
  const game = newGame(req.body);
  games[game.id] = game;
  res.send({ gameId: game.id });
});

app.post('/join/:gameId', (req, res) => {
  const game = games[req.params.gameId];
  const player = joinGame(game, req.body);
  const playerId = player.id;
  game.players[playerId].endpoint = createEndpoint(playerId);
  games[game.id] = game;
  res.send({ playerId: playerId, endpoint: game.players[playerId].endpoint });
});

app.post('/:endpoint/play', (req, res) => {
  const playerId = getPlayerIdFromEndpoint(req.params.endpoint);
  const game = games[getGameIdFromEndpoint(req.params.endpoint)];
  const player = game.players[playerId];
  const result = newGame(game, player, req.body);
  games[game.id] = game;
  res.send(result);
});

function getPlayerIdFromEndpoint(endpoint) {
  return endpoint.split('/')[2];
}

function getGameIdFromEndpoint(endpoint) {
  return endpoint.split('/')[2];
}

export default app;
