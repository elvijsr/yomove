const Router = require("koa-router");
const db = require("../../db");
const router = new Router();

router.get("/me", async (ctx, next) => {
  try {
    const username = ctx.get("X-Username");

    // Check if the username is provided
    if (!username) {
      ctx.status = 400;
      ctx.body = { error: "Username is required in the header" };
      return;
    }

    // Query the database to find the user and their avatars based on the username
    // and aggregate the avatars into an array of JSON objects
    const userData = await db.oneOrNone(
      `
      SELECT 
        u.*,
        json_agg(
          json_build_object('avatar_id', ua.avatar_id, 'url', p.url)
        ) AS avatars,
        coalesce(
          json_agg(
            DISTINCT tc.top_scores
          ) FILTER (WHERE tc.top_scores IS NOT NULL), 
          '[]'
        ) AS top_scores
      FROM 
        users u
      LEFT JOIN user_avatars ua ON u.id = ua.user_id
      LEFT JOIN pictures p ON ua.avatar_id = p.id
      LEFT JOIN (
        SELECT 
          r.user_id, 
          jsonb_build_object('challenge_name', c.challenge_name, 'top_score', MAX(r.score)) AS top_scores
        FROM 
          results r
          left join challenges c on c.id = r.challenge_id
        GROUP BY 
          r.user_id, c.challenge_name
      ) AS tc ON u.id = tc.user_id
      WHERE 
        u.username = $1
      GROUP BY 
        u.id
      `,
      username
    );

    // If the user or avatars are not found, it will return null in avatars
    if (!userData) {
      ctx.status = 404;
      ctx.body = { error: "User not found" };
      return;
    }

    // Handle the case where the user has no avatars
    userData.avatars = userData.avatars || [];

    // Return the user data along with avatars information
    ctx.body = { data: userData };
  } catch (error) {
    ctx.status = 500;
    console.log(error);
    ctx.body = { error: "Error retrieving data from the database" };
  }
});

router.get("/mypossibleavatars", async (ctx, next) => {
  try {
    // Extract the username from the request headers
    const username = ctx.request.headers["x-username"];

    // Check if the username is provided
    if (!username) {
      ctx.status = 400;
      ctx.body = { error: "Username is required in the header" };
      return;
    }

    // Query the database to find the user's level based on the username
    const user = await db.oneOrNone(
      "SELECT level FROM users WHERE username = $1",
      username
    );

    // If the user is not found, return an error
    if (!user) {
      ctx.status = 404;
      ctx.body = { error: "User not found" };
      return;
    }

    // Query the database to get all picture URLs for the user's level
    const pictureUrls = await db.any(
      "SELECT url FROM pictures WHERE type = $1",
      user.level
    );

    // Return the picture URLs
    ctx.body = { data: pictureUrls.map((picture) => picture.url) };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: "Internal server error" };
  }
});

router.post("/setavatar", async (ctx, next) => {
  try {
    // Extract the username from the request headers
    const username = ctx.request.headers["x-username"];

    // Extract the level from the request body
    const { level } = ctx.request.body;

    // Check if the username and level are provided
    if (!username || level === undefined) {
      ctx.status = 400;
      ctx.body = { error: "Username and level are required" };
      return;
    }

    // Query the database to find the user ID based on the username
    const user = await db.oneOrNone(
      "SELECT id FROM users WHERE username = $1",
      username
    );

    // If the user is not found, return an error
    if (!user) {
      ctx.status = 404;
      ctx.body = { error: "User not found" };
      return;
    }

    // Query the database to get a random avatar ID from pictures where type equals the provided level
    const avatar = await db.oneOrNone(
      "SELECT id FROM pictures WHERE type = $1 ORDER BY RANDOM() LIMIT 1",
      level
    );

    // If no avatar is found, return an error
    if (!avatar) {
      ctx.status = 404;
      ctx.body = { error: "No avatar found for the given level" };
      return;
    }

    // Insert a new record into user_avatars
    await db.none(
      "INSERT INTO user_avatars (user_id, avatar_id) VALUES ($1, $2)",
      [user.id, avatar.id]
    );

    // Return a success message
    ctx.status = 201;
    ctx.body = { message: "Avatar set successfully" };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: "Internal server error" };
  }
});

router.get("/progressionstatus", async (ctx, next) => {
  try {
    // Extract the username from the request headers
    const username = ctx.get("X-Username");

    // Check if the username is provided
    if (!username) {
      ctx.status = 400;
      ctx.body = { error: "Username is required in the header" };
      return;
    }

    // Query the database to find the user based on the username
    const user = await db.oneOrNone(
      "SELECT id, level FROM users WHERE username = $1",
      username
    );

    // If the user is not found, return an error
    if (!user) {
      ctx.status = 404;
      ctx.body = { error: "User not found" };
      return;
    }

    // Get the count of unique challenge_ids for the user
    const challengeCountResult = await db.one(
      "SELECT COUNT(DISTINCT challenge_id) FROM results WHERE user_id = $1",
      user.id
    );
    const challengeCount = parseInt(challengeCountResult.count);

    // Get the count of avatars for the user
    const avatarCountResult = await db.one(
      "SELECT COUNT(*) FROM user_avatars WHERE user_id = $1",
      user.id
    );
    const avatarCount = parseInt(avatarCountResult.count);

    // Check if challenge count is 1 less than avatar count
    if (challengeCount === avatarCount - 1) {
      // If the condition is met, return no changes
      ctx.body = { output: "no changes" };
    } else {
      // Increment the user's level
      await db.none(
        "UPDATE users SET level = level + 1 WHERE id = $1",
        user.id
      );

      // Get a new avatar for the next level
      const newAvatar = await db.one(
        "SELECT id FROM pictures WHERE type = $1 ORDER BY RANDOM() LIMIT 1",
        user.level + 1
      );

      // Add new entry in user_avatars
      await db.none(
        "INSERT INTO user_avatars (user_id, avatar_id) VALUES ($1, $2)",
        [user.id, newAvatar.id]
      );

      // Update the users table avatar_id value
      await db.none("UPDATE users SET avatar_id = $1 WHERE id = $2", [
        newAvatar.id,
        user.id,
      ]);

      // Return level-up message
      ctx.body = { output: `Level up! Level: ${user.level + 1}` };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: "Error processing request" };
  }
});
router.get("/my-lobbies", async (ctx) => {
  try {
    const username = ctx.get("X-Username");

    if (!username) {
      ctx.status = 400; // Bad Request
      ctx.body = { error: "Username is required" };
      return;
    }

    const userLobbies = await db.any(
      "SELECT l.* FROM lobbies l INNER JOIN user_lobby_participation ulp ON l.id = ulp.lobby_id INNER JOIN users u ON ulp.user_id = u.id WHERE u.username = $1",
      [username]
    );

    ctx.status = 200; // OK
    ctx.body = { lobbies: userLobbies };
  } catch (error) {
    console.error(error);
    ctx.status = 500; // Internal Server Error
    ctx.body = { error: "Internal server error" };
  }
});

module.exports = router;
