const sequelize = require("../database/db");
const User = require("./User");
const Post = require("./Post");
const Activity = require("./Activity");

User.hasMany(Post, { foreignKey: "userId" });
Post.belongsTo(User, { foreignKey: "userId", as: "owner" });
Post.belongsTo(User, { foreignKey: "reservedById", as: "reservedBy" });

User.hasMany(Activity, { foreignKey: "userId" });
Activity.belongsTo(User, { foreignKey: "userId" });
Activity.belongsTo(Post, { foreignKey: "postId", constraints: false });

module.exports = { sequelize, User, Post, Activity };
