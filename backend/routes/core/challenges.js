const Router = require("koa-router");
const router = new Router();

router.get("/challenges", (ctx, next) => {
  ctx.body = { message: "Hello world" };
});

module.exports = router;
