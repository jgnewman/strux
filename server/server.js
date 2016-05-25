import express from 'express';
import http from 'http';
import path from 'path';
import SocketPool from './socketpool';
import config from '../gulpconfig';

const app = express();
const server = http.Server(app);
const socketPool = new SocketPool(server);

/*
 * Serve all assets files statically.
 */
app.use(express.static('assets'));

/*
 * Serve the index file on the / route.
 */
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../', config.index));
});

/*
 * Catch all other routes and redirect to the index file
 * if the user wants to use browserHistory with React.
 */
if (config.useBrowserHistory) {
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../', config.index));
  });
}

/*
 * Establish a websocket connection and log various events.
 */
socketPool.onConnection((connection, pool) => {
  console.log(`A client connected via websocket | ${connection.id}`);

  // connection.on('event-name', payload => {
  //   connection.emit('return-event-name', 'some-value'); // send to one
  //   pool.emit('return-event-name', 'some-value'); // send to all
  // });

  connection.on('disconnect', () => {
    console.log(`A client disconnected from websocket | ${connection.id}`);
  });

});

/*
 * Export the server.
 */
export default server;
