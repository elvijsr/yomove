const Router = require("koa-router");
const db = require("../../db");
const router = new Router();

// Flag to control the behavior when the user already exists
const returnSuccessOnExistingUser = true;

router.post("/login", async (ctx) => {
  const { username } = ctx.request.body;

  // Check if username is provided and not empty
  if (!username || username.trim() === "") {
    ctx.status = 400; // Bad Request
    ctx.body = { error: "Username cannot be empty" };
    return; // Stop further execution
  }

  try {
    // Check if the user already exists
    const user = await db.oneOrNone(
      "SELECT id FROM users WHERE username = $1",
      username.trim()
    );

    if (user) {
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

      // Start a transaction
      await db.tx(async (t) => {
        // Insert the new username into the users table with the avatar_id
        const insertUser = t.one(
          "INSERT INTO users(username, avatar_id) VALUES($1, $2) RETURNING id",
          [username.trim(), avatar.id]
        );

        // Use the returned user id to insert into user_avatars table
        const insertUserAvatar = insertUser.then((user) => {
          return t.none(
            "INSERT INTO user_avatars(user_id, avatar_id) VALUES($1, $2)",
            [user.id, avatar.id]
          );
        });

        return t.batch([insertUser, insertUserAvatar]);
      });

      ctx.status = 201; // Created
      ctx.body = { message: "User created successfully with avatar" };
    }
  } catch (error) {
    // Handle unique violation or other errors
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
