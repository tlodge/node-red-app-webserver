import https from 'https';
import express from 'express';
import ipclisten from './comms/ipc';
import { lookup } from './datastore';
import databox from 'node-databox';
import Sender from './comms/websocket';

console.log("getting credentials");
const credentials = databox.GetHttpsCredentials();
console.log("got credentials");
const app = express();


//var HTTPS_SERVER_CERT = process.env.HTTPS_SERVER_CERT || '';
//var HTTPS_SERVER_PRIVATE_KEY = process.env.HTTPS_SERVER_PRIVATE_KEY || '';


//var credentials = {
//	 key:  HTTPS_SERVER_PRIVATE_KEY,
//	 cert: HTTPS_SERVER_CERT,
//};

app.use('/', express.static("static"));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

const server = https.createServer(credentials, app);

let PORT = 8080

if (process.argv.length > 2) {
  PORT = parseInt(process.argv[2]);
}

console.log("initing websockets");
//websocketinit('databox', server);
const sender = new Sender(server);
console.log("initing ipc");
ipclisten(sender);

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/ui/comms/channelID', function (req, res) {
  console.log("seen an incoming comms request!!");
  res.send({ channelID: 'webapp' });
});

app.get('/ui/init/:id', function (req, res) {

  console.log("seen an init for id " + req.params.id);
  const result = lookup(req.params.id);

  if (result) {
    res.send({ success: true, init: result });
  }
  else {
    res.send({ success: false });
  }
});

app.get('/ui', function (req, res) {
  console.log("seen a call to ui, sending back index!");
  res.render('index');
});



//redirect any failed routes to root
app.use(function (req, res) {
  console.log("failed route - redirecting to /")
  res.redirect("/");
});

console.log("STARTING SERVER AND LISTENING ON PORT " + PORT);
server.listen(PORT);
