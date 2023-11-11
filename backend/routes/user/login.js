const Router = require("koa-router");
const db = require("../../db");
const router = new Router();

// Flag to control the behavior when the user already exists
const returnSuccessOnExistingUser = true;

router.post("/login", async (ctx) => {
  const { username } = ctx.request.body;

  // Check if username is provided and not empty
  if (!username || username.trim() === "") {
    ctx.status = 400;
    ctx.body = { error: "Username cannot be empty" };
    return;
  }

  try {
    // Check if the user already exists
    const userExists = await db.oneOrNone(
      "SELECT username FROM users WHERE username = $1",
      username.trim()
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
      // Fetch a random avatar_id
      const avatar = await db.one(
        "SELECT id FROM pictures WHERE type = 0 ORDER BY RANDOM() LIMIT 1"
      );

      // Insert the new username into the users table with the avatar_id
      await db.none("INSERT INTO users(username, avatar_id) VALUES($1, $2)", [
        username.trim(),
        avatar.id,
      ]);
      ctx.status = 201; // Created
      ctx.body = { message: "User created successfully with avatar" };
    }
  } catch (error) {
    ctx.status = 500; // Internal Server Error
    ctx.body = { error: "Internal server error" };
  }
});

module.exports = router;
