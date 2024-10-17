require('dotenv').config()
import restify from "restify";
import router from "./lib/router";
import mongoose from "mongoose";

export const server = restify.createServer({
  handleUncaughtExceptions: true,
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log('MongoDB connected...');
  }).catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });

const portNumber = process.env.PORT || 8100;
/// HANDLE CORS ISSUE
server.use(restify.plugins.fullResponse());
server.use(restify.plugins.bodyParser({ mapParams: true }));
server.use(restify.plugins.queryParser({ mapParams: true }));
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods", "*");
  return next();
});

server.get("/api/v1/ping", (req, res, next) => {
  res.send(200, "ping");
});

router.ai.applyRoutes(server);
router.shopify.applyRoutes(server);
server.listen(portNumber, function () {
  console.log("%s listening at %s", server.name, server.url);
});
