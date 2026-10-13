const { Op } = require("sequelize");

function buildPostWhere({ q, category, condition, state }) {
    const where = {};

    if (q) {
        where.title = { [Op.like]: `%${q}%` };
    }
    if (category) {
        where.category = category;
    }
    if (condition) {
        where.condition = condition;
    }
    if (state) {
        where.state = state;
    } else {
        where.state = { [Op.ne]: "intercambiado" };
    }

    return where;
}

module.exports = { buildPostWhere };
