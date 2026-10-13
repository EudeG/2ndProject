const bcrypt = require("bcryptjs");
require("./config");
const { sequelize, User, Post } = require("../models");

const users = [
    { name: "Martita Becerra", email: "martita@truequeu.com" },
    { name: "Admin Demo", email: "admin@truequeu.com" },
    { name: "Usuario Invitado", email: "invitado@truequeu.com" },
];

const posts = [
    { title: "Cálculo I – Stewart", category: "libros", condition: "usado", state: "disponible", owner: 0 },
    { title: "Cálculo diferencial – Larson", category: "libros", condition: "usado", state: "disponible", owner: 1 },
    { title: "Cálculo vectorial – Marsden", category: "libros", condition: "nuevo", state: "disponible", owner: 2 },
    { title: "Apuntes de cálculo integral", category: "libros", condition: "usado", state: "reservado", owner: 0 },
    { title: "Calculadora Casio fx-991", category: "electronica", condition: "usado", state: "disponible", owner: 1 },
    { title: "Física universitaria – Sears", category: "libros", condition: "usado", state: "intercambiado", owner: 2 },
    { title: "Audífonos Sony WH-CH520", category: "electronica", condition: "nuevo", state: "reservado", owner: 0 },
    { title: "Chaqueta de la facultad", category: "ropa", condition: "usado", state: "disponible", owner: 1 },
    { title: "Mochila Totto", category: "otros", condition: "usado", state: "intercambiado", owner: 2 },
    { title: "Química general – Chang", category: "libros", condition: "nuevo", state: "disponible", owner: 0 },
    { title: "Álgebra lineal – Grossman", category: "libros", condition: "usado", state: "disponible", owner: 1 },
    { title: "Mouse Logitech M170", category: "electronica", condition: "usado", state: "reservado", owner: 2 },
    { title: "Bata de laboratorio", category: "ropa", condition: "usado", state: "intercambiado", owner: 0 },
];

async function run() {
    try {
        console.log("Iniciando conexión con SQLite...");
        await sequelize.sync({ force: true });

        const password = await bcrypt.hash("Password123!", 10);

        console.log("Insertando usuarios semilla...");
        const createdUsers = [];
        for (const data of users) {
            const [user, created] = await User.findOrCreate({
                where: { email: data.email },
                defaults: { ...data, password },
            });
            createdUsers.push(user);
            console.log(
                created
                    ? `+ Creado: "${user.name}", "${user.email}"`
                    : `~ Ya existía: ${user.email}`,
            );
        }

        console.log("Insertando publicaciones semilla...");
        for (const data of posts) {
            const owner = createdUsers[data.owner];
            const reserver = createdUsers[(data.owner + 1) % createdUsers.length];
            const post = await Post.create({
                title: data.title,
                category: data.category,
                condition: data.condition,
                state: data.state,
                userId: owner.id,
                reservedById: data.state === "reservado" ? reserver.id : null,
            });
            console.log(`+ Publicación: "${post.title}" (${post.state}) de ${owner.name}`);
        }

        console.log("Carga de datos inicial completada.");
        process.exit(0);
    } catch (error) {
        console.error("Error al ejecutar el sembrado de datos:", error);
        process.exit(1);
    }
}

run();
