import { prisma } from "../../../config/prisma.js";

export class AuthRepository {

  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password_hash: true
      }
    });
  }

  async savePasswordResetToken(
    userId: string,
    token: string,
    expiresAt: Date
  ) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        reset_token: token,
        reset_token_expires_at: expiresAt
      }
    });
  }

  async findUserByResetToken(token: string) {
    return prisma.user.findFirst({
      where: {
        reset_token: token
      }
    });
  }

  async clearResetToken(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        reset_token: null,
        reset_token_expires_at: null
      }
    });
  }
}