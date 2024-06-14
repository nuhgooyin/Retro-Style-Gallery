import { Comment } from "../models/comment.js";
import { Router } from "express";
import { Op } from "sequelize";

import multer from "multer";
const upload = multer({ dest: "uploads/" });

export const commentsRouter = Router();

//
// Add a new comment
//
commentsRouter.post(
  "/:PostId",
  upload.single("picture"),
  async (req, res, next) => {
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

      const comment = await Comment.create({
        content: req.body.content,
        date: date,
        author: req.body.author,
        PostId: req.params.PostId,
      });
      return res.json(comment);
    } catch (e) {
      if (e.name === "SequelizeForeignKeyConstraintError") {
        return res.status(422).json({ error: "Invalid parent comment id" });
      } else if (e.name === "SequelizeValidationError") {
        return res.status(422).json({
          error:
            "Invalid input parameters. Expected content, file and (optional) CommentId",
        });
      } else {
        return res.status(400).json({ error: "Cannot create comment" });
      }
    }
  },
);

//
// Get comments given a PostId
//
commentsRouter.get("/:PostId", async (req, res, next) => {
  let comments;
  if (req.query.direction === "next") {
    comments = await Comment.findAll({
      limit: 11,
      where: {
        PostId: req.params.PostId,
        createdAt: {
          [Op.gte]: new Date(req.query.timestamp),
        },
      },
      order: [["createdAt"]],
    });
  } else if (req.query.direction === "prev") {
    comments = await Comment.findAll({
      limit: 11,
      where: {
        PostId: req.params.PostId,
        createdAt: {
          [Op.lte]: new Date(req.query.timestamp),
        },
      },
      order: [["createdAt", "DESC"]],
    });
  } else if (req.query.direction === "first") {
    comments = await Comment.findAll({
      limit: 10,
      where: {
        PostId: req.params.PostId,
      },
      order: [["createdAt"]],
    });
  } else {
    return res.status(400).json({ error: "Invalid direction" });
  }

  if (comments !== undefined) {
    return res.json(comments);
  } else {
    return res.json(null);
  }
});

//
// Delete a comment
//
commentsRouter.delete("/:CommentId", async (req, res, next) => {
  let comment = await Comment.findByPk(req.params.CommentId);

  if (!comment) {
    return res
      .status(404)
      .json({ error: `Comment(id=${req.params.CommentId}) not found.` });
  }
  await comment.destroy();
  return res.json(comment);
});
