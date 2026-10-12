const sequelize = require("../database/db");
const User = require("./User");
const Post = require("./Post");

User.hasMany(Post, { foreignKey: "userId" });
Post.belongsTo(User, { foreignKey: "userId", as: "owner" });
Post.belongsTo(User, { foreignKey: "reservedById", as: "reservedBy" });

module.exports = { sequelize, User, Post };
