const { Op } = require("sequelize");
const { Post, User, Activity } = require("../models");
const { HttpError } = require("../middleware/errorHandler");
const {
    getCompleteError,
    getReserveError,
    getEditError,
} = require("../rules/postRules");
const { buildPostWhere } = require("../rules/postFilters");

const categories = ["libros", "electronica", "ropa", "otros"];
const conditions = ["nuevo", "usado"];

async function getUserName(id) {
    const user = await User.findByPk(id);
    return user ? user.name : "Usuario eliminado";
}

exports.list = async (req, res) => {
    const posts = await Post.findAll({
        where: { userId: req.user.id },
        include: [{ model: User, as: "reservedBy", attributes: ["id", "name"] }],
        order: [["publishedAt", "DESC"]],
    });
    res.json({ posts });
};

exports.explore = async (req, res) => {
    const { q, category, condition, state } = req.query;
    const where = buildPostWhere({ q, category, condition, state });
    where.userId = { [Op.ne]: req.user.id };

    const posts = await Post.findAll({
        where,
        include: [
            { model: User, as: "owner", attributes: ["id", "name"] },
            { model: User, as: "reservedBy", attributes: ["id", "name"] },
        ],
        order: [["publishedAt", "DESC"]],
    });
    res.json({ posts });
};

exports.create = async (req, res) => {
    const { title, category, condition } = req.body;
    if (!title || !category || !condition) {
        throw new HttpError(
            400,
            "Título, categoría y condición son obligatorios.",
        );
    }
    if (!categories.includes(category)) {
        throw new HttpError(400, "Categoría no válida.");
    }
    if (!conditions.includes(condition)) {
        throw new HttpError(400, "Condición no válida.");
    }

    const owner = await User.findByPk(req.user.id);
    if (!owner) {
        throw new HttpError(
            401,
            "Tu sesión ya no es válida. Inicia sesión nuevamente.",
        );
    }

    const post = await Post.create({
        title,
        category,
        condition,
        state: "disponible",
        userId: req.user.id,
    });
    res.status(201).json({
        message: "Publicación registrada satisfactoriamente.",
        post,
    });
};

exports.update = async (req, res) => {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
        throw new HttpError(404, "Publicación no encontrada.");
    }

    if (post.userId !== req.user.id) {
        throw new HttpError(403, "No puedes editar una publicación ajena.");
    }

    const error = getEditError(post, "editar");
    if (error) {
        throw new HttpError(403, error);
    }

    const { title, category, condition } = req.body;

    if (!title || !category || !condition) {
        throw new HttpError(
            400,
            "Título, categoría y condición son obligatorios.",
        );
    }
    if (!categories.includes(category)) {
        throw new HttpError(400, "Categoría no válida.");
    }
    if (!conditions.includes(condition)) {
        throw new HttpError(400, "Condición no válida.");
    }

    await post.update({ title, category, condition });

    res.json({
        message: "Publicación actualizada satisfactoriamente",
        post,
    });
};

exports.delete = async (req, res) => {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
        throw new HttpError(404, "Publicación no encontrada.");
    }

    if (post.userId !== req.user.id) {
        throw new HttpError(403, "No puedes eliminar una publicación ajena");
    }

    const error = getEditError(post, "eliminar");
    if (error) {
        throw new HttpError(403, error);
    }

    await post.destroy();

    res.json({
        message: "Publicación eliminada satisfactoriamente",
    });
};

exports.toggleReservation = async (req, res) => {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
        throw new HttpError(404, "Publicación no encontrada.");
    }

    const error = getReserveError(post, req.user.id);
    if (error) {
        const status = post.state === "intercambiado" ? 400 : 403;
        throw new HttpError(status, error);
    }

    if (post.state === "reservado") {
        const otherId =
            req.user.id === post.userId ? post.reservedById : post.userId;
        await post.update({ state: "disponible", reservedById: null });
        await Activity.create({
            userId: req.user.id,
            type: "reserva_liberada",
            postId: post.id,
            postTitle: post.title,
            otherUserName: await getUserName(otherId),
        });
        return res.json({ message: "Reserva liberada", post });
    }

    await post.update({ state: "reservado", reservedById: req.user.id });
    await Activity.create({
        userId: req.user.id,
        type: "reservado",
        postId: post.id,
        postTitle: post.title,
        otherUserName: await getUserName(post.userId),
    });
    res.json({ message: "Publicación reservada.", post });
};

exports.complete = async (req, res) => {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
        throw new HttpError(404, "Publicación no encontrada.");
    }

    const error = getCompleteError(post, req.user.id);
    if (error) {
        const status = post.state === "reservado" ? 403 : 400;
        throw new HttpError(status, error);
    }

    await post.update({ state: "intercambiado" });

    await Activity.create({
        userId: post.reservedById,
        type: "intercambio_completado",
        role: "receptor",
        postId: post.id,
        postTitle: post.title,
        otherUserName: await getUserName(post.userId),
    });
    await Activity.create({
        userId: post.userId,
        type: "intercambio_completado",
        role: "entregador",
        postId: post.id,
        postTitle: post.title,
        otherUserName: await getUserName(post.reservedById),
    });

    res.json({
        message: "Intercambio completado.",
        post,
    });
};
