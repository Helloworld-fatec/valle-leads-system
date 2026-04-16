import { AuthRepository } from "../repositories/auth.repository.js";
import { AppError } from "../../../../src/utils/appError.utils.js";
import { prisma } from "../../config/prisma.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export class AuthService {
  private repo = new AuthRepository();

  // 🔐 LOGIN
  async login(email: string, password: string) {
    const user = await this.repo.findUserByEmail(email);

    if (!user) {
      throw new AppError("Credenciais inválidas", 401);
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      throw new AppError("Credenciais inválidas", 401);
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    return { token };
  }

  // 📩 RECUPERAR SENHA
  async forgotPassword(email: string) {
    const user = await this.repo.findUserByEmail(email);

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    const rawToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1h

    await this.repo.savePasswordResetToken(
      user.id,
      hashedToken,
      expiresAt
    );

    console.log(`Token de reset: ${rawToken}`);

    return { message: "Email enviado" };
  }

  // 🔁 RESETAR SENHA
  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await this.repo.findUserByResetToken(hashedToken);

    if (!user) {
      throw new AppError("Token inválido", 403);
    }

    if (!user.reset_token_expires_at) {
      throw new AppError("Token inválido", 403);
    }

    if (user.reset_token_expires_at < new Date()) {
      throw new AppError("Token expirado", 410);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password_hash: hashedPassword
      }
    });

    await this.repo.clearResetToken(user.id);

    return { message: "Senha redefinida com sucesso" };
  }

  // 🔒 UPDATE PASSWORD (USUÁRIO LOGADO)
  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );

    if (!passwordMatch) {
      throw new AppError("Senha atual incorreta", 401);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password_hash: hashedPassword
      }
    });

    return { message: "Senha atualizada com sucesso" };
  }
}