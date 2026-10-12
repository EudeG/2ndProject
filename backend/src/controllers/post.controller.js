const { Post, User } = require("../models");
const { HttpError } = require("../middleware/errorHandler");
const {
    getCompleteError,
    getReserveError,
    getEditError,
} = require("../rules/postRules");

exports.list = async (req, res) => {
    const posts = await Post.findAll({
        where: { userId: req.user.id },
        order: [["publishedAt", "DESC"]],
    });
    res.json({ posts });
};

exports.create = async (req, res) => {
    const { title, type } = req.body;
    if (!title || !type) {
        throw new HttpError(400, "Título y tipo son obligatorios.");
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
        type,
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

    const { title, type } = req.body;

    if (!title || !type) {
        throw new HttpError(400, "Título y tipo son obligatorios.");
    }

    await post.update({ title, type });

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

    if (post.userId !== req.user.id) {
        throw new HttpError(403, "No puedes editar una publicación ajena.");
    }

    const error = getReserveError(post);
    if (error) {
        throw new HttpError(400, error);
    }

    const state = post.state === "reservado" ? "disponible" : "reservado";
    await post.update({ state });

    res.json({
        message: state === "reservado"
            ? "Publicación reservada."
            : "Reserva liberada",
        post,
    });
};

exports.complete = async (req, res) => {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
        throw new HttpError(404, "Publicación no encontrada.");
    }

    const error = getCompleteError(post, req.user.id);
    if (error) {
        throw new HttpError(400, error);
    }

    await post.update({ state: "intercambiado" });

    res.json({
        message: "Intercambio completado.",
        post,
    });
};
