const Router = require("koa-router");
const db = require("../../db");
const router = new Router();

router.get("/challenges", async (ctx, next) => {
  try {
    const challenges = await db.any(
      "SELECT id, challenge_name, description, image_source FROM challenges"
    );
    ctx.status = 200; // OK
    ctx.body = { challenges: challenges };
  } catch (error) {
    ctx.status = 500; // Internal Server Error
    ctx.body = { error: "Internal server error" };
  }
});

module.exports = router;
