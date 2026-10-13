const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database/db");

class Post extends Model {}

Post.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        title: { 
            type: DataTypes.STRING, 
            allowNull: false },
        type: { 
            type: DataTypes.TEXT, 
            allowNull: false 
        },
        category: {
            type: DataTypes.TEXT,
            allowNull: true,
            validate: { isIn: [["libros", "electronica", "ropa", "otros"]] },
        },
        condition: {
            type: DataTypes.TEXT,
            allowNull: true,
            validate: { isIn: [["nuevo", "usado"]] },
        },
        state: {
            type: DataTypes.TEXT, 
            allowNull: false 
        },
        publishedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        reservedById: {
            type: DataTypes.UUID,
            allowNull: true,
        },
    },
    { 
        sequelize, 
        modelName: "Post", 
        tableName: "posts", 
        timestamps: true },
);

module.exports = Post;
