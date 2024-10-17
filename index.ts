import restify from "restify";
import router from "./lib/router";

export const server = restify.createServer({
  handleUncaughtExceptions: true,
});

const portNumber = process.env.PORT || 8100;
/// HANDLE CORS ISSUE
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods", "*");
  return next();
});
server.use(restify.plugins.fullResponse());
server.use(restify.plugins.bodyParser({ mapParams: true }));
server.use(restify.plugins.queryParser({ mapParams: true }));

server.get("/api/v1/ping", (req, res, next) => {
  res.send(200, "ping");
});

router.ai.applyRoutes(server);
router.shopify.applyRoutes(server);
server.listen(portNumber, function () {
  console.log("%s listening at %s", server.name, server.url);
});
