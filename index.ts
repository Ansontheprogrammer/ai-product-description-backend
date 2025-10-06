import restify from "restify";
import corsMiddleware from "restify-cors-middleware2";
import router from "./lib/router";
import bunyan from "bunyan";
import * as dotenv from "dotenv";

/// Load enviroment variables.
dotenv.config();

const log = bunyan.createLogger({
  name: "restify",
  level: "fatal", // change to "error" or "fatal" to suppress warnings
  serializers: bunyan.stdSerializers, // prevents dumping huge objects
});

export const server = restify.createServer({
  handleUncaughtExceptions: true,
  log, // <— prevents restify from attaching a Bunyan logger
});

// Configure CORS
const cors = corsMiddleware({
  preflightMaxAge: 5, // optional
  origins: ["*"], // allow all origins, or restrict to your frontend
  allowHeaders: ["Authorization", "Content-Type", "X-Requested-With"],
  exposeHeaders: ["Authorization"],
});

// Must come **before** other middleware
server.pre(cors.preflight);
server.use(cors.actual);

// Other middlewares
server.use(restify.plugins.fullResponse());
server.use(restify.plugins.bodyParser({ mapParams: true }));
server.use(restify.plugins.queryParser({ mapParams: true }));
server.use(
  restify.plugins.throttle({
    burst: 100, // allow up to 100 requests at once (burst)
    rate: 0.027, // roughly 100 requests/hour (100 / 3600s = 0.027 req/s)
    ip: true, // limit by IP address
  })
);
// Routes
server.get("/api/v1/ping", (req, res, next) => {
  res.send(200, "ping");
});

router.ai.applyRoutes(server);
router.description.applyRoutes(server);
router.shopify.applyRoutes(server);
router.auth.applyRoutes(server);
router.payments.applyRoutes(server);

const portNumber = process.env.PORT || 8100;
server.listen(portNumber, function () {
  console.log("%s listening at %s", server.name, server.url);
});
