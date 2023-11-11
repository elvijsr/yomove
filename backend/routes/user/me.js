const Router = require("koa-router");
const db = require("../../db");
const router = new Router();

router.get("/me", async (ctx, next) => {
  try {
    // Extract the username from the request headers
    const username = ctx.request.headers['x-username'];

    // Check if the username is provided
    if (!username) {
      ctx.status = 400;
      ctx.body = { error: "Username is required in the header" };
      return;
    }

    // Query the database to find the user and their avatars based on the username
    const userData = await db.oneOrNone(`
      SELECT u.*, ua.avatar_id, p.url 
      FROM users u
      LEFT JOIN user_avatars ua ON u.id = ua.user_id
      LEFT JOIN pictures p ON ua.avatar_id = p.id
      WHERE u.username = $1
    `, username);

    // If the user is not found, return an error
    if (!userData) {
      ctx.status = 404;
      ctx.body = { error: "User not found" };
      return;
    }

    // Return the user data along with avatar information
    ctx.body = { data: userData };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: "Error retrieving data from the database" };
  }
});

router.get("/mypossibleavatars", async (ctx, next) => {
  try {
    // Extract the username from the request headers
    const username = ctx.request.headers['x-username'];

    // Check if the username is provided
    if (!username) {
      ctx.status = 400;
      ctx.body = { error: "Username is required in the header" };
      return;
    }

    // Query the database to find the user's level based on the username
    const user = await db.oneOrNone("SELECT level FROM users WHERE username = $1", username);

    // If the user is not found, return an error
    if (!user) {
      ctx.status = 404;
      ctx.body = { error: "User not found" };
      return;
    }

    // Query the database to get all picture URLs for the user's level
    const pictureUrls = await db.any("SELECT url FROM pictures WHERE type = $1", user.level);

    // Return the picture URLs
    ctx.body = { data: pictureUrls.map(picture => picture.url) };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: "Error retrieving data from the database" };
  }
});

router.post("/setavatar", async (ctx, next) => {
  try {
    // Extract the username from the request headers
    const username = ctx.request.headers['x-username'];

    // Extract the level from the request body
    const { level } = ctx.request.body;

    // Check if the username and level are provided
    if (!username || level === undefined) {
      ctx.status = 400;
      ctx.body = { error: "Username and level are required" };
      return;
    }

    // Query the database to find the user ID based on the username
    const user = await db.oneOrNone("SELECT id FROM users WHERE username = $1", username);

    // If the user is not found, return an error
    if (!user) {
      ctx.status = 404;
      ctx.body = { error: "User not found" };
      return;
    }

    // Query the database to get a random avatar ID from pictures where type equals the provided level
    const avatar = await db.oneOrNone("SELECT id FROM pictures WHERE type = $1 ORDER BY RANDOM() LIMIT 1", level);

    // If no avatar is found, return an error
    if (!avatar) {
      ctx.status = 404;
      ctx.body = { error: "No avatar found for the given level" };
      return;
    }

    // Insert a new record into user_avatars
    await db.none("INSERT INTO user_avatars (user_id, avatar_id) VALUES ($1, $2)", [user.id, avatar.id]);

    // Return a success message
    ctx.status = 201;
    ctx.body = { message: "Avatar set successfully" };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: "Error processing request" };
  }
});


module.exports = router;