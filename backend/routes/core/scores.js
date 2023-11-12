const Router = require("koa-router");
const db = require("../../db");
const router = new Router();


router.get("/getallscores", async (ctx, next) => {
  try {
    // Query the database to get all data from results table, joined with challenges, users, and user_avatars tables
    const allScores = await db.manyOrNone(`
      SELECT r.*, c.challenge_name, u.username,
        (select url from pictures where id = ua.avatar_id) as avatar_scr
      FROM results r
      JOIN challenges c ON r.challenge_id = c.id
      JOIN users u ON r.user_id = u.id
      LEFT JOIN user_avatars ua ON u.id = ua.user_id
      ORDER BY c.challenge_name, r.score DESC
    `);

    // Process the results to group them by challenge_name and assign placements
    const groupedScores = allScores.reduce((acc, score) => {
      // If the challenge_name group doesn't exist, create it
      if (!acc[score.challenge_name]) {
        acc[score.challenge_name] = [];
      }
      // Add the score with the username, placement, user_id (as avatarSrc), and avatar_id (as avatarId) to the appropriate challenge_name group
      acc[score.challenge_name].push({
        placement: acc[score.challenge_name].length + 1, // Assign placement number
        username: score.username,
        score: score.score,
        score_date: score.score_date,
        avatarSrc: score.avatar_scr, // Use user_id as avatarSrc
        avatarId: score.avatar_id // Add avatar_id from the user_avatars table
      });
      return acc;
    }, {});

    // Convert the grouped object into an array of objects
    const scoresArray = Object.keys(groupedScores).map(challengeName => ({
      challenge_name: challengeName,
      scores: groupedScores[challengeName]
    }));

    // Return the grouped results
    ctx.body = scoresArray;
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: "Error retrieving scores from the database" };
  }
});


module.exports = router;
