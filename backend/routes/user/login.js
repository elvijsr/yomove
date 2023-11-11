// login.js
const Router = require("koa-router");
const db = require("../../db");
const router = new Router();

router.post("/login", async (ctx) => {
  const { username } = ctx.request.body;

  try {
    // Insert the new username into the users table
    await db.none("INSERT INTO users(username) VALUES($1)", username);
    ctx.status = 201; // Created
    ctx.body = { message: "User created successfully" };
  } catch (error) {
    if (error.code === "23505") {
      ctx.status = 409; // Conflict
      ctx.body = { error: "Username already exists" };
    } else {
      ctx.status = 500; // Internal Server Error
      ctx.body = { error: "Internal server error" };
    }
  }
});

module.exports = router;
