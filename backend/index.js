require("dotenv").config();
const Index = require("koa");
const logger = require("koa-logger");
const bodyParser = require("koa-bodyparser");
const cors = require("@koa/cors");
const testRoute = require("./routes/test/test");
const imageRoute = require("./routes/image/profile");
const loginRoute = require("./routes/user/login");
const meRoute = require("./routes/user/me");
const challengesRoute = require("./routes/core/challenges");
const lobbiesRoute = require("./routes/core/lobbies");
const scoresRoute = require("./routes/core/scores");

const app = new Index();

// Middleware
app.use(cors());
app.use(logger());
app.use(bodyParser());

// Routes
app.use(testRoute.routes());
app.use(imageRoute.routes());
app.use(loginRoute.routes());
app.use(meRoute.routes());
app.use(challengesRoute.routes());
app.use(lobbiesRoute.routes());
app.use(scoresRoute.routes());

// Server
const PORT = process.env.PORT || 56579;
app.listen(PORT, () => {
  console.log(`Serving at http://127.0.0.1:${PORT}/test`);
});
