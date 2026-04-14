import express from "express";

import usersRoutes from "./modules/users/routes/users.routes.js";

app.use("/users", usersRoutes);