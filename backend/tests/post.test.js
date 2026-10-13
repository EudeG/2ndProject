const postController = require("../src/controllers/post.controller");
const { Op } = require("sequelize");
const { Post, User } = require("../src/models");
const { HttpError } = require("../src/middleware/errorHandler");

jest.mock("../src/models", () => ({
    Post: {
        findByPk: jest.fn(),
        findAll: jest.fn(),
    },
    User: {},
}));

describe("Restricciones de estado en publicaciones", () => {
    let mockPost;
    let mockReq;
    let mockRes;

    beforeEach(() => {
        mockPost = {
            id: 10,
            title: "Libro de Estructura de Datos",
            type: "Material Universitario",
            state: "disponible",
            userId: 1,
            update: jest.fn(),
            destroy: jest.fn(),
        };

        mockReq = {
            params: { id: 10 },
            user: { id: 1 },
            body: {},
        };

        mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };

        Post.findByPk.mockClear();
    });

    test("1. deberia permitir editar si el estado no esta reservado", async () => {
        Post.findByPk.mockResolvedValue(mockPost);

        mockReq.body = {
            title: "Libro de ED II (Editado)",
            type: "Recurso Pal examen(E)",
            state: "disponible",
        };

        await postController.update(mockReq, mockRes);

        expect(mockPost.update).toHaveBeenCalledWith({
            title: "Libro de ED II (Editado)",
            type: "Recurso Pal examen(E)",
        });
        expect(mockRes.json).toHaveBeenCalled();
    });

    test("2.  Deberia permitir Eliminar si el estado es diferente a reservado", async () => {
        Post.findByPk.mockResolvedValue(mockPost);

        await postController.delete(mockReq, mockRes);

        expect(mockPost.destroy).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Publicación eliminada satisfactoriamente",
            }),
        );
    });

    test("3. Restriccion, Deberia rechazar la edicion si el estado es reservado", async () => {
        mockPost.state = "reservado";
        Post.findByPk.mockResolvedValue(mockPost);

        mockReq.body = {
            title: "Intentar editar ilegalemnte",
            type: "Cambiar tipo ilegalemnte",
            state: "disponible",
        };

        await expect(postController.update(mockReq, mockRes)).rejects.toThrow(
            HttpError,
        );
        await expect(postController.update(mockReq, mockRes)).rejects.toThrow(
            "No puedes editar una publicación reservada",
        );

        expect(mockPost.update).not.toHaveBeenCalled();
    });

    test("4. restriccion, deberia  rechazar la eliminacion si el estado es reservado", async () => {
        mockPost.state = "reservado";
        Post.findByPk.mockResolvedValue(mockPost);

        await expect(postController.delete(mockReq, mockRes)).rejects.toThrow(
            HttpError,
        );
        await expect(postController.delete(mockReq, mockRes)).rejects.toThrow(
            "No puedes eliminar una publicación reservada",
        );

        expect(mockPost.destroy).not.toHaveBeenCalled();
    });

    test("5. debería alternar entre reservado y disponible", async () => {
        Post.findByPk.mockResolvedValue(mockPost);
        await postController.toggleReservation(mockReq, mockRes);
        expect(mockPost.update).toHaveBeenCalledWith({
            state: "reservado",
            reservedById: 1,
        });

        mockPost.state = "reservado";
        await postController.toggleReservation(mockReq, mockRes);
        expect(mockPost.update).toHaveBeenCalledWith({
            state: "disponible",
            reservedById: null,
        });
    });

    test("6. deberia completar el intercambio si el estado es reservado", async () => {
        mockPost.state = "reservado";
        Post.findByPk.mockResolvedValue(mockPost);

        await postController.complete(mockReq, mockRes);

        expect(mockPost.update).toHaveBeenCalledWith({ state: "intercambiado" });
        expect(mockPost.title).toBe("Libro de Estructura de Datos");
        expect(mockPost.type).toBe("Material Universitario");
        expect(mockRes.json).toHaveBeenCalled();
    });

    test("7. restriccion, deberia rechazar completar si el estado es disponible", async () => {
        Post.findByPk.mockResolvedValue(mockPost);

        await expect(postController.complete(mockReq, mockRes)).rejects.toThrow(
            "Solo puedes completar una publicación reservada.",
        );

        expect(mockPost.update).not.toHaveBeenCalled();
    });

});

describe("Explorar publicaciones", () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        mockReq = {
            user: { id: 1 },
            query: {},
        };

        mockRes = {
            json: jest.fn(),
        };

        Post.findAll.mockClear();
    });

    test("1. deberia devolver las publicaciones de otros usuarios", async () => {
        const posts = [{ id: 20, title: "Calculadora", userId: 2 }];
        Post.findAll.mockResolvedValue(posts);

        await postController.explore(mockReq, mockRes);

        expect(Post.findAll).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    state: { [Op.ne]: "intercambiado" },
                    userId: { [Op.ne]: 1 },
                },
            }),
        );
        expect(mockRes.json).toHaveBeenCalledWith({ posts });
    });

    test("2. deberia devolver una lista vacia si no hay coincidencias", async () => {
        Post.findAll.mockResolvedValue([]);
        mockReq.query = { q: "microscopio", category: "ropa" };

        await postController.explore(mockReq, mockRes);

        expect(Post.findAll).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    title: { [Op.like]: "%microscopio%" },
                    category: "ropa",
                    state: { [Op.ne]: "intercambiado" },
                    userId: { [Op.ne]: 1 },
                },
            }),
        );
        expect(mockRes.json).toHaveBeenCalledWith({ posts: [] });
    });
});
