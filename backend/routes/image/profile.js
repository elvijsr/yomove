const Router = require("koa-router");
const router = new Router();
const pgp = require("pg-promise")();
const bodyParser = require("koa-bodyparser");
const OpenAI = require("openai");
// const { v2 as cloudinary } = require('cloudinary');
const cloudinary = require("cloudinary").v2;

const openai = new OpenAI();

// Database connection details
console.log(process.env.DB_HOST);
const connection = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

// Create the database instance
const db = pgp(connection);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// router.post('/generateimage', async (ctx) => {
//   try {
//     // Extracting data from the request body
//     const { prompt, n, size } = ctx.request.body;
//
//     // Generate image using OpenAI's API
//     const response = await openai.createImage({
//       model: 'dall-e-3',
//       prompt,
//       n: n || 1,
//       size: size || '1024x1024',
//     });
router.post("/generateimage", async (ctx) => {
  console.log("Generating image started"); // Log when the function starts

  try {
    // Extracting data from the request body
    const { prompt } = ctx.request.body;

    // Log the received request data
    console.log(`Received data: prompt=${prompt}`);

    const image = await openai.images.generate({
      //model: "dall-e-3",
      prompt,
      size: "256x256",
    });

    console.log(image.data);

    // Generate image using OpenAI's API
    // const response = await openai.createImage({
    //   model: 'dall-e-3',
    //   prompt,
    //   n: 1,
    //   size: '1024x1024',
    // });

    // Log the response from OpenAI
    console.log("Response from OpenAI:", response);

    // Further code for image uploading and response...
  } catch (error) {
    // Log the error if any
    console.error("Error occurred:", error);
    ctx.status = 400;
    ctx.body = { error: "Error generating or uploading image" };
  }

  // Get the image URL from the response
  const imageUrl = response.data.data[0].url;

  //   // Upload the image to Cloudinary
  //   const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
  //     folder: 'your_folder_name', // Optional: specify a folder
  //   });
  //
  //   // Return the Cloudinary URL
  //   ctx.body = { imageUrl: uploadResponse.url };
  // } catch (error) {
  //   ctx.status = 400;
  //   ctx.body = { error: 'Error generating or uploading image' };
  // }
});

module.exports = router;
