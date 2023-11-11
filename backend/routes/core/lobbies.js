const Router = require("koa-router");
const db = require("../../db");
const router = new Router();

// Helper function to generate a random 5-digit number as a string
function generateRandomLobbyName() {
  return Math.floor(Math.random() * 90000) + 10000;
}

router.post("/create-lobby", async (ctx, next) => {
  try {
    const { challenge_id } = ctx.request.body;
    const username = ctx.get("X-Username");

    if (challenge_id === undefined || !username) {
      ctx.status = 400; // Bad Request
      ctx.body = { error: "Invalid challenge_id or username" };
      return;
    }

    const user = await db.one("SELECT id FROM users WHERE username = $1", [
      username,
    ]);

    if (!user) {
      ctx.status = 404; // Not Found
      ctx.body = { error: "User not found" };
      return;
    }

    let lobbyName;
    let unique = false;
    let attempt = 0;

    while (!unique && attempt < 10) {
      attempt++;
      lobbyName = generateRandomLobbyName().toString();

      try {
        await db.none(
          "INSERT INTO lobbies (lobby_name, created_by, current_challenge, is_active) VALUES ($1, $2, $3, $4)",
          [lobbyName, user.id, challenge_id, true]
        );
        unique = true;
      } catch (error) {
        if (error.code === "23505") {
          // Unique violation error code
          unique = false;
        } else {
          throw error; // If the error is not a unique violation, throw it
        }
      }
    }

    if (!unique) {
      ctx.status = 500; // Internal Server Error
      ctx.body = { error: "Unable to generate a unique lobby name" };
      return;
    }

    // Return the name of the newly created lobby
    ctx.status = 201; // Created
    ctx.body = { lobbyName: lobbyName };
  } catch (error) {
    console.error(error);
    if (error.code === "P0002") {
      ctx.status = 404; // Not Found
      ctx.body = { error: "User not found" };
    } else {
      ctx.status = 500; // Internal Server Error
      ctx.body = { error: "Internal server error" };
    }
  }
});

module.exports = router;
