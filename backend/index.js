require("dotenv").config();
const Index = require("koa");
const logger = require("koa-logger");
const bodyParser = require("koa-bodyparser");
const cors = require("@koa/cors");
const testRoute = require("./routes/test/test");
const imageRoute = require("./routes/image/profile");


const app = new Index();

// Middleware
app.use(cors());
app.use(logger());
app.use(bodyParser());

// Routes
app.use(testRoute.routes());
app.use(imageRoute.routes());

// Server
const PORT = process.env.PORT || 56579;
app.listen(PORT, () => {
  console.log(`Serving at http://127.0.0.1:${PORT}/test`);
});
