import { Post } from "../models/post.js";
import { Router } from "express";
import { Op } from "sequelize";

import multer from "multer";
import path from "path";
const upload = multer({ dest: "uploads/" });

export const postsRouter = Router();

//
// Add a new post
//
postsRouter.post("/", upload.single("picture"), async (req, res, next) => {
  try {
    // Get current date setup
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1;
    let yyyy = today.getFullYear();

    // Add leading zero if the day is less than 10
    if (dd < 10) {
      dd = "0" + dd;
    }

    // Add leading zero if the month is less than 10
    if (mm < 10) {
      mm = "0" + mm;
    }

    // Format date
    let date = yyyy + "-" + mm + "-" + dd;

    const post = await Post.create({
      title: req.body.title,
      imageMetadata: req.file,
      date: date,
      author: req.body.author,
    });
    return res.json(post);
  } catch (e) {
    if (e.name === "SequelizeForeignKeyConstraintError") {
      return res.status(422).json({ error: "Invalid parent post id" });
    } else if (e.name === "SequelizeValidationError") {
      return res.status(422).json({
        error:
          "Invalid input parameters. Expected content, file and (optional) PostId",
      });
    } else {
      return res.status(400).json({ error: "Cannot create post" });
    }
  }
});

//
// Get a post
//
postsRouter.get("/", async (req, res, next) => {
  let posts;
  if (req.query.direction === "next") {
    posts = await Post.findAll({
      limit: 1,
      where: {
        createdAt: {
          [Op.gt]: new Date(req.query.timestamp),
        },
      },
      order: [["createdAt"]],
    });
    posts = posts[0];
  } else if (req.query.direction === "prev") {
    posts = await Post.findAll({
      limit: 1,
      where: {
        createdAt: {
          [Op.lt]: new Date(req.query.timestamp),
        },
      },
      order: [["createdAt", "DESC"]],
    });
    posts = posts[0];
  } else if (req.query.direction === "curr") {
    posts = await Post.findOne();
  } else {
    return res.status(400).json({ error: "Invalid direction" });
  }

  if (posts !== undefined) {
    return res.json(posts);
  } else {
    return res.json(null);
  }
});

//
// Get a post's image
//
postsRouter.get("/:id/image", async (req, res, next) => {
  const post = await Post.findByPk(req.params.id);
  if (!post) {
    return res
      .status(404)
      .json({ error: `Post(id=${req.params.id}) not found.` });
  }
  if (!post.imageMetadata) {
    return res
      .status(404)
      .json({ error: `Post(id=${req.params.id}) has no image.` });
  }
  res.setHeader("Content-Type", post.imageMetadata.mimetype);
  res.sendFile(post.imageMetadata.path, { root: path.resolve() });
});

//
// Get total count of posts
//
postsRouter.get("/count", async (req, res, next) => {
  Post.count().then((count) => {
    return res.json(count);
  });
});

//
// Delete a post
//
postsRouter.delete("/:id", async (req, res, next) => {
  const post = await Post.findByPk(req.params.id);
  if (!post) {
    return res
      .status(404)
      .json({ error: `Post(id=${req.params.id}) not found.` });
  }
  await post.destroy();
  return res.json(post);
});
