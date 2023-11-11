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

router.post("/submit-results", async (ctx) => {
  try {
    // Extracting the username from the header
    const username = ctx.get("X-Username");
    const { challenge_id, lobby_id, score } = ctx.request.body;

    // Validate incoming data
    if (
      !username ||
      challenge_id === undefined ||
      lobby_id === undefined ||
      score === undefined
    ) {
      ctx.status = 400; // Bad Request
      ctx.body = { error: "Missing required fields" };
      return;
    }

    // Look up the user ID based on the username
    const user = await db.oneOrNone(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );

    // If user not found, return an error
    if (!user) {
      ctx.status = 404; // Not Found
      ctx.body = { error: "User not found" };
      return;
    }

    // Insert the result into the database with the user's ID
    await db.none(
      "INSERT INTO results (user_id, challenge_id, lobby_id, score) VALUES ($1, $2, $3, $4)",
      [user.id, challenge_id, lobby_id, score]
    );

    ctx.status = 201; // Created
    ctx.body = { message: "Result submitted successfully" };
  } catch (error) {
    // Error handling
    console.error(error);
    ctx.status = 500; // Internal Server Error
    ctx.body = { error: "Internal server error" };
  }
});

module.exports = router;
