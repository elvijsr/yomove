const Router = require("koa-router");
const db = require("../../db");
const router = new Router();

router.get("/me", async (ctx, next) => {
  try {
    const result = await db.any("SELECT * FROM users");
    ctx.body = { data: result };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: "Error retrieving data from the database" };
  }
});


module.exports = router;