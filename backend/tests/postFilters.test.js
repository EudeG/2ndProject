const { Op } = require("sequelize");
const { buildPostWhere } = require("../src/rules/postFilters");

describe("Filtros de busqueda de publicaciones", () => {
    test("1. combina libros, usado, disponible y el titulo buscado", () => {
        const where = buildPostWhere({
            q: "calculo",
            category: "libros",
            condition: "usado",
            state: "disponible",
        });

        expect(where).toEqual({
            title: { [Op.like]: "%calculo%" },
            category: "libros",
            condition: "usado",
            state: "disponible",
        });
    });

    test("2. sin filtros solo excluye las intercambiadas", () => {
        expect(buildPostWhere({})).toEqual({
            state: { [Op.ne]: "intercambiado" },
        });
    });

    test("3. las intercambiadas solo aparecen si se filtra por ese estado", () => {
        expect(buildPostWhere({ state: "intercambiado" })).toEqual({
            state: "intercambiado",
        });
    });

    test("4. ignora los filtros vacios", () => {
        expect(buildPostWhere({ q: "", category: "", condition: "" })).toEqual({
            state: { [Op.ne]: "intercambiado" },
        });
    });

    test("5. arma el filtro para valores sin coincidencias", () => {
        const where = buildPostWhere({ q: "microscopio", category: "ropa" });

        expect(where).toEqual({
            title: { [Op.like]: "%microscopio%" },
            category: "ropa",
            state: { [Op.ne]: "intercambiado" },
        });
    });
});
