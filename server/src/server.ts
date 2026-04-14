import dotenv from "dotenv";
dotenv.config();
console.log("ENV:", process.env.DATABASE_URL);
import express from "express";
import usersRoutes from "./modules/users/routes/users.routes.js";
console.log(process.env.DATABASE_URL);
const app = express();

// Permite receber JSON
app.use(express.json());

// Rotas
app.use("/users", usersRoutes);

// Porta
const PORT = 3000;

// Subir servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});