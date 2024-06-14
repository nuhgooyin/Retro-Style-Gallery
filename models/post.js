import { sequelize } from "../datasource.js";
import { DataTypes } from "sequelize";
import { Comment } from "./comment.js";

export const Post = sequelize.define("Post", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  imageMetadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Post.hasMany(Comment);
Comment.belongsTo(Post);
