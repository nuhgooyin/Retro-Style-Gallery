import { sequelize } from "../datasource.js";
import { DataTypes } from "sequelize";

export const Comment = sequelize.define("Comment", {
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
