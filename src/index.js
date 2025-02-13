import dotenv from "dotenv";
import connectDB from "./db/index.js";
import express from "express";

dotenv.config({
  path: "./env",
});

const app = express();

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is listenning on PORT ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
