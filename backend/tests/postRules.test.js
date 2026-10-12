const {
    getCompleteError,
    getReserveError,
    getEditError,
} = require("../src/rules/postRules");

describe("Reglas para completar un intercambio", () => {
    let post;

    beforeEach(() => {
        post = {
            id: 10,
            title: "Libro de Cálculo I",
            state: "reservado",
            userId: 1,
            reservedById: 2,
        };
    });

    test("1. el dueño puede completar una publicación reservada", () => {
        expect(getCompleteError(post, 1)).toBeNull();
    });

    test("2. quien reservó puede completar el intercambio", () => {
        expect(getCompleteError(post, 2)).toBeNull();
    });

    test("3. restriccion, no se puede completar una publicación disponible", () => {
        post.state = "disponible";

        expect(getCompleteError(post, 1)).toBe(
            "Solo puedes completar una publicación reservada.",
        );
    });

    test("4. restriccion, no se puede completar otra vez una intercambiada", () => {
        post.state = "intercambiado";

        expect(getCompleteError(post, 1)).toBe(
            "Solo puedes completar una publicación reservada.",
        );
    });

    test("5. restriccion, otra persona no puede completar el intercambio", () => {
        expect(getCompleteError(post, 99)).toBe(
            "Solo el dueño o quien reservó pueden completar el intercambio.",
        );
    });

    test("6. restriccion, una intercambiada no se puede reservar, editar ni eliminar", () => {
        post.state = "intercambiado";

        expect(getReserveError(post)).toBe(
            "No puedes reservar una publicación intercambiada.",
        );
        expect(getEditError(post, "editar")).toBe(
            "No puedes editar una publicación intercambiada.",
        );
        expect(getEditError(post, "eliminar")).toBe(
            "No puedes eliminar una publicación intercambiada.",
        );
    });

    test("7. una publicación disponible sí se puede reservar y editar", () => {
        post.state = "disponible";

        expect(getReserveError(post)).toBeNull();
        expect(getEditError(post, "editar")).toBeNull();
    });
});
