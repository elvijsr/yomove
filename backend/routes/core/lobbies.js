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

    const user = await db.oneOrNone(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );

    if (!user) {
      ctx.status = 404; // Not Found
      ctx.body = { error: "User not found" };
      return;
    }

    let lobbyName;
    let lobbyId; // Variable to store the new lobby's ID
    let unique = false;
    let attempt = 0;

    while (!unique && attempt < 10) {
      attempt++;
      lobbyName = generateRandomLobbyName().toString();

      try {
        // Get the ID of the newly created lobby
        const result = await db.one(
          "INSERT INTO lobbies (lobby_name, created_by, current_challenge, is_active) VALUES ($1, $2, $3, $4) RETURNING id",
          [lobbyName, user.id, challenge_id, true]
        );
        lobbyId = result.id; // Store the new lobby's ID
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

    // Insert a record into the user_lobby_participation table
    await db.none(
      "INSERT INTO user_lobby_participation (user_id, lobby_id) VALUES ($1, $2)",
      [user.id, lobbyId]
    );

    // Return the name and ID of the newly created lobby
    ctx.status = 201; // Created
    ctx.body = { lobbyName: lobbyName, lobbyId: lobbyId };
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

router.post("/get-lobby", async (ctx, next) => {
  try {
    const { lobby_id } = ctx.request.body; // Retrieve lobby_id from request body

    if (!lobby_id || isNaN(parseInt(lobby_id))) {
      ctx.status = 400; // Bad Request
      ctx.body = { error: "Invalid or missing lobby_id" };
      return;
    }

    // Query to retrieve the lobby and its current challenge
    const lobbyQuery = `
      SELECT l.id, l.lobby_name, l.is_active, l.current_challenge,
             c.id AS challenge_id, c.challenge_name, c.description,
             c.created_at AS challenge_created_at, c.start_date, c.end_date, c.image_source
      FROM public.lobbies l
      LEFT JOIN public.challenges c ON l.current_challenge = c.id
      WHERE l.lobby_name = $1
    `;

    const lobby = await db.oneOrNone(lobbyQuery, [lobby_id]);

    // If no lobby is found, return an error
    if (!lobby) {
      ctx.status = 404; // Not Found
      ctx.body = { error: "Lobby not found" };
      return;
    }

    // Query to retrieve all users in the lobby
    const usersQuery = `
      SELECT u.id, u.username
      FROM public.users u
      JOIN public.user_lobby_participation ulp ON ulp.user_id = u.id
      WHERE ulp.lobby_id = (select id from lobbies where lobby_name = $1)
    `;

    console.log(lobby_id);

    const users = await db.any(usersQuery, [lobby_id]);

    // Constructing the response body with lobby and users information
    ctx.status = 200; // OK
    ctx.body = {
      lobby: {
        id: lobby.id,
        lobby_name: lobby.lobby_name,
        is_active: lobby.is_active,
        current_challenge: lobby.current_challenge
          ? {
              id: lobby.challenge_id,
              challenge_name: lobby.challenge_name,
              description: lobby.description,
              created_at: lobby.challenge_created_at,
              start_date: lobby.start_date,
              end_date: lobby.end_date,
              image_source: lobby.image_source,
            }
          : null, // Handle case where there might not be a current challenge
      },
      users: users,
    };
  } catch (error) {
    console.error(error);
    ctx.status = 500; // Internal Server Error
    ctx.body = { error: "Internal server error" };
  }
});

module.exports = router;
