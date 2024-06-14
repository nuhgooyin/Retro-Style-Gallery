import { sequelize } from "./datasource.js";
import express from "express";
import bodyParser from "body-parser";
import { postsRouter } from "./routers/posts-router.js";
import { commentsRouter } from "./routers/comments-router.js";

const PORT = 3008;
export const app = express();

app.use(bodyParser.json());
app.use(express.static("static"));

// this is a middleware function that logs the incoming request
app.use(function (req, res, next) {
  console.log("HTTP request", req.method, req.url, req.body);
  next();
});

try {
  await sequelize.authenticate();
  await sequelize.sync({ alter: { drop: false } });
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

app.use("/posts", postsRouter);
app.use("/comments", commentsRouter);

app.listen(PORT, (err) => {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});
