const Router = require("koa-router");
const db = require("../../db");
const router = new Router();

// Flag to control the behavior when the user already exists
const returnSuccessOnExistingUser = true;

router.post("/login", async (ctx) => {
  const { username } = ctx.request.body;

  try {
    // Check if the user already exists
    const userExists = await db.oneOrNone(
      "SELECT username FROM users WHERE username = $1",
      username
    );

    if (userExists) {
      // If returnSuccessOnExistingUser is true, return a success message
      if (returnSuccessOnExistingUser) {
        ctx.status = 200; // OK
        ctx.body = { message: "Login successful" };
      } else {
        ctx.status = 409; // Conflict
        ctx.body = { error: "Username already exists" };
      }
    } else {
      // Insert the new username into the users table
      await db.none("INSERT INTO users(username) VALUES($1)", username);
      ctx.status = 201; // Created
      ctx.body = { message: "User created successfully" };
    }
  } catch (error) {
    ctx.status = 500; // Internal Server Error
    ctx.body = { error: "Internal server error" };
  }
});

module.exports = router;
