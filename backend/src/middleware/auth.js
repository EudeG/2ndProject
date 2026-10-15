const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../database/config");
const { HttpError } = require("./errorHandler");

function verifyToken(req, _res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        throw new HttpError(401, "Debes iniciar sesión para continuar.");
    }

    try {
        req.user = jwt.verify(token, jwtSecret);
    } catch {
        throw new HttpError(403, "Tu sesión expiró. Inicia sesión nuevamente.");
    }
    next();
}

module.exports = { verifyToken };
