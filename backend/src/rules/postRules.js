function getCompleteError(post, userId) {
    if (post.state !== "reservado") {
        return "Solo puedes completar una publicación reservada.";
    }

    if (post.userId !== userId && post.reservedById !== userId) {
        return "Solo el dueño o quien reservó pueden completar el intercambio.";
    }

    return null;
}

function getReserveError(post, userId) {
    if (post.state === "intercambiado") {
        return "No puedes reservar una publicación intercambiada.";
    }

    if (post.state === "disponible" && post.userId === userId) {
        return "No puedes reservar tu propia publicación.";
    }

    if (
        post.state === "reservado" &&
        post.userId !== userId &&
        post.reservedById !== userId
    ) {
        return "Solo el dueño o quien reservó pueden liberar la reserva.";
    }

    return null;
}

function getEditError(post, accion) {
    if (post.state === "reservado") {
        return `No puedes ${accion} una publicación reservada.`;
    }

    if (post.state === "intercambiado") {
        return `No puedes ${accion} una publicación intercambiada.`;
    }

    return null;
}

module.exports = { getCompleteError, getReserveError, getEditError };
