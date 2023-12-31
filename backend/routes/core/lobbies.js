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
    const { lobby_name } = ctx.request.body; // Retrieve lobby_id from request body

    if (!lobby_name || isNaN(parseInt(lobby_name))) {
      ctx.status = 400; // Bad Request
      ctx.body = { error: "Invalid or missing lobby_name" };
      return;
    }

    // Query to retrieve the lobby and its current challenge
    const lobbyQuery = `
      SELECT l.id, l.lobby_name, l.is_active, l.current_challenge,
             c.id AS challenge_id, c.challenge_name, c.description,
             c.created_at AS challenge_created_at, c.start_date, c.end_date, c.image_source,
             (select username from users where id=l.created_by) as created_by
      FROM public.lobbies l
      LEFT JOIN public.challenges c ON l.current_challenge = c.id
      WHERE l.lobby_name = $1
    `;

    const lobby = await db.oneOrNone(lobbyQuery, [lobby_name]);

    // If no lobby is found, return an error
    if (!lobby) {
      ctx.status = 404; // Not Found
      ctx.body = { error: "Lobby not found" };
      return;
    }

    // Query to retrieve all users in the lobby
    const usersQuery = `
      SELECT 
        u.id, 
        u.username, 
        r.score,
        CAST((SELECT SUM(r.score) FROM public.results r WHERE r.user_id = u.id AND r.lobby_id = ulp.lobby_id) AS INTEGER) AS total_score
      FROM 
        public.users u
      JOIN 
        public.user_lobby_participation ulp ON ulp.user_id = u.id
      LEFT JOIN 
        results r ON r.user_id = u.id AND r.lobby_id = ulp.lobby_id AND r.challenge_id = $2
      WHERE 
        ulp.lobby_id = (SELECT id FROM lobbies WHERE lobby_name = $1)
      ORDER BY 
        r.id DESC
    `;

    const users = await db.any(usersQuery, [lobby_name, lobby.challenge_id]);

    // Constructing the response body with lobby and users information
    ctx.status = 200; // OK
    ctx.body = {
      lobby: {
        id: lobby.id,
        lobby_name: lobby.lobby_name,
        is_active: lobby.is_active,
        created_by: lobby.created_by,
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

router.post("/join-lobby", async (ctx) => {
  try {
    const { lobby_id } = ctx.request.body;
    const username = ctx.get("X-Username");

    if (!lobby_id || !username) {
      ctx.status = 400; // Bad Request
      ctx.body = { error: "Invalid lobby_id or username" };
      return;
    }

    await db.none(
      "INSERT INTO user_lobby_participation (user_id, lobby_id) SELECT id, $1 FROM users WHERE username = $2",
      [lobby_id, username]
    );

    ctx.status = 200;
    ctx.body = { message: "User joined the lobby successfully" };
  } catch (error) {
    console.error(error);
    ctx.status = 500; // Internal Server Error
    ctx.body = { error: "Internal server error" };
  }
});
router.post("/leave-lobby", async (ctx) => {
  try {
    const { lobby_id } = ctx.request.body;
    const username = ctx.get("X-Username");

    if (!lobby_id || !username) {
      ctx.status = 400; // Bad Request
      ctx.body = { error: "Invalid lobby_id or username" };
      return;
    }

    await db.none(
      "DELETE FROM user_lobby_participation WHERE lobby_id = $1 AND user_id = (SELECT id FROM users WHERE username = $2)",
      [lobby_id, username]
    );

    ctx.status = 200;
    ctx.body = { message: "User left the lobby successfully" };
  } catch (error) {
    console.error(error);
    ctx.status = 500; // Internal Server Error
    ctx.body = { error: "Internal server error" };
  }
});
router.post("/finish-lobby", async (ctx) => {
  try {
    const { lobby_id } = ctx.request.body;

    if (!lobby_id) {
      ctx.status = 400; // Bad Request
      ctx.body = { error: "Invalid lobby_id" };
      return;
    }

    await db.none("UPDATE lobbies SET is_active = false WHERE id = $1", [
      lobby_id,
    ]);

    ctx.status = 200;
    ctx.body = { message: "Lobby finished successfully" };
  } catch (error) {
    console.error(error);
    ctx.status = 500; // Internal Server Error
    ctx.body = { error: "Internal server error" };
  }
});

router.post("/next-challenge", async (ctx) => {
  try {
    const { lobby_id } = ctx.request.body;

    if (!lobby_id) {
      ctx.status = 400; // Bad Request
      ctx.body = { error: "Invalid lobby_id" };
      return;
    }

    // select a random challenge that has not been completed in the current lobby
    const challenge = await db.oneOrNone(
      `
      SELECT c.id
      FROM challenges c
      WHERE NOT EXISTS (
        SELECT 1
        FROM results r
        WHERE r.challenge_id = c.id AND r.lobby_id = $1
      )
      ORDER BY RANDOM()
      LIMIT 1
    `,
      [lobby_id]
    );

    if (!challenge) {
      ctx.status = 404;
      ctx.body = { error: "No new challenges available" };
      return;
    }
    await db.none(
      `
      UPDATE lobbies
      SET current_challenge = $1
      WHERE id = $2
    `,
      [challenge.id, lobby_id]
    );

    ctx.status = 200;
    ctx.body = {
      message: "Next challenge set successfully",
      challengeId: challenge.id,
    };
  } catch (error) {
    console.error(error);
    ctx.status = 500; // Internal Server Error
    ctx.body = { error: "Internal server error" };
  }
});

module.exports = router;
